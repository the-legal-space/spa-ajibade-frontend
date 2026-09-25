import type { ApiImage } from "@/lib/api/schemas";
import { cn, initials } from "@/lib/utils";

/**
 * Every image field is nullable, and right now they are all null (no photos uploaded yet).
 * <Media> renders the API image with a responsive srcset, or a deliberate placeholder
 * that still looks intentional on a live site.
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
    const s = image.sizes ?? {};
    const srcSet = [s.sm && `${s.sm} 480w`, s.md && `${s.md} 960w`, s.lg && `${s.lg} 1600w`].filter(Boolean).join(", ");
    const fp = image.focalPoint;
    return (
      <img
        src={s.lg ?? image.url}
        srcSet={srcSet || undefined}
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
