import type { ApiImage } from "@/lib/api/schemas";

/**
 * Temporary Responsible Business listing card while its CMS content is being prepared.
 */
export const RESPONSIBLE_BUSINESS_STORY_SLUG =
  "lagos-food-bank-and-spa-ajibade-co-unite-against-food-insecurity-in-lagos-island";
const CHIP = "lagosfoodbank.org";
const FIRM = { type: "firm", name: "SPA AJIBADE & Co.", label: "Law Firm" } as const;

const COVER_IMAGE: ApiImage = {
  url: "/figma/foodinsecurity.png",
  alt: "Lagos Food Bank and SPA Ajibade & Co. food insecurity outreach",
  width: 512,
  height: 512,
};

export type ResponsibleBusinessStory = {
  slug: string;
  title: string;
  publishedAt: string;
  coverImage: ApiImage;
  partner: typeof FIRM;
  website: { label: string; url: string };
  body: string;
};

export const MOCK_CSR_STORIES: ResponsibleBusinessStory[] = [
  {
    slug: RESPONSIBLE_BUSINESS_STORY_SLUG,
    // Title, date and text follow the Lagos Food Bank's own article (website.url).
    title: "LAGOS FOOD BANK AND S.P.A AJIBADE & CO. UNITE AGAINST FOOD INSECURITY IN LAGOS ISLAND.",
    publishedAt: "2024-12-06T09:00:00.000Z",
    coverImage: COVER_IMAGE,
    partner: FIRM,
    website: {
      label: CHIP,
      url: "https://lagosfoodbank.org/lagos-food-bank-and-s-p-a-ajibade-co-unite-against-food-insecurity-in-lagos-island/",
    },
    body: `
      <p>Amidst the harsh economic conditions in recent times that have plunged many families living below the poverty line into deeper levels of food insecurity, <strong>Lagos Food Bank Initiative</strong> partnered with <strong>S.P.A. Ajibade &amp; Co.</strong> on the <strong>6th of December 2024</strong>, and set out to <strong>Lagos Island Community</strong> to support resilient women and families in need of food security with staple foods, decent clothing and relief items.</p>
      <p>Marking the end of a productive year with an impactful CSR activity, the partner organization, <strong>S.P.A. Ajibade &amp; Co.</strong>, demonstrated the true meaning of benevolence to the public, giving back to the society by supporting less privileged households in Lagos Island to foster resilience and good health through the <strong>Temporary Food Assistance Program (TEFAP)</strong> of the food bank.</p>
      <p>“Partnering with Lagos Food Bank to give back to the society has been therapeutic, and a wonderful feeling. Considering the period in which we find present economic situation, I believe this outreach is timely, and those who have benefited from today’s distribution will appreciate it deeply,” was the words of the <strong>Managing Partner of S.P.A. Ajibade &amp; Co., Dr. Babatunde Ajibade, SAN</strong>, who actively took part in the day’s activities, along with his team members, showing compassion, commitment and care for those in need of support.</p>
      <p>Addressing the attendees of the outreach, the <strong>Founder/Executive Director</strong> of the food bank, <strong>Dr. Michael Sunbola</strong>, expressed his gratitude to the partners of the day for their impactful initiative to cater for food insecure households in Lagos Island, highlighting the importance of providing nutrition for struggling families as a way of delivering hope and building stronger and healthier communities. He also acknowledged the unwavering efforts of the food bank volunteers who showed up in numbers to support community-driven projects.</p>
      <p>In the impactful journey of the Lagos Food Bank Initiative, Corporate Social Responsibility (CSR) activities have played a significant role in supporting communities within and beyond Lagos state, ensuring nourishment in far-to-reach communities through partnerships that prove to be a beacon of hope to underserved communities. The food bank remains steadfast in its mission to achieve a Zero-Hunger society for all, in alignment with the United Nations’ Sustainable Development Goal 2-Zero Hunger.</p>
    `,
  },
];
