import { getSite } from "@/lib/api/endpoints";
import { FaqSection } from "./faq-section";
import { ContactCallout } from "./contact-callout";

/** The FAQ block and contact call-out that close every page in the designs. */
export async function PageEnd({ faq = true }: { faq?: boolean }) {
  const site = await getSite();
  return (
    <>
      {faq ? <FaqSection section={site.faqSection} /> : null}
      <ContactCallout callout={site.contactCallout} />
    </>
  );
}
