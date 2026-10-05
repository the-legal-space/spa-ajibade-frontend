import Link from "next/link";
import { Fragment } from "react";
import { Mail, PhoneCall } from "lucide-react";
import type { Office, Site } from "@/lib/api/schemas";
import { telHref } from "@/lib/utils";
import { SocialLinks } from "@/components/ui/social-icons";
import { NewsletterForm } from "./newsletter-form";

/** Office order from the Figma footer. Offices the design doesn't name follow in CMS order. */
const OFFICE_ORDER = ["lagos", "ibadan", "abuja"];

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Practice Areas", href: "/practice-areas" },
  { label: "Our People", href: "/people" },
  { label: "Insights & News", href: "/insights" },
  { label: "Careers", href: "/careers" },
  { label: "FAQ’s", href: "/#faq" },
];

/** Figma "Site Footer": newsletter and socials, Quick Links, Practice Areas, Offices, legal row. */
export function Footer({ site, offices }: { site: Site; offices: Office[] }) {
  const { footer, settings } = site;
  const cmsHrefs = new Set(footer.links.map((l) => l.href));
  // Keep the design's labels and order, but only for pages the CMS lists (plus FAQ's, which the design adds).
  const links = QUICK_LINKS.filter((l) => l.href === "/#faq" || cmsHrefs.has(l.href));
  const officeDetails = footer.offices
    .map((ref) => offices.find((o) => o.id === ref.id) ?? { ...ref, address: "", phone: null, email: null })
    .sort((a, b) => rank(a.name) - rank(b.name));

  return (
    <footer data-header-theme="dark" className="relative overflow-hidden border-t-2 border-white/20 bg-ink text-white">
      {/* Figma "Footer Background Mark": white crossed mark with the 10% opacity baked into the PNG. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[url('/brand/footer-mark.png')] bg-cover bg-center bg-no-repeat" />

      <div className="container-site relative flex flex-col gap-11 py-14 md:py-[68px]">
        <div className="grid gap-12 md:grid-cols-2 xl:flex xl:items-start xl:justify-between">
          <div className="flex w-full max-w-[437px] flex-col gap-10">
            {/* Shown as in the Figma even while the CMS "enabled" flag is off; the form just opens the
                visitor's mail app addressed to the firm, so there is nothing to switch on behind it. */}
            <div className="flex max-w-[414px] flex-col gap-6">
              <h2 className="font-serif text-xl font-light leading-7 text-[#e2e2e2]">{footer.newsletter.title || "Subscribe for legal insights"}</h2>
              <NewsletterForm firmEmail={settings.email} />
              <p className="text-sm leading-7 text-[#e2e2e2]">{footer.newsletter.note || "Your information is kept confidential"}</p>
            </div>
            <SocialLinks socials={footer.socials} always className="gap-5" iconClassName="size-5" />
          </div>

          <div className="grid gap-12 sm:grid-cols-2 md:col-span-2 lg:grid-cols-[auto_auto_auto] xl:flex xl:gap-[68px]">
            <FooterColumn title="Quick Links">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm leading-7 text-white transition-opacity duration-200 hover:opacity-75">
                    {l.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Practice Areas">
              {footer.practiceAreas.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/practice-areas/${p.slug}`}
                    className="text-sm leading-7 text-mist underline underline-offset-2 transition-opacity duration-200 hover:opacity-75"
                  >
                    {p.title.replace(/ & /g, " and ")}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Offices" gap="gap-4">
              {officeDetails.map((o) => (
                <li key={o.id} className="flex flex-col gap-2 text-xs leading-5">
                  <p>
                    <span className="font-bold text-white">{o.name}:</span>
                    {o.address ? (
                      <>
                        <br />
                        <span className="text-mist underline underline-offset-2">{o.address}</span>
                      </>
                    ) : null}
                  </p>
                  <div className="flex gap-1 text-white">
                    {o.email || settings.email ? (
                      <a href={`mailto:${o.email || settings.email}`} aria-label={`Email the ${o.name} office`} className="transition-transform duration-200 hover:scale-110">
                        <Mail className="size-5" strokeWidth={1.4} />
                      </a>
                    ) : null}
                    {telHref(o.phone || settings.phone) ? (
                      <a href={telHref(o.phone || settings.phone)!} aria-label={`Call the ${o.name} office`} className="transition-transform duration-200 hover:scale-110">
                        <PhoneCall className="size-5" strokeWidth={1.4} />
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </FooterColumn>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-white/15 pt-6 text-center text-sm leading-7 text-white md:flex-row md:justify-between md:text-left">
          <p>{footer.copyright || settings.copyright}</p>
          <p className="flex items-center gap-6">
            {footer.legalLinks.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 ? <span aria-hidden className="size-1.5 rounded-full bg-white" /> : null}
                <Link href={legalHref(link.href)} className="hover:opacity-75">{link.label}</Link>
              </Fragment>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}

function rank(name: string) {
  const i = OFFICE_ORDER.indexOf(name.trim().toLowerCase());
  return i === -1 ? OFFICE_ORDER.length : i;
}

function legalHref(href: string) {
  const key = href.split("/").at(-1);
  return key === "terms" || key === "privacy" ? `/${key}` : href;
}

function FooterColumn({ title, children, gap = "gap-2" }: { title: string; children: React.ReactNode; gap?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-serif text-xl font-light leading-7 text-[#e2e2e2]">{title}</h2>
      <ul className={`flex flex-col ${gap}`}>{children}</ul>
    </div>
  );
}
