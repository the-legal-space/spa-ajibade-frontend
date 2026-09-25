import type { Metadata } from "next";
import type { Seo } from "@/lib/api/schemas";

/** Turns a CMS seo block into Next metadata, with sensible fallbacks. */
export function pageMetadata(
  seo: Seo | undefined,
  fallback: { title?: string; description?: string | null; path: string; absoluteTitle?: boolean },
): Metadata {
  const title = seo?.title ?? fallback.title;
  const description = seo?.description ?? fallback.description ?? undefined;
  const og = seo?.ogImage;
  return {
    title: title ? (fallback.absoluteTitle ? { absolute: title } : title) : undefined,
    description,
    alternates: { canonical: fallback.path },
    openGraph: {
      title: title ?? undefined,
      description,
      url: fallback.path,
      images: og ? [{ url: og.sizes?.lg ?? og.url, width: og.width, height: og.height, alt: og.alt }] : undefined,
    },
  };
}
