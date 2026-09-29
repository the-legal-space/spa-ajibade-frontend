import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official SPA Ajibade & Co. wordmark, exported from the Figma "Brand" frame
 * (public/brand/logo.png, white on transparent, 2x for retina).
 * The artwork is white, so the dark tone inverts it to pure black (--color-ink).
 * firmName is kept for the alt text; descriptor is baked into the artwork.
 */
export function Logo({
  firmName,
  className,
  tone = "light",
}: {
  firmName: string;
  descriptor?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <Image
      src="/brand/logo.png"
      alt={firmName}
      width={205}
      height={30}
      priority
      className={cn("h-[30px] w-auto shrink-0", tone === "dark" && "invert", className)}
    />
  );
}
