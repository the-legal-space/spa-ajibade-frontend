import nodemailer, { type Transporter } from "nodemailer";
import { STAFF } from "@/lib/discuss/staff";
import { existsSync } from "node:fs";
import path from "node:path";
import { LOGO_CID, clientEmail, staffEmail, type DiscussEmailData } from "./templates";
import { googleCalendarUrl, icsFile, parseSlot } from "./calendar";
import { createForwardToken, type ForwardPayload } from "./token";

/**
 * "Discuss a Mandate" mail: validation of the submission, the SMTP transport, and the two emails
 * (attorney's team + client confirmation). Server-side only; used by /api/discuss.
 *
 * Configuration (environment variables, never committed):
 *   MAIL_USER / MAIL_PASS   SMTP login (EMAIL_USER / EMAIL_PASS are accepted too)
 *   SMTP_HOST, SMTP_PORT    default smtp.gmail.com : 465 (SSL). Use any SMTP provider, e.g. Brevo.
 *   MAIL_FROM               "SPA Ajibade & Co." <address>. Defaults to MAIL_USER.
 *   MAIL_BCC                optional extra inbox copied on the attorney email (e.g. the front office)
 *   MAIL_TEST_RECIPIENT     while testing, both emails go here instead of the real attorney/client
 *   MAIL_DRY_RUN=1          build and log the emails without sending anything
 */

export type DiscussInput = {
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  description: string;
};

export type Validation = { ok: true; data: DiscussInput } | { ok: false; errors: Record<string, string> };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateDiscuss(body: unknown): Validation {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const data: DiscussInput = {
    staffId: str(b.staffId),
    firstName: str(b.firstName),
    lastName: str(b.lastName),
    email: str(b.email),
    phone: str(b.phone),
    date: str(b.date),
    time: str(b.time),
    description: str(b.description),
  };
  const errors: Record<string, string> = {};
  if (!STAFF.some((s) => s.id === data.staffId)) errors.staffId = "Please choose who you would like to meet.";
  if (data.firstName.length < 1 || data.firstName.length > 60) errors.firstName = "First name is required.";
  if (data.lastName.length < 1 || data.lastName.length > 60) errors.lastName = "Last name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254) errors.email = "Please enter a valid email address.";
  if (!data.phone) errors.phone = "Phone number is required.";
  else if (!/^[\d\s+()-]{7,20}$/.test(data.phone)) errors.phone = "Please enter a valid phone number.";
  if (data.date.length < 6 || data.date.length > 60) errors.date = "Please choose a date.";
  if (!/^\d{1,2}:\d{2} (AM|PM)$/.test(data.time)) errors.time = "Please choose a time.";
  if (!data.description) errors.description = "Please tell us briefly what you need help with.";
  else if (data.description.length > 2000) errors.description = "Please keep the description under 2000 characters.";
  if (b.consent !== true) errors.consent = "Consent is required.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

let cached: Transporter | null | undefined;

function getTransport(): Transporter | null {
  if (process.env.MAIL_DRY_RUN === "1") return nodemailer.createTransport({ jsonTransport: true });
  if (cached !== undefined) return cached;
  const user = process.env.MAIL_USER || process.env.EMAIL_USER;
  const rawPass = process.env.MAIL_PASS || process.env.EMAIL_PASS;
  if (!user || !rawPass) return (cached = null);
  // Google shows app passwords as four groups of four ("abcd efgh ijkl mnop"); the spaces are not part of it.
  const pass = /^[a-z]{4}( [a-z]{4}){3}$/i.test(rawPass.trim()) ? rawPass.replace(/\s+/g, "") : rawPass.trim();
  const port = Number(process.env.SMTP_PORT || 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user, pass },
  });
  return cached;
}

export function mailConfigured() {
  return process.env.MAIL_DRY_RUN === "1" || !!((process.env.MAIL_USER || process.env.EMAIL_USER) && (process.env.MAIL_PASS || process.env.EMAIL_PASS));
}

export type SendResult = { reference: string; staffSent: boolean; clientSent: boolean };

export function newReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `MND-${out}`;
}

const siteBase = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Calendar link + .ics file + signed forward link for one booking. */
function bookingExtras(data: DiscussEmailData, staffId: string) {
  const slot = parseSlot(data.date, data.time);
  const event = {
    title: `Appointment: ${data.firstName} ${data.lastName} with ${data.staffName}`,
    description: [
      `Client: ${data.firstName} ${data.lastName}`,
      `Email: ${data.email}`,
      data.phone ? `Phone: ${data.phone}` : "",
      `Reference: ${data.reference}`,
      "",
      data.description || "No specific description provided.",
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n"),
    location: "Microsoft Teams (details to follow)",
    uid: data.reference,
  };
  const token = createForwardToken({
    ref: data.reference,
    f: data.firstName,
    l: data.lastName,
    e: data.email,
    p: data.phone,
    d: data.date,
    t: data.time,
    s: staffId,
    m: data.description,
  });
  return {
    calendarUrl: slot ? googleCalendarUrl(slot, event) : undefined,
    ics: slot ? icsFile(slot, event) : undefined,
    forwardUrl: `${siteBase()}/forward?t=${token}`,
  };
}

function mailParts(from: string) {
  const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
  const hasLogo = existsSync(logoPath);
  return { from, hasLogo, logo: hasLogo ? [{ filename: "logo.png", path: logoPath, cid: LOGO_CID }] : [] };
}

/** Sends the attorney email and the client confirmation. Throws only if the transport is missing. */
export async function sendDiscussEmails(input: DiscussInput): Promise<SendResult> {
  const transport = getTransport();
  if (!transport) throw new Error("MAIL_NOT_CONFIGURED");

  const staff = STAFF.find((s) => s.id === input.staffId)!;
  const reference = newReference();
  const data: DiscussEmailData = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    date: input.date,
    time: input.time,
    description: input.description,
    staffName: staff.name,
    staffRole: staff.role,
    reference,
  };

  const user = process.env.MAIL_USER || process.env.EMAIL_USER || "no-reply@localhost";
  const from = process.env.MAIL_FROM || `"SPA Ajibade & Co." <${user}>`;
  const test = process.env.MAIL_TEST_RECIPIENT;
  const tag = test ? "[TEST] " : "";

  // The white wordmark is attached inline (cid:) so it shows without relying on a public image URL,
  // which also keeps this working when the endpoint is hosted apart from the site.
  const { hasLogo, logo } = mailParts(from);
  const extras = bookingExtras(data, input.staffId);
  const icsAttachment = extras.ics
    ? [{ filename: "appointment.ics", content: extras.ics, contentType: "text/calendar; charset=utf-8; method=PUBLISH" }]
    : [];
  const attachments = [...logo, ...icsAttachment];

  const toStaff = staffEmail(data, hasLogo, { calendarUrl: extras.calendarUrl, forwardUrl: extras.forwardUrl });
  const toClient = clientEmail(data, hasLogo);

  const [staffRes, clientRes] = await Promise.allSettled([
    transport.sendMail({
      from,
      to: test || staff.email,
      bcc: test ? undefined : process.env.MAIL_BCC || undefined,
      replyTo: input.email,
      subject: tag + toStaff.subject,
      html: toStaff.html,
      text: toStaff.text,
      attachments,
    }),
    transport.sendMail({
      from,
      to: test || input.email,
      subject: tag + toClient.subject,
      html: toClient.html,
      text: toClient.text,
      attachments: logo, // the client confirmation carries only the logo: no calendar button or .ics
    }),
  ]);

  if (process.env.MAIL_DRY_RUN === "1") {
    for (const r of [staffRes, clientRes]) if (r.status === "fulfilled") console.info("[mail dry-run]", (r.value as { message?: string }).message);
  }
  if (staffRes.status === "rejected") console.error("[mail] attorney email failed:", staffRes.reason?.message ?? staffRes.reason);
  if (clientRes.status === "rejected") console.error("[mail] client email failed:", clientRes.reason?.message ?? clientRes.reason);
  return { reference, staffSent: staffRes.status === "fulfilled", clientSent: clientRes.status === "fulfilled" };
}


const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;

export type ForwardInput = { to: string; fromName: string; note: string };

/** Which addresses a booking may be forwarded to. Defaults to the firm's own domain. */
function forwardAllowed(to: string) {
  if (process.env.MAIL_TEST_RECIPIENT) return true; // everything is redirected while testing
  const domains = (process.env.MAIL_FORWARD_DOMAINS || "spaajibade.com").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  const domain = to.split("@")[1]?.toLowerCase() ?? "";
  return domains.includes(domain) || STAFF.some((s) => s.email.toLowerCase() === to.toLowerCase());
}

export function validateForward(body: unknown): { ok: true; data: ForwardInput } | { ok: false; errors: Record<string, string> } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const to = str(b.to);
  const fromName = str(b.fromName).slice(0, 80);
  const note = str(b.note).slice(0, 600);
  const errors: Record<string, string> = {};
  if (!isEmail(to)) errors.to = "Please enter a valid email address.";
  else if (!forwardAllowed(to)) errors.to = "You can only forward to a firm email address (@spaajibade.com).";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: { to, fromName, note } };
}

/** Sends the booking on to the appropriate team member (same email, plus a "forwarded by" banner). */
export async function sendForwardEmail(p: ForwardPayload, input: ForwardInput): Promise<{ sent: boolean }> {
  const transport = getTransport();
  if (!transport) throw new Error("MAIL_NOT_CONFIGURED");
  const staff = STAFF.find((s) => s.id === p.s);
  if (!staff) return { sent: false };

  const data: DiscussEmailData = {
    firstName: p.f, lastName: p.l, email: p.e, phone: p.p, date: p.d, time: p.t, description: p.m,
    staffName: staff.name, staffRole: staff.role, reference: p.ref,
  };
  const user = process.env.MAIL_USER || process.env.EMAIL_USER || "no-reply@localhost";
  const from = process.env.MAIL_FROM || `"SPA Ajibade & Co." <${user}>`;
  const { hasLogo, logo } = mailParts(from);
  const extras = bookingExtras(data, p.s);
  const test = process.env.MAIL_TEST_RECIPIENT;
  const mail = staffEmail(data, hasLogo, {
    calendarUrl: extras.calendarUrl,
    forwardUrl: extras.forwardUrl,
    forwardedBy: input.fromName || `${staff.name}'s team`,
    note: input.note,
  });
  try {
    const info = await transport.sendMail({
      from,
      to: test || input.to,
      replyTo: p.e,
      subject: (test ? "[TEST] " : "") + mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: [...logo, ...(extras.ics ? [{ filename: "appointment.ics", content: extras.ics, contentType: "text/calendar; charset=utf-8; method=PUBLISH" }] : [])],
    });
    if (process.env.MAIL_DRY_RUN === "1") console.info("[mail dry-run]", (info as { message?: string }).message);
    return { sent: true };
  } catch (err) {
    console.error("[mail] forward failed:", (err as Error)?.message ?? err);
    return { sent: false };
  }
}
