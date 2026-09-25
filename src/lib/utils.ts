import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** "June, 2026." as used on the insight cards in the designs. */
export function formatMonthYear(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "Africa/Lagos" });
  return `${month}, ${d.getUTCFullYear()}.`;
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
