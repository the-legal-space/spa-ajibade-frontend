"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import type { NavItem } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/smart-link";
import { SearchDialog } from "./search-dialog";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ nav, firmName, descriptor }: { nav: NavItem[]; firmName: string; descriptor: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-white/15 text-white transition-colors duration-300",
          scrolled ? "bg-ink/80 backdrop-blur-md" : "bg-ink/40 backdrop-blur-[2px]",
        )}
      >
        <div className="container-site flex h-[70px] items-center justify-between gap-6">
          <Link href="/" aria-label={`${firmName} home`} className="shrink-0">
            <Logo firmName={firmName} descriptor={descriptor} />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-2">
              {nav.map((item) => (
                <DesktopNavItem key={item.href + item.label} item={item} active={isActive(pathname, item.href)} />
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-full hover:bg-white/10"
              aria-label="Search the site"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </button>
            <ActionButton action="action:mandate" className={buttonClass("light", "hidden px-3 py-2 text-[13px] sm:inline-flex")}>
              Discuss a Mandate
            </ActionButton>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full hover:bg-white/10 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100dvh-70px)] overflow-y-auto border-t border-white/10 bg-ink lg:hidden">
            <ul className="container-site flex flex-col py-4">
              {nav.map((item) => (
                <MobileNavItem key={item.href + item.label} item={item} active={isActive(pathname, item.href)} />
              ))}
              <li className="pt-4 sm:hidden">
                <ActionButton action="action:mandate" className={buttonClass("light", "w-full")}>
                  Discuss a Mandate
                </ActionButton>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function DesktopNavItem({ item, active }: { item: NavItem; active: boolean }) {
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

  const linkClass = cn(
    "inline-flex items-center gap-1 rounded px-2 py-2 text-[13px] transition-colors",
    active ? "text-white" : "text-white/65 hover:text-white",
  );

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
        <Link href={item.href} className={cn(linkClass, "pr-0.5")} aria-current={active ? "page" : undefined}>
          {item.label}
        </Link>
        <button
          type="button"
          className="rounded p-1 text-white/65 hover:text-white"
          aria-label={`${item.label} menu`}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </span>
      {open ? (
        <div className="absolute left-0 top-full z-50 pt-2">
          <ul className="min-w-72 animate-fade-in rounded-lg border border-white/10 bg-ink-900/95 p-2 shadow-2xl backdrop-blur-md">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className="block rounded-md px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
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
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </button>
        ) : null}
      </div>
      {open ? (
        <ul className="pb-3 pl-3">
          {item.children.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="block py-2 text-sm text-white/65 hover:text-white">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
