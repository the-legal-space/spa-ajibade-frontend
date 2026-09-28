import type { ApiImage } from "@/lib/api/schemas";
import { cn, initials } from "@/lib/utils";

/**
 * Inject a `w_<width>` transformation into a Cloudinary upload URL.
 *
 * Cloudinary upload URLs look like:
 *   https://res.cloudinary.com/<cloud>/image/upload/<optional-transforms>/<folder>/<public-id>
 *
 * We replace whatever transformation chain the backend built (which may be
 * invalid — e.g. `g_xy_center` with proportional coordinates causes HTTP 400)
 * with a clean `f_auto,q_auto,w_<width>` chain.
 *
 * A path segment is considered a transformation if it contains a comma or an
 * underscore followed by digits (e.g. `w_960`, `f_auto,q_auto`). Segments that
 * look like a folder or filename are kept as the public ID.
 *
 * For non-Cloudinary URLs the original URL is returned unchanged.
 */
function cloudinaryResize(url: string, width: number): string {
  const uploadMarker = "/image/upload/";
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;

  const base = url.slice(0, idx + uploadMarker.length); // "…/image/upload/"
  const rest = url.slice(base.length); // everything after "/upload/"

  // Split into path segments; discard leading segments that look like Cloudinary
  // named transformations (contain "," or match "key_value" patterns like "w_960").
  const transformSegmentRe = /^([a-z]{1,3}_[^/,]+|[a-z_]+,[a-z_]+)/;
  const segments = rest.split("/");
  let i = 0;
  while (i < segments.length - 1) {
    const segment = segments[i];
    if (!segment || !transformSegmentRe.test(segment)) break;
    i++;
  }
  const publicId = segments.slice(i).join("/");

  return `${base}f_auto,q_auto,w_${width}/${publicId}`;
}

/** True if this looks like a Cloudinary upload URL we can rewrite. */
function isCloudinaryUrl(url: string) {
  return url.includes("res.cloudinary.com") && url.includes("/image/upload/");
}

/**
 * Every image field is nullable, and right now they are all null (no photos uploaded yet).
 * <Media> renders the API image with a responsive srcset, or a deliberate placeholder
 * that still looks intentional on a live site.
 *
 * NOTE: The pre-built `sizes` URLs from the API may contain invalid Cloudinary
 * transformations (e.g. `g_xy_center` with proportional coordinates) that return
 * HTTP 400. We therefore ignore the API-provided `sizes` entirely and derive our
 * own srcset from the base `image.url` instead.
 */
export function Media({
  image,
  alt,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  placeholder = "pattern",
  name,
}: {
  image: ApiImage | null | undefined;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: "pattern" | "portrait" | "dark";
  name?: string;
}) {
  if (image?.url) {
    const fp = image.focalPoint;

    // Build a clean responsive srcset. For Cloudinary URLs we rewrite the
    // transformation chain ourselves (bypassing any invalid pre-built URLs).
    // For other CDNs we just use the base URL without a srcset.
    const srcSet = isCloudinaryUrl(image.url)
      ? [
          `${cloudinaryResize(image.url, 480)} 480w`,
          `${cloudinaryResize(image.url, 960)} 960w`,
          `${cloudinaryResize(image.url, 1600)} 1600w`,
        ].join(", ")
      : undefined;

    const src = isCloudinaryUrl(image.url) ? cloudinaryResize(image.url, 1600) : image.url;

    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt ?? image.alt ?? ""}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn("size-full object-cover", className)}
        style={fp ? { objectPosition: `${fp.x * 100}% ${fp.y * 100}%` } : undefined}
      />
    );
  }

  if (placeholder === "portrait") {
    return (
      <div
        role="img"
        aria-label={alt ?? (name ? `Portrait of ${name} coming soon` : "Photo coming soon")}
        className={cn("flex size-full items-center justify-center bg-[#56697a]", className)}
      >
        <span className="font-serif text-5xl text-white/70">{name ? initials(name) : ""}</span>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "relative size-full overflow-hidden",
        placeholder === "dark" ? "bg-ink-800" : "bg-mist-200",
        className,
      )}
    >
      <svg className={cn("absolute inset-0 size-full", placeholder === "dark" ? "text-white/5" : "text-ink/[0.06]")} aria-hidden>
        <defs>
          <pattern id="spa-mark" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M20 20 L60 60 L100 20 M20 100 L60 60 L100 100" fill="none" stroke="currentColor" strokeWidth="10" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spa-mark)" />
      </svg>
    </div>
  );
}
