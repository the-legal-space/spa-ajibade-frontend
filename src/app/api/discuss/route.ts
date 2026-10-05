import { jsonResponder, preflight, rateLimited } from "@/lib/mail/http";
import { mailConfigured, sendDiscussEmails, validateDiscuss } from "@/lib/mail/discuss";

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

  if (rateLimited("discuss", req)) return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests. Please try again in a few minutes." }, 429);

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

  if (!mailConfigured()) {
    console.error("[mail] not configured: set MAIL_USER and MAIL_PASS (and SMTP_HOST if not Gmail)");
    return json({ ok: false, code: "MAIL_NOT_CONFIGURED", message: "Email is not set up on the server yet." }, 503);
  }

  try {
    const result = await sendDiscussEmails(parsed.data);
    if (!result.staffSent) return json({ ok: false, code: "SEND_FAILED", message: "We couldn't send your request. Please try again or call the firm." }, 502);
    return json({ ok: true, reference: result.reference, clientEmailSent: result.clientSent }, 201);
  } catch (err) {
    console.error("[mail] unexpected error:", err);
    return json({ ok: false, code: "SEND_FAILED", message: "We couldn't send your request. Please try again or call the firm." }, 502);
  }
}
