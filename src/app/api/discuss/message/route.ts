import { clientIp, hit, jsonResponder, preflight } from "@/lib/mail/http";
import { mailConfigured } from "@/lib/mail/discuss";
import { sendMessageEmails, validateMessage } from "@/lib/mail/message";

/**
 * POST /api/discuss/message: "Message the firm". The form first submits to the backend (POST /messages,
 * which stores it and checks the security token); on success it posts here so the message is emailed to the
 * office inbox (MAIL_MESSAGE_TO, default lagosoffice@spaajibade.com) and the sender gets a confirmation.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

export async function POST(req: Request) {
  const json = jsonResponder(req);
  const tooMany = (retryAfter: number) =>
    json({ ok: false, code: "RATE_LIMITED", message: "Too many requests. Please try again in a few minutes." }, 429, { "Retry-After": String(retryAfter) });

  // Same limits as the booking route, so the form can't be used to flood the office inbox or a stranger's.
  const ip = clientIp(req);
  const burst = hit(`message:${ip}`, 5, 10 * 60 * 1000);
  if (burst.limited) return tooMany(burst.retryAfter);
  const daily = hit(`message-day:${ip}`, 20, 24 * 60 * 60 * 1000);
  if (daily.limited) return tooMany(daily.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, code: "BAD_REQUEST", message: "Invalid request." }, 400);
  }

  // Honeypot: bots fill every field. Pretend it worked, send nothing.
  const trap = body && typeof body === "object" ? (body as Record<string, unknown>).website : undefined;
  if (typeof trap === "string" && trap.trim() !== "") return json({ ok: true }, 201);

  const parsed = validateMessage(body);
  if (!parsed.ok) return json({ ok: false, code: "VALIDATION_ERROR", message: "Please check the highlighted fields.", errors: parsed.errors }, 400);

  const perEmail = hit(`message-email:${parsed.data.email.toLowerCase()}`, 3, 60 * 60 * 1000);
  if (perEmail.limited) return tooMany(perEmail.retryAfter);

  if (!mailConfigured()) {
    console.error("[mail] not configured: set MAIL_USER and MAIL_PASS (and SMTP_HOST if not Gmail)");
    return json({ ok: false, code: "MAIL_NOT_CONFIGURED", message: "Email is not set up on the server yet." }, 503);
  }

  try {
    const result = await sendMessageEmails(parsed.data, parsed.reference);
    if (!result.officeSent) return json({ ok: false, code: "SEND_FAILED", message: "We couldn't send your message." }, 502);
    return json({ ok: true, senderEmailSent: result.senderSent }, 201);
  } catch (err) {
    console.error("[mail] unexpected error:", err);
    return json({ ok: false, code: "SEND_FAILED", message: "We couldn't send your message." }, 502);
  }
}
