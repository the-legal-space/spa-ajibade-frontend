import type { Metadata } from "next";
import type { Seo, SeoBasic } from "@/lib/api/schemas";

/** The site's own title (home page, browser tab, link previews), as the firm approved it. */
export const SITE_TITLE = "S.P.A. Ajibade & Co.";
export const SITE_NAME = "S.P.A. Ajibade & Co.";
export const SITE_DESCRIPTION =
  "Commercial law firm in Lagos, Abuja and Ibadan. Counsel to institutions shaping Nigeria's economy since 1967.";

/** Link-preview image (public/og-image.jpg: the homepage header and hero) for pages whose CMS entry has none. */
export const DEFAULT_OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "S.P.A. Ajibade & Co., Lagos, Abuja and Ibadan" };

/** Turns a CMS seo block into Next metadata, with sensible fallbacks. */
export function pageMetadata(
  seo: Seo | SeoBasic | undefined,
  fallback: { title?: string; description?: string | null; path: string; absoluteTitle?: boolean },
): Metadata {
  const title = seo?.title ?? fallback.title;
  const description = seo?.description ?? fallback.description ?? undefined;
  const og = seo && "ogImage" in seo ? seo.ogImage : undefined;
  return {
    // Leave title out when there is none: an explicit `title: undefined` would erase the layout's default title.
    ...(title ? { title: fallback.absoluteTitle ? { absolute: title } : title } : {}),
    description,
    alternates: { canonical: fallback.path },
    openGraph: {
      title: title ?? SITE_TITLE,
      siteName: SITE_NAME,
      type: "website",
      description,
      url: fallback.path,
      // A page's openGraph replaces the layout's whole block, so the default image has to be repeated here.
      images: og ? [{ url: og.sizes?.lg ?? og.url, width: og.width, height: og.height, alt: og.alt }] : [DEFAULT_OG_IMAGE],
    },
  };
}
