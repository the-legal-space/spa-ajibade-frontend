"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A thin progress bar across the top that starts the instant an internal link is clicked and ends when
 * the new page arrives. Page changes wait on the server (and on a slow connection that can be several
 * seconds), and until the response starts nothing on screen changes, so without this it looks like the
 * click did nothing. Needs no per-link wiring: it listens for clicks on any same-site link.
 */
/**
 * The bar must contrast with whatever is behind it. At the top of the page that is the firm's black top bar
 * (white bar). Once the page has scrolled, the sticky navbar is at the very top: if its text is light the
 * navbar is dark (white bar), and if its text is dark the navbar is light (black bar).
 */
function barTone(): "light" | "dark" {
  const header = document.querySelector<HTMLElement>("[data-header-self]");
  if (!header || header.getBoundingClientRect().top > 1) return "light";
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(header).color);
  if (!m) return "light";
  const luminance = (0.299 * Number(m[1]) + 0.587 * Number(m[2]) + 0.114 * Number(m[3])) / 255;
  return luminance > 0.6 ? "light" : "dark"; // light header text = dark navbar = white bar
}

export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [active, setActive] = useState(false);
  const [tone, setTone] = useState<"light" | "dark">("light"); // colour of the bar itself

  // The new page has arrived.
  useEffect(() => setActive(false), [pathname, search]);

  useEffect(() => {
    let giveUp: ReturnType<typeof setTimeout> | undefined;
    const onClick = (e: MouseEvent) => {
      // Next's <Link> cancels the browser default and navigates itself, so don't skip defaultPrevented clicks;
      // listening in the capture phase (below) runs before it does anyway.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page / #anchor
      setTone(barTone());
      setActive(true);
      clearTimeout(giveUp);
      giveUp = setTimeout(() => setActive(false), 20_000); // never leave the bar stuck
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(giveUp);
    };
  }, []);

  if (!active) return null;
  return (
    <div role="progressbar" aria-label="Loading page" className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] overflow-hidden">
      <div className={`h-full w-1/3 animate-[nav-progress_1.1s_ease-in-out_infinite] ${tone === "light" ? "bg-white" : "bg-black"}`} />
    </div>
  );
}
