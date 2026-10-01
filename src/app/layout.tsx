import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Source_Serif_4 } from "next/font/google";
import { connection } from "next/server";
import { getOffices, getPracticeAreas, getSite } from "@/lib/api/endpoints";
import { SITE_URL } from "@/lib/env";
import { TopBar } from "@/components/layout/top-bar";
import { ChatButton, Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ActionsProvider } from "@/components/forms/actions-context";
import { MotionProvider } from "@/components/ui/motion-provider";
import { designNav } from "@/lib/nav";
import { cleanHtml } from "@/lib/sanitize";
import { isPending } from "@/lib/utils";
import "./globals.css";

// Load Fraunces as a true variable font including the optical-size axis, so large headings use
// Fraunces' display cut (high contrast, larger letterforms) exactly as drawn in the Figma.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-source-serif",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite().catch(() => null);
  if (!site) return { metadataBase: new URL(SITE_URL) };
  const name = site.settings.firmName;
  const description = site.settings.tagline;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${name} | ${site.settings.legalDescriptor}`,
      template: `%s | ${name}`,
    },
    description,
    applicationName: name,
    openGraph: {
      type: "website",
      siteName: name,
      locale: "en_NG",
      description,
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render per request; the API responses themselves are cached (see lib/api/client.ts).
  await connection();
  const [site, offices, practiceAreas] = await Promise.all([
    getSite(),
    getOffices(),
    getPracticeAreas(),
  ]);
  const filteredNav = designNav(site.nav);
  // Plain-text FAQ for the chat panel (rendered as text, never as HTML).
  const chatFaqs = site.faqSection.items
    .filter((f) => !isPending(f.answer))
    .map((f) => ({
      question: f.question,
      answer: cleanHtml(f.answer)
        .replace(/<\/(p|li|h[2-4])>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{2,}/g, "\n")
        .trim(),
    }));

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
    <html
      lang="en-NG"
      className={`${fraunces.variable} ${inter.variable} ${sourceSerif.variable}`}
    >
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only z-[100] rounded bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {/* Scroll-reveal content starts hidden for the animation; without JS it must still show. */}
        <noscript>
          <style>{`[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <MotionProvider>
        <ActionsProvider
          firmName={site.settings.firmName}
          phone={site.settings.phone}
          practiceAreas={practiceAreas}
          offices={offices}
          faqs={chatFaqs}
        >
          <TopBar settings={site.settings} />
          <Header
            nav={filteredNav}
            firmName={site.settings.firmName}
            descriptor={site.settings.legalDescriptor}
            cta={site.contactCallout.primaryCta}
          />
          <main id="main" className="bg-white">
            {children}
          </main>
          <Footer site={site} offices={offices} />
          <ChatButton
            link={site.faqSection.stillHaveQuestions.actions.find(
              (l) => l.href === "action:chat",
            )}
          />
        </ActionsProvider>
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
