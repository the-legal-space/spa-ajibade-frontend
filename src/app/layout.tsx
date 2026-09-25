import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { connection } from "next/server";
import { getOffices, getPracticeAreas, getSite } from "@/lib/api/endpoints";
import { SITE_URL } from "@/lib/env";
import { TopBar } from "@/components/layout/top-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ActionsProvider } from "@/components/forms/actions-context";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite().catch(() => null);
  if (!site) return { metadataBase: new URL(SITE_URL) };
  const name = site.settings.firmName;
  const description = site.settings.tagline;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${name} | ${site.settings.legalDescriptor}`, template: `%s | ${name}` },
    description,
    applicationName: name,
    openGraph: { type: "website", siteName: name, locale: "en_NG", description },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "light" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Render per request; the API responses themselves are cached (see lib/api/client.ts).
  await connection();
  const [site, offices, practiceAreas] = await Promise.all([getSite(), getOffices(), getPracticeAreas()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: site.settings.firmName,
    description: site.settings.tagline,
    url: SITE_URL,
    foundingDate: String(site.settings.foundedYear),
    email: site.settings.email ?? undefined,
    telephone: site.settings.phone ?? undefined,
    areaServed: "NG",
    address: offices.map((o) => ({
      "@type": "PostalAddress",
      streetAddress: o.address,
      addressLocality: o.name,
      addressCountry: "NG",
    })),
    sameAs: Object.values(site.settings.socials).filter(Boolean),
  };

  return (
    <html lang="en-NG" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <a href="#main" className="sr-only z-[100] rounded bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <ActionsProvider firmName={site.settings.firmName} phone={site.settings.phone} practiceAreas={practiceAreas} offices={offices}>
          <TopBar settings={site.settings} />
          <Header nav={site.nav} firmName={site.settings.firmName} descriptor={site.settings.legalDescriptor} cta={site.contactCallout.primaryCta} />
          <main id="main" className="bg-white">
            {children}
          </main>
          <Footer site={site} offices={offices} />
        </ActionsProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
