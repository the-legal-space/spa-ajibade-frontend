import { getTransport, mailParts } from "./discuss";
import { officeMessageEmail, senderMessageEmail, type MessageEmailData } from "./templates";

/**
 * "Message the firm" mail: the message to the office inbox and an automatic confirmation to the sender.
 * Server-side only; used by /api/discuss/message. Same SMTP settings as "Discuss a Mandate", plus:
 *   MAIL_MESSAGE_TO   inbox that receives the messages (default lagosoffice@spaajibade.com)
 * While MAIL_TEST_RECIPIENT is set, the office copy goes there instead.
 */

const DEFAULT_MESSAGE_TO = "lagosoffice@spaajibade.com";

export type MessageInput = Omit<MessageEmailData, "reference">;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateMessage(body: unknown): { ok: true; data: MessageInput; reference: string } | { ok: false; errors: Record<string, string> } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const data: MessageInput = {
    fullName: str(b.fullName),
    email: str(b.email),
    phone: str(b.phone),
    subject: str(b.subject),
    message: str(b.message),
  };
  // The reference the backend gave the message, so both emails quote the same one as the form.
  const reference = str(b.reference).slice(0, 40) || "—";
  const errors: Record<string, string> = {};
  if (data.fullName.length < 2 || data.fullName.length > 120) errors.fullName = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254) errors.email = "Please enter a valid email address.";
  if (data.phone && !/^[\d\s+()-]{7,20}$/.test(data.phone)) errors.phone = "Please enter a valid phone number.";
  if (data.subject.length > 200) errors.subject = "Please keep the subject under 200 characters.";
  if (data.message.length < 10) errors.message = "Please write at least 10 characters.";
  else if (data.message.length > 2000) errors.message = "Please keep the message under 2000 characters.";
  if (b.consent !== true) errors.consent = "Consent is required.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data, reference };
}

export async function sendMessageEmails(input: MessageInput, reference: string): Promise<{ officeSent: boolean; senderSent: boolean }> {
  const transport = getTransport();
  if (!transport) throw new Error("MAIL_NOT_CONFIGURED");

  const user = process.env.MAIL_USER || process.env.EMAIL_USER || "no-reply@localhost";
  const from = process.env.MAIL_FROM || `"SPA Ajibade & Co." <${user}>`;
  const test = process.env.MAIL_TEST_RECIPIENT;
  const { hasLogo, logo } = mailParts(from);
  const data: MessageEmailData = { ...input, reference };
  const toOffice = officeMessageEmail(data, hasLogo);
  const toSender = senderMessageEmail(data, hasLogo);

  const [officeRes, senderRes] = await Promise.allSettled([
    transport.sendMail({
      from,
      to: test || process.env.MAIL_MESSAGE_TO || DEFAULT_MESSAGE_TO,
      replyTo: input.email,
      subject: (test ? "[TEST] " : "") + toOffice.subject,
      html: toOffice.html,
      text: toOffice.text,
      attachments: logo,
    }),
    transport.sendMail({
      from,
      to: input.email,
      subject: toSender.subject,
      html: toSender.html,
      text: toSender.text,
      attachments: logo,
    }),
  ]);

  if (process.env.MAIL_DRY_RUN === "1") {
    for (const r of [officeRes, senderRes]) if (r.status === "fulfilled") console.info("[mail dry-run]", (r.value as { message?: string }).message);
  }
  if (officeRes.status === "rejected") console.error("[mail] office message email failed:", officeRes.reason?.message ?? officeRes.reason);
  if (senderRes.status === "rejected") console.error("[mail] sender confirmation failed:", senderRes.reason?.message ?? senderRes.reason);
  return { officeSent: officeRes.status === "fulfilled", senderSent: senderRes.status === "fulfilled" };
}
