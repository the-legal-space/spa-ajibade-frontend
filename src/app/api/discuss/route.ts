import { clientIp, hit, jsonResponder, preflight } from "@/lib/mail/http";
import { mailConfigured, newReference, sendDiscussEmails, validateDiscuss } from "@/lib/mail/discuss";
import { checkSlot, recordEmails, releaseSlot, reserveSlot } from "@/lib/discuss/bookings";

/**
 * POST /api/discuss: the "Discuss a Mandate" booking. Emails the chosen attorney's team and sends
 * the client a confirmation (nodemailer, see src/lib/mail/discuss.ts).
 *
 * Works for a static front end too: the page only needs this URL (NEXT_PUBLIC_MAIL_API_URL), so the
 * same route can be deployed on its own host and called cross-origin. Allowed origins come from
 * MAIL_ALLOWED_ORIGINS (comma separated; defaults to the site URL and localhost).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

export async function POST(req: Request) {
  const json = jsonResponder(req);
  const tooMany = (retryAfter: number) =>
    json({ ok: false, code: "RATE_LIMITED", message: "Too many requests. Please try again in a few minutes." }, 429, { "Retry-After": String(retryAfter) });

  // Rate limits, so nobody can use the form to flood the firm's inboxes (or a stranger's). Each is checked
  // before anything is sent: a burst limit per IP, a daily cap per IP, and (once the address is known) a cap
  // per client email, because the confirmation goes to whatever address was typed.
  const ip = clientIp(req);
  const burst = hit(`discuss:${ip}`, 5, 10 * 60 * 1000);
  if (burst.limited) return tooMany(burst.retryAfter);
  const daily = hit(`discuss-day:${ip}`, 20, 24 * 60 * 60 * 1000);
  if (daily.limited) return tooMany(daily.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, code: "BAD_REQUEST", message: "Invalid request." }, 400);
  }

  // Honeypot: bots fill every field. Pretend it worked, send nothing.
  const trap = body && typeof body === "object" ? (body as Record<string, unknown>).website : undefined;
  if (typeof trap === "string" && trap.trim() !== "") return json({ ok: true, reference: "MND-000000" }, 201);

  const parsed = validateDiscuss(body);
  if (!parsed.ok) return json({ ok: false, code: "VALIDATION_ERROR", message: "Please check the highlighted fields.", errors: parsed.errors }, 400);

  const perEmail = hit(`discuss-email:${parsed.data.email.toLowerCase()}`, 3, 60 * 60 * 1000);
  if (perEmail.limited) return tooMany(perEmail.retryAfter);

  // The slot must be a real, future working-day time on the firm's list.
  const slot = checkSlot(parsed.data.staffId, parsed.data.date, parsed.data.time);
  if (!slot.ok) return json({ ok: false, code: "VALIDATION_ERROR", message: "Please check the date and time.", errors: slot.errors }, 400);

  if (!mailConfigured()) {
    console.error("[mail] not configured: set MAIL_USER and MAIL_PASS (and SMTP_HOST if not Gmail)");
    return json({ ok: false, code: "MAIL_NOT_CONFIGURED", message: "Email is not set up on the server yet." }, 503);
  }

  // Claim the slot before anything is sent. The database allows one active booking per attorney, date and
  // time, so if two visitors confirm the same slot together, exactly one of them gets it.
  const reference = newReference();
  const reservation = await reserveSlot({
    reference,
    staffId: parsed.data.staffId,
    isoDate: slot.isoDate,
    start: slot.start,
    time: parsed.data.time,
    client: { firstName: parsed.data.firstName, lastName: parsed.data.lastName, email: parsed.data.email, phone: parsed.data.phone },
    description: parsed.data.description,
  });
  if (!reservation.ok) {
    return json({ ok: false, code: "SLOT_TAKEN", message: "Sorry, that time has just been booked. Please choose another time." }, 409);
  }

  try {
    const result = await sendDiscussEmails(parsed.data, reference);
    await recordEmails(reservation.id, { staff: result.staffSent, client: result.clientSent });
    if (!result.staffSent) {
      await releaseSlot(reservation.id); // nobody was told, so the time goes back on offer
      return json({ ok: false, code: "SEND_FAILED", message: "We couldn't send your request. Please try again or call the firm." }, 502);
    }
    return json({ ok: true, reference: result.reference, clientEmailSent: result.clientSent }, 201);
  } catch (err) {
    console.error("[mail] unexpected error:", err);
    await releaseSlot(reservation.id);
    return json({ ok: false, code: "SEND_FAILED", message: "We couldn't send your request. Please try again or call the firm." }, 502);
  }
}
