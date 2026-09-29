import type { NavItem } from "@/lib/api/schemas";

/**
 * Dropdowns from the Figma main navigation. The CMS nav only carries a
 * Practice Areas submenu, while the design has none there and puts the
 * dropdowns on About Us and Insights & News instead.
 */
const DROPDOWNS: Record<string, NavItem["children"]> = {
  "/about": [
    { label: "Our Story", href: "/about#our-story", kind: "internal" },
    { label: "Mission, Vision & Values", href: "/about#mission", kind: "internal" },
    { label: "Our Principles", href: "/about#principles", kind: "internal" },
    { label: "Recognition", href: "/about#recognition", kind: "internal" },
  ],
  "/insights": [
    { label: "Firm News", href: "/insights?category=firm_news#listing", kind: "internal" },
    { label: "Articles", href: "/insights?category=articles#listing", kind: "internal" },
    { label: "Insights", href: "/insights?category=insights#listing", kind: "internal" },
    { label: "Regulatory Updates", href: "/insights?category=regulatory_updates#listing", kind: "internal" },
    { label: "News Updates", href: "/insights?category=news_updates#listing", kind: "internal" },
    { label: "Events", href: "/insights?category=webinar_resources#listing", kind: "internal" },
  ],
};

const HIDDEN = new Set(["/faq", "/offices"]);

export function designNav(nav: NavItem[]): NavItem[] {
  return nav
    .filter((item) => !HIDDEN.has(item.href))
    .map((item) => ({ ...item, children: DROPDOWNS[item.href] ?? [] }));
}
