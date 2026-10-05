/**
 * "Add to calendar" support: turns the booking's date and time text ("Wednesday, October 7, 2026",
 * "10:30 AM", Lagos time) into a real event: a Google Calendar link and a standard .ics file that
 * Apple Calendar, Outlook and others open.
 */

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const SLOT_MINUTES = 30;
const LAGOS_OFFSET_HOURS = 1; // Africa/Lagos is UTC+1 all year (no daylight saving)

export type Slot = { start: Date; end: Date };

export function parseSlot(date: string, time: string): Slot | null {
  const d = /([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(date);
  const t = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time);
  if (!d || !t) return null;
  const month = MONTHS.indexOf((d[1] ?? "").toLowerCase());
  if (month < 0) return null;
  const hour = (Number(t[1]) % 12) + (t[3] === "PM" ? 12 : 0);
  const start = new Date(Date.UTC(Number(d[3]), month, Number(d[2]), hour - LAGOS_OFFSET_HOURS, Number(t[2])));
  if (Number.isNaN(start.getTime())) return null;
  return { start, end: new Date(start.getTime() + SLOT_MINUTES * 60_000) };
}

const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export type EventInfo = { title: string; description: string; location: string; uid: string };

export function googleCalendarUrl(slot: Slot, ev: EventInfo): string {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${utc(slot.start)}/${utc(slot.end)}`,
    details: ev.description,
    location: ev.location,
    ctz: "Africa/Lagos",
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function icsFile(slot: Slot, ev: EventInfo): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SPA Ajibade & Co.//Discuss a Mandate//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ev.uid}@spaajibade.com`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(slot.start)}`,
    `DTEND:${utc(slot.end)}`,
    `SUMMARY:${esc(ev.title)}`,
    `DESCRIPTION:${esc(ev.description)}`,
    `LOCATION:${esc(ev.location)}`,
    "STATUS:TENTATIVE",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Appointment in 30 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
