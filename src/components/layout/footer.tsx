import Link from "next/link";
import { Mail, PhoneCall } from "lucide-react";
import type { Office, Site } from "@/lib/api/schemas";
import { telHref } from "@/lib/utils";
import { SocialLinks } from "@/components/ui/social-icons";
import { Logo } from "@/components/ui/logo";

export function Footer({ site, offices }: { site: Site; offices: Office[] }) {
  const { footer, settings } = site;
  const hiddenPaths = new Set(["/faq", "/offices"]);
  const visibleLinks = footer.links.filter((link) => !hiddenPaths.has(link.href));
  const officeDetails = footer.offices.map((ref) => offices.find((o) => o.id === ref.id) ?? { ...ref, address: "", phone: null, email: null });

  return (
    <footer data-header-theme="dark" className="site-dark-surface relative text-white">
      {/* Figma "Footer Background Mark": white crossed mark with the 10% opacity baked into the PNG. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[url('/brand/footer-mark.png')] bg-cover bg-center bg-no-repeat" />

      <div className="container-site relative pb-8 pt-14">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.6fr_1fr_1.1fr] lg:gap-8">
          <div className="max-w-sm">
            <Link href="/" aria-label={`${settings.firmName} home`}>
              <Logo firmName={settings.firmName} descriptor={settings.legalDescriptor} />
            </Link>
            <p className="mt-5 font-serif text-xl leading-snug text-white/90">{footer.tagline}</p>
            {settings.email || settings.phone ? (
              <ul className="mt-5 space-y-1.5 text-[13px] text-white/75">
                {settings.phone ? (
                  <li>
                    <a href={telHref(settings.phone) ?? undefined} className="hover:text-white">
                      {settings.phone}
                    </a>
                  </li>
                ) : null}
                {settings.email ? (
                  <li>
                    <a href={`mailto:${settings.email}`} className="hover:text-white">
                      {settings.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
            <SocialLinks socials={footer.socials} className="mt-6" iconClassName="size-4" />
          </div>

          <FooterColumn title="Quick Links">
            {visibleLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[13px] text-white/80 transition-colors duration-200 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Practice Areas">
            {footer.practiceAreas.map((p) => (
              <li key={p.slug}>
                <Link href={`/practice-areas/${p.slug}`} className="text-[13px] text-white/80 underline underline-offset-2 transition-colors duration-200 hover:text-white">
                  {p.title}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Offices">
            {officeDetails.map((o) => (
              <li key={o.id} className="text-[12px]">
                <p className="font-semibold text-white">{o.name}:</p>
                {o.address ? <p className="text-white/80">{o.address}</p> : null}
                <div className="mt-1.5 flex gap-2 text-white/90">
                  {o.email ? (
                    <a href={`mailto:${o.email}`} aria-label={`Email the ${o.name} office`} className="transition-transform duration-200 hover:scale-110 hover:text-white">
                      <Mail className="size-4" strokeWidth={1.5} />
                    </a>
                  ) : null}
                  {telHref(o.phone) ? (
                    <a href={telHref(o.phone)!} aria-label={`Call the ${o.name} office`} className="transition-transform duration-200 hover:scale-110 hover:text-white">
                      <PhoneCall className="size-4" strokeWidth={1.5} />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-6 text-[13px] text-white/80 md:flex-row md:items-center md:justify-between">
          <p>{footer.copyright}</p>
          <p className="text-white/60">{settings.legalDescriptor}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-xl text-white/90">{title}</h2>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}
