"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ApiLink, NavItem } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import {
  accordionPanelVariants,
  dropdownMenuVariants,
  INTERACTION,
  TRANSITIONS,
} from "@/lib/motion";
import { SearchDialog } from "./search-dialog";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Article, attorney and Responsible Business pages use the white header from the Figma ("READ MORE", "ATTORNEY DETAILS"). */
function usesLightHeader(pathname: string) {
  return /^\/(people|insights)\/[^/]+\/?$/.test(pathname) || /^\/responsible-business\/?$/.test(pathname);
}

/**
 * Samples what page section sits directly below the header using
 * `document.elementsFromPoint`. Sections opt-in by setting
 * `data-header-theme="dark"` (white navbar text) or `"light"` (dark text).
 * Elements that are part of the header itself are skipped via `data-header-self`.
 */
function parseRgb(color: string): [number, number, number] | null {
  const rgb = color.match(/rgba?\(([^)]+)\)/i);
  if (rgb?.[1]) {
    const channels = rgb[1].split(",").map((n) => Number.parseFloat(n.trim()));
    if (channels.length >= 3 && channels.every((v) => Number.isFinite(v))) {
      const [r, g, b] = channels as [number, number, number];
      return [r, g, b];
    }
  }

  const hex = color.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex?.[1]) {
    const value = hex[1];
    const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
    const r = Number.parseInt(full.slice(0, 2), 16);
    const g = Number.parseInt(full.slice(2, 4), 16);
    const b = Number.parseInt(full.slice(4, 6), 16);
    return [r, g, b];
  }

  return null;
}

function isDarkBackground(color: string): boolean {
  const parsed = parseRgb(color);
  if (!parsed) return false;
  const [r, g, b] = parsed;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 160;
}

function useIsOverDark(): boolean {
  const [overDark, setOverDark] = useState(true); // hero is first, default white text
  useEffect(() => {
    const check = () => {
      const header = document.querySelector<HTMLElement>("[data-header-self]");
      const y = (header?.getBoundingClientRect().bottom ?? 86) + 1;
      const els = document.elementsFromPoint(window.innerWidth / 2, y);
      for (const el of els) {
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest("[data-header-self]")) continue; // skip the header & its children

        const themedParent = el.closest("[data-header-theme]") as HTMLElement | null;
        const theme = themedParent?.dataset.headerTheme ?? el.dataset.headerTheme;
        if (theme === "dark") { setOverDark(true); return; }
        if (theme === "light") { setOverDark(false); return; }

        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          if (isDarkBackground(bg)) { setOverDark(true); return; }
          if (!isDarkBackground(bg)) {
            setOverDark(false);
            return;
          }
        }
      }
      setOverDark(false); // default: light page body
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  return overDark;
}

export function Header({ nav, firmName, descriptor, cta }: { nav: NavItem[]; firmName: string; descriptor: string; cta: ApiLink | null }) {
  const pathname = usePathname();
  const light = usesLightHeader(pathname);
  const overDark = useIsOverDark();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Detail pages (people / insights) always use white bg + dark text.
  // Other pages: white text over dark sections (hero, dark bands), dark text over light content.
  const wantsWhiteText = !light && overDark;

  const iconBtn = cn(
    "grid size-10 place-items-center rounded-full transition-colors",
    wantsWhiteText ? "hover:bg-white/10" : "hover:bg-mist",
  );

  return (
    <>
      <header
        data-header-self
        className={cn(
          "sticky top-0 z-40 border-b transition-[color,background-color,border-color] duration-300",
          light
            ? "border-ink/10 bg-white text-ink"
            : wantsWhiteText
              ? "border-[rgba(242,242,242,0.2)] bg-white/5 text-white backdrop-blur-[2px]"
              : "border-ink/10 bg-white/85 text-ink backdrop-blur-md",
        )}
      >
        <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" aria-label={`${firmName} home`} className="shrink-0">
            <Logo firmName={firmName} descriptor={descriptor} tone={wantsWhiteText ? "light" : "dark"} />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-2 xl:gap-4">
              {nav.map((item) => (
                <DesktopNavItem key={item.href + item.label} item={item} active={isActive(pathname, item.href)} light={!wantsWhiteText} />
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3 xl:gap-6">
            <motion.button
              type="button"
              onClick={() => setSearchOpen(true)}
              whileHover={INTERACTION.iconButton.whileHover}
              whileTap={INTERACTION.iconButton.whileTap}
              transition={TRANSITIONS.hover}
              className={iconBtn}
              aria-label="Search the site"
            >
              <Search className="size-6" strokeWidth={1.5} />
            </motion.button>
            {cta ? (
              // Wrapper does the hiding: buttonClass's own inline-flex would override a `hidden` on the link.
              <div className="hidden lg:block">
                <SmartLink link={cta} className={buttonClass(wantsWhiteText ? "light" : "dark", "px-3 py-2.5")} />
              </div>
            ) : null}
            <motion.button
              type="button"
              className={cn(iconBtn, "lg:hidden")}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              whileTap={INTERACTION.iconButton.whileTap}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1, transition: { height: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } } }}
              exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.15 } } }}
              className="max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-white/10 bg-ink text-white lg:hidden"
            >
              <ul className="container-site flex flex-col py-4">
                {nav.map((item) => (
                  <MobileNavItem key={item.href + item.label} item={item} active={isActive(pathname, item.href)} />
                ))}
              </ul>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} firmName={firmName} descriptor={descriptor} />
    </>
  );
}

function DesktopNavItem({ item, active, light }: { item: NavItem; active: boolean; light: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const hasChildren = item.children.length > 0;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Figma: Inter Display Medium 14, mediumgray (#9c9b9b) links, the current page in full colour.
  const tone = light
    ? active
      ? "text-ink"
      : "text-gray hover:text-ink"
    : active
      ? "text-white"
      : "text-gray hover:text-white";
  const linkClass = cn("inline-flex items-center gap-1 rounded py-2 text-sm font-medium transition-colors", tone);

  if (!hasChildren) {
    return (
      <li>
        <Link href={item.href} className={linkClass} aria-current={active ? "page" : undefined}>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className="inline-flex items-center">
        <Link href={item.href} className={linkClass} aria-current={active ? "page" : undefined}>
          {item.label}
        </Link>
        <button
          type="button"
          className={cn("rounded py-1 pl-1", tone)}
          aria-label={`${item.label} menu`}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
        </button>
      </span>
      <AnimatePresence>
        {open ? (
          <motion.div
            variants={dropdownMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute left-0 top-full z-50 pt-1.5"
          >
            <ul className="min-w-64 divide-y divide-mist-200 rounded-xl bg-white px-4 py-1.5 text-ink shadow-2xl ring-1 ring-black/5">
              {item.children.map((child) => (
                <li key={child.href}>
                  <motion.div whileHover={{ x: 3 }} transition={TRANSITIONS.hover}>
                    <Link href={child.href} className="block py-3 text-sm font-medium text-ink-700 hover:text-ink" onClick={() => setOpen(false)}>
                      {child.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function MobileNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-white/10">
      <div className="flex items-center justify-between">
        <Link href={item.href} className={cn("block py-3.5 text-base", active ? "text-white" : "text-white/75")}>
          {item.label}
        </Link>
        {item.children.length > 0 ? (
          <button
            type="button"
            className="p-3 text-white/70"
            aria-expanded={open}
            aria-label={`${item.label} submenu`}
            onClick={() => setOpen((o) => !o)}
          >
            <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
          </button>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            variants={accordionPanelVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden pb-3 pl-3"
          >
            {item.children.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="block py-2 text-sm text-white/65 hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

/**
 * Floating "Chat with us" pill from the designs. It only appears when the CMS provides
 * a chat action (in /site: faqSection.stillHaveQuestions.actions) and uses its label.
 */
export function ChatButton({ link }: { link: ApiLink | undefined }) {
  if (!link) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, ...TRANSITIONS.entrance }}
      className="fixed bottom-5 right-5 z-30 md:bottom-8 md:right-8"
    >
      <SmartLink
        link={link}
        className="inline-flex items-center gap-2 rounded-[100px] border border-white/30 bg-ink px-5 py-3 text-base font-semibold leading-none text-white shadow-xl backdrop-blur-[5px] transition-colors hover:bg-ink-700"
      >
        <Bot className="size-5" strokeWidth={1.6} aria-hidden />
        {link.label}
      </SmartLink>
    </motion.div>
  );
}
