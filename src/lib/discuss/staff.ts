/**
 * "Discuss a Mandate" booking flow: attorney list, working hours and date helpers.
 * Ported from the holding page's /book app.
 */

export type StaffMember = {
  id: string;
  /** The attorney's slug in the CMS, when they have a profile page. */
  slug?: string;
  name: string;
  role: string;
  departments: string[];
  email: string;
  highlight?: boolean;
};

export type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

export const EMPTY_USER_INFO: UserInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
};

export const STAFF: StaffMember[] = [
  {
    id: "babatunde",
    slug: "babatunde-ajibade",
    name: "Dr. Babatunde Ajibade, SAN",
    role: "Managing Partner",
    departments: ["Dispute Resolution", "Corporate Finance", "Real Estate"],
    email: "bajibade@spaajibade.com",
    highlight: false,
  },
  {
    id: "john",
    slug: "john-onyido",
    name: "Dr. John Onyido",
    role: "Partner",
    departments: ["Intellectual Property & Technology"],
    email: "jonyido@spaajibade.com",
    highlight: false,
  },
  {
    id: "kolawole",
    slug: "kolawole-mayomi",
    name: "Dr. Kolawole Mayomi",
    role: "Partner",
    departments: ["Dispute Resolution"],
    email: "kmayomi@spaajibade.com",
    highlight: false,
  },
  {
    id: "olubanke",
    name: "Olubanke Afolabi-Johnson",
    role: "Chief Operating Officer",
    departments: ["Cross Departmental"],
    email: "oafolabijohnson@spaajibade.com",
    highlight: true,
  },
  {
    id: "olalere",
    slug: "peter-olalere",
    name: "Peter Olalere",
    role: "Associate Partner",
    departments: ["Dispute Resolution", "Energy and Natural Resources"],
    email: "oolalere@spaajibade.com",
    highlight: false,
  },
  {
    id: "magnus",
    slug: "magnus-ejelonu",
    name: "Magnus Ejelonu",
    role: "Associate Partner",
    departments: ["Energy & Natural Resources"],
    email: "mejelonu@spaajibade.com",
    highlight: false,
  },
  {
    id: "bolaji",
    slug: "bolaji-gabari",
    name: "Bolaji Gabari",
    role: "Associate Partner",
    departments: ["Corporate Finance"],
    email: "bgabari@spaajibade.com",
    highlight: false,
  },
  {
    id: "moruf",
    slug: "moruf-sowunmi",
    name: "Moruf Sowunmi",
    role: "Associate Partner",
    departments: ["Real Estate & Succession"],
    email: "msowunmi@spaajibade.com",
    highlight: false,
  },
];

/**
 * Working hours config.
 * Days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 */
export const WORKING_HOURS: {
  workDays: number[];
  startHour: number;
  endHour: number;
  slotMins: number;
  lunchStart: number;
  lunchEnd: number;
} = {
  workDays: [1, 2, 3, 4, 5],
  startHour: 9,
  endHour: 17,
  slotMins: 30,
  lunchStart: 13,
  lunchEnd: 14,
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAY_NAMES_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

/** Returns initials from a full name. e.g. "Dr. Babatunde Ajibade, SAN" → "BA" */
export function getInitials(name: string): string {
  const clean = name
    .replace(/\b(Dr|Mr|Mrs|Ms|Prof|SAN|PhD|Esq)\b\.?/gi, "")
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first || !last) return "?";
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/** Returns the list of bookable time slots (excluding lunch break). */
export function getSlotsForDate(): string[] {
  const slots: string[] = [];
  const { startHour, endHour, slotMins, lunchStart, lunchEnd } = WORKING_HOURS;
  let hour = startHour;
  let min = 0;

  while (hour < endHour) {
    if (!(hour >= lunchStart && hour < lunchEnd)) {
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const mm = min === 0 ? "00" : String(min);
      slots.push(`${h12}:${mm} ${ampm}`);
    }
    min += slotMins;
    if (min >= 60) {
      min -= 60;
      hour++;
    }
  }

  return slots;
}

/** Slots still open on a given day: for today, only those that start after the current time. */
export function slotsForDay(date: Date): string[] {
  const all = getSlotsForDate();
  const now = new Date();
  if (date.toDateString() !== now.toDateString()) return all;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return all.filter((slot) => {
    const m = /^(\d+):(\d+) (AM|PM)$/.exec(slot);
    if (!m) return true;
    const hour = (Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0);
    return hour * 60 + Number(m[2]) > nowMins;
  });
}

/** A date is bookable if it is a working day and, for today, still has an open slot. */
export function isAvailable(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  if (!WORKING_HOURS.workDays.includes(date.getDay())) return false;
  return slotsForDay(date).length > 0;
}

/** e.g. "Sunday, January 4, 2026" */
export function formatFullDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** e.g. "Sun, Jan 4" */
export function formatShortDate(date: Date): string {
  return `${DAY_NAMES_SHORT[date.getDay()]}, ${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/** e.g. "Sunday, January 4\n10:30 AM" */
export function formatSummary(date: Date, slot: string): string {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}\n${slot}`;
}

/** Validates an email address. */
export function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}
