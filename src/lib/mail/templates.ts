/**
 * Email templates for the "Discuss a Mandate" flow: one to the attorney's team, one confirmation to
 * the client. The wording is ported from the original booking server (Booking/server.js); the look
 * follows the site (black header with the white wordmark, serif headings, light cards). Layout uses
 * tables and inline styles so it renders in Gmail, Outlook and phone mail apps. Every value that
 * came from the visitor is HTML-escaped.
 */

export type DiscussEmailData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  description: string;
  staffName: string;
  staffRole: string;
  reference: string;
};

export type StaffEmailOptions = {
  /** Google Calendar link (the .ics file is attached separately). */
  calendarUrl?: string;
  /** Signed link to the page where the recipient types a team member's email to forward this to. */
  forwardUrl?: string;
  /** Set when this copy is itself a forward: who sent it on, and their optional note. */
  forwardedBy?: string;
  note?: string;
};

/** Content-ID the logo is attached under (see sendDiscussEmails). */
export const LOGO_CID = "spa-ajibade-logo";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const e = escapeHtml;
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const SITE = "https://spaajibade.com";

function layout({ title, preheader, body, hasLogo }: { title: string; preheader: string; body: string; hasLogo: boolean }) {
  const logo = hasLogo
    ? `<img src="cid:${LOGO_CID}" alt="SPA Ajibade &amp; Co." width="205" height="30" style="display:block;border:0;height:30px;width:auto;max-width:100%;" />`
    : `<span style="font-family:${SERIF};font-size:22px;color:#ffffff;letter-spacing:0.2px;">SPA Ajibade &amp; Co.</span>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${e(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f2f2f2;">${e(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f2f2;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#000000;padding:28px 32px;">${logo}</td>
        </tr>
        <tr>
          <td style="padding:36px 32px 12px 32px;font-family:${SANS};color:#1a1a1a;font-size:15px;line-height:1.65;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#000000;padding:26px 32px;font-family:${SANS};font-size:12px;line-height:1.7;color:#a3a3a3;">
            <div style="font-family:${SERIF};font-size:15px;color:#ffffff;margin-bottom:6px;">SPA Ajibade &amp; Co.</div>
            Legal Practitioners, Arbitrators and Notaries Public<br />
            Lagos &middot; Ibadan &middot; Abuja<br />
            <a href="${SITE}" style="color:#ffffff;text-decoration:underline;">spaajibade.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

const eyebrow = (t: string) =>
  `<div style="font-family:${SANS};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#737373;margin:0 0 10px 0;">${e(t)}</div>`;
const heading = (t: string) =>
  `<h1 style="font-family:${SERIF};font-weight:normal;font-size:28px;line-height:1.25;color:#000000;margin:0 0 18px 0;">${e(t)}</h1>`;
const para = (t: string) => `<p style="margin:0 0 18px 0;">${t}</p>`;

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #e6e6e6;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;color:#737373;width:38%;vertical-align:top;">${e(label)}</td>
    <td style="padding:9px 0;border-bottom:1px solid #e6e6e6;font-size:15px;color:#111111;vertical-align:top;">${value}</td>
  </tr>`;
}

function table(rows: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;">${rows}</table>`;
}

/** The highlighted "when and with whom" card. */
function summaryCard(d: DiscussEmailData, withLabel: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px 0;background:#f2f2f2;border-radius:10px;">
    <tr><td style="padding:20px 22px;">
      <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#737373;margin-bottom:6px;">Preferred time</div>
      <div style="font-family:${SERIF};font-size:21px;line-height:1.3;color:#000000;">${e(d.date)}</div>
      <div style="font-family:${SERIF};font-size:21px;line-height:1.3;color:#000000;margin-bottom:14px;">${e(d.time)}</div>
      <div style="font-size:12px;color:#525252;">${e(withLabel)} <strong style="color:#111111;">${e(d.staffName)}</strong>, ${e(d.staffRole)}</div>
      <div style="font-size:12px;color:#525252;margin-top:2px;">Reference <strong style="color:#111111;">${e(d.reference)}</strong></div>
    </td></tr>
  </table>`;
}

function button(href: string, label: string, dark = true) {
  const bg = dark ? "#000000" : "#ffffff";
  const fg = dark ? "#ffffff" : "#000000";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 10px 10px 0;"><tr>
    <td style="background:${bg};border:1px solid #000000;border-radius:6px;">
      <a href="${e(href)}" style="display:inline-block;padding:13px 22px;font-family:${SANS};font-size:14px;font-weight:600;color:${fg};text-decoration:none;">${e(label)}</a>
    </td></tr></table>`;
}

function steps(items: string[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;">${items
    .map(
      (t, i) => `<tr>
      <td style="width:34px;padding:8px 0;vertical-align:top;"><div style="width:24px;height:24px;border-radius:12px;background:#000000;color:#ffffff;font-size:12px;line-height:24px;text-align:center;">${i + 1}</div></td>
      <td style="padding:8px 0;font-size:14px;color:#262626;vertical-align:top;">${t}</td>
    </tr>`,
    )
    .join("")}</table>`;
}

const sectionTitle = (t: string) =>
  `<div style="font-family:${SERIF};font-size:18px;color:#000000;margin:6px 0 10px 0;">${e(t)}</div>`;

export function staffEmail(d: DiscussEmailData, hasLogo = false, opts: StaffEmailOptions = {}): { subject: string; html: string; text: string } {
  const description = d.description || "No specific description provided.";
  const phoneLink = d.phone ? `<a href="tel:${e(d.phone.replace(/[^\d+]/g, ""))}" style="color:#111111;">${e(d.phone)}</a>` : "Not provided";
  const forwardBanner = opts.forwardedBy
    ? `<div style="margin:0 0 22px 0;padding:14px 18px;background:#f2f2f2;border-radius:8px;font-size:14px;color:#262626;">
        <strong>Forwarded to you by ${e(opts.forwardedBy)}.</strong>${
          opts.note ? `<div style="margin-top:8px;white-space:pre-wrap;color:#404040;">&ldquo;${e(opts.note)}&rdquo;</div>` : ""
        }
      </div>`
    : "";
  const body = [
    eyebrow(opts.forwardedBy ? "Forwarded appointment request" : "New appointment request"),
    heading(`${d.firstName} ${d.lastName} would like to meet`),
    forwardBanner,
    para("Hello Team, a new client booking has been submitted via the Spaajibade website. Please review the details below and take the necessary action."),
    summaryCard(d, "Requested with"),
    sectionTitle("Client information"),
    table(
      row("First name", e(d.firstName)) +
        row("Last name", e(d.lastName)) +
        row("Email", `<a href="mailto:${e(d.email)}" style="color:#111111;">${e(d.email)}</a>`) +
        row("Phone", phoneLink),
    ),
    sectionTitle("Client request"),
    `<div style="margin:0 0 24px 0;padding:14px 18px;border-left:3px solid #000000;background:#fafafa;white-space:pre-wrap;font-size:15px;color:#262626;">${e(description)}</div>`,
    `<div style="margin:0 0 6px 0;">${button(`mailto:${d.email}?subject=${encodeURIComponent("Your appointment request, SPA Ajibade & Co.")}`, `Reply to ${d.firstName}`)}${
      d.phone ? button(`tel:${d.phone.replace(/[^\d+]/g, "")}`, "Call the client", false) : ""
    }</div>`,
    // A forwarded copy only keeps the calendar shortcut: the "Action required" explanation and the steps
    // already went out with the original email, so they are not repeated.
    ...(opts.forwardedBy
      ? [
          opts.calendarUrl
            ? `<div style="margin:0 0 22px 0;">${button(opts.calendarUrl, "Add to calendar")}</div>`
            : "",
        ]
      : [
          sectionTitle("Action required"),
          opts.calendarUrl || opts.forwardUrl
            ? `<div style="margin:0 0 6px 0;">${opts.calendarUrl ? button(opts.calendarUrl, "Add to calendar") : ""}${
                opts.forwardUrl ? button(opts.forwardUrl, "Forward to appropriate team member", false) : ""
              }</div>
      <div style="margin:0 0 18px 0;font-size:12px;color:#737373;">${
        opts.calendarUrl ? "Add to calendar opens Google Calendar; an .ics file is also attached for Outlook and Apple Calendar. " : ""
      }${opts.forwardUrl ? "Forward opens a page where you type the team member's email address." : ""}</div>`
            : "",
        ]),
    para("Please ensure this booking is handled promptly to maintain a smooth and professional client experience."),
    `<p style="margin:0 0 26px 0;color:#525252;">Best regards,<br />Spa Ajibade &amp; Co.<br />Booking System</p>`,
  ].join("\n");

  return {
    subject: `${opts.forwardedBy ? "Fwd: " : ""}New Appointment Request: ${d.firstName} ${d.lastName}`.replace(/[\r\n]+/g, " "),
    html: layout({ title: "New appointment request", preheader: `${d.firstName} ${d.lastName} requested ${d.date} at ${d.time}.`, body, hasLogo }),
    text: [
      ...(opts.forwardedBy ? [`Forwarded to you by ${opts.forwardedBy}.`, ...(opts.note ? [`"${opts.note}"`] : []), ""] : []),
      "Hello Team,",
      "",
      "A new client booking has been submitted via the Spaajibade website.",
      "",
      "CLIENT INFORMATION",
      `First Name: ${d.firstName}`,
      `Last Name: ${d.lastName}`,
      `Email Address: ${d.email}`,
      `Phone Number: ${d.phone || "Not provided"}`,
      "",
      "BOOKING DETAILS",
      `Requested With: ${d.staffName} (${d.staffRole})`,
      `Preferred Date: ${d.date}`,
      `Preferred Time: ${d.time}`,
      `Reference: ${d.reference}`,
      "",
      "CLIENT REQUEST",
      description,
      "",
      ...(opts.forwardedBy
        ? opts.calendarUrl
          ? [`Add to calendar: ${opts.calendarUrl}`, ""]
          : []
        : [
            "ACTION REQUIRED",
            ...(opts.calendarUrl ? [`- Add to calendar: ${opts.calendarUrl}`] : []),
            ...(opts.forwardUrl ? [`- Forward to appropriate team member: ${opts.forwardUrl}`] : []),
            "",
          ]),
      "Best regards,",
      "Spa Ajibade & Co.",
      "Booking System",
    ].join("\n"),
  };
}

export function clientEmail(d: DiscussEmailData, hasLogo = false): { subject: string; html: string; text: string } {
  const body = [
    eyebrow("Request received"),
    heading(`Thank you, ${d.firstName}.`),
    para("Thank you for reaching out to SPA Ajibade &amp; Co. We have received your appointment request and a member of our team will be in touch shortly to confirm your booking."),
    summaryCard(d, "Assigned to"),
    sectionTitle("What happens next"),
    steps([
      `Our team reviews ${e(d.staffName)}'s availability for the time you chose.`,
      `We contact you at <strong>${e(d.email)}</strong> to confirm, or to suggest another time.`,
      "Once confirmed, you will receive the details of your session.",
    ]),
    para("If you have any urgent enquiries, please do not hesitate to contact us directly."),
    `<p style="margin:0 0 26px 0;color:#525252;">Best regards,<br />Spa Ajibade &amp; Co.<br />Legal Practitioners, Arbitrators and Notaries Public</p>`,
  ].join("\n");

  return {
    subject: "We have received your booking request — SPA Ajibade & Co.",
    html: layout({ title: "We have received your booking request", preheader: `Your request for ${d.date} at ${d.time} has been received.`, body, hasLogo }),
    text: [
      `Dear ${d.firstName},`,
      "",
      "Thank you for reaching out to SPA Ajibade & Co. We have received your appointment request and a member of our team will be in touch shortly to confirm your booking.",
      "",
      "YOUR BOOKING SUMMARY",
      `Preferred Date: ${d.date}`,
      `Preferred Time: ${d.time}`,
      `Assigned To: ${d.staffName}`,
      `Reference: ${d.reference}`,
      "",
      "WHAT HAPPENS NEXT",
      `1. Our team reviews ${d.staffName}'s availability for the time you chose.`,
      `2. We contact you at ${d.email} to confirm, or to suggest another time.`,
      "3. Once confirmed, you will receive the details of your session.",
      "",
      "If you have any urgent enquiries, please do not hesitate to contact us directly.",
      "",
      "Best regards,",
      "Spa Ajibade & Co.",
      "Legal Practitioners, Arbitrators and Notaries Public",
    ].join("\n"),
  };
}
