import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

function ordinal(n: number) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

/** "26th April, 2026." as used on the insight cards. */
export function formatMonthYear(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${ordinal(Number(get("day")))} ${get("month")}, ${get("year")}.`;
}

export function formatLongDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
}

export function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, "")
    .replace(/,.*$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function isPending(text: string | null | undefined) {
  return !!text && text.includes("[PENDING FROM FIRM]");
}

export function telHref(phone: string | null | undefined) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.length >= 7 ? `tel:${digits}` : null;
}

export function readString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function readPage(value: string | string[] | undefined) {
  const n = Number(readString(value));
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Label the CMS navigation uses for a route, so back links read the same as the menu. */
export function navLabel(nav: { label: string; href: string; children?: { label: string; href: string }[] }[], href: string) {
  for (const item of nav) {
    if (item.href === href) return item.label;
    const child = item.children?.find((c) => c.href === href);
    if (child) return child.label;
  }
  return null;
}

/**
 * The CMS stamps every upload with a centre focal point (0.5, 0.5), which would override a
 * deliberate crop set with `object-*` classes. Treat that default as "no focal point"; any
 * focal point an editor actually set still wins.
 */
export function withoutDefaultFocus<T extends { focalPoint?: { x: number; y: number } | null }>(img: T): T {
  const f = img.focalPoint;
  return f && f.x === 0.5 && f.y === 0.5 ? { ...img, focalPoint: null } : img;
}
