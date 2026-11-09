import { isPending } from "@/lib/utils";

function excerpt(html: string | null | undefined, max = 240) {
  if (!html || isPending(html)) return null;
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "")}…`;
}

export function personCardSummary(bio: string | null | undefined, quote: string | null | undefined) {
  const bioExcerpt = excerpt(bio);
  if (bioExcerpt) return bioExcerpt;
  return quote && !isPending(quote) ? `“${quote.trim().replace(/^“|”$/g, "")}”` : null;
}
