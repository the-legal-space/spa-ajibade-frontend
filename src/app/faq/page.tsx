import type { Metadata } from "next";
import { getPage, getSite } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { FaqSection } from "@/components/sections/faq-section";
import { ContactCallout } from "@/components/sections/contact-callout";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("faq");
  return pageMetadata(page.seo, { title: page.hero.title, description: page.hero.subtitle, path: "/faq" });
}

export default async function FaqPage() {
  const [page, site] = await Promise.all([getPage("faq"), getSite()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faqSection.items
      .filter((f) => !f.answer.includes("[PENDING FROM FIRM]"))
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
      })),
  };

  return (
    <>
      <PageHero hero={page.hero} />
      <FaqSection section={site.faqSection} />
      <ContactCallout callout={site.contactCallout} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
