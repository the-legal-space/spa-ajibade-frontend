import { jsonResponder, preflight, rateLimited } from "@/lib/mail/http";
import { mailConfigured, sendForwardEmail, validateForward } from "@/lib/mail/discuss";
import { verifyForwardToken } from "@/lib/mail/token";

/**
 * POST /api/discuss/forward: "Forward to another associate". The link in the attorney email carries a
 * signed token; this checks it, then sends the same booking email to the address that was typed.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

export async function POST(req: Request) {
  const json = jsonResponder(req);

  if (rateLimited("forward", req, 10)) return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests. Please try again in a few minutes." }, 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, code: "BAD_REQUEST", message: "Invalid request." }, 400);
  }

  const token = body && typeof body === "object" ? (body as Record<string, unknown>).token : undefined;
  const payload = typeof token === "string" ? verifyForwardToken(token) : null;
  if (!payload) return json({ ok: false, code: "INVALID_LINK", message: "This link is invalid or has expired. Please use the link in the original email." }, 400);

  const parsed = validateForward(body);
  if (!parsed.ok) return json({ ok: false, code: "VALIDATION_ERROR", message: "Please check the email address.", errors: parsed.errors }, 400);

  if (!mailConfigured()) return json({ ok: false, code: "MAIL_NOT_CONFIGURED", message: "Email is not set up on the server yet." }, 503);

  const { sent } = await sendForwardEmail(payload, parsed.data);
  if (!sent) return json({ ok: false, code: "SEND_FAILED", message: "We couldn't forward the booking. Please try again." }, 502);
  return json({ ok: true, to: parsed.data.to }, 200);
}
