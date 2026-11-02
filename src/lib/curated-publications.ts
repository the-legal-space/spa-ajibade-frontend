/**
 * Hand-picked publication lists for attorneys whose work is credited in the CMS to the firm or to
 * co-authors, so filtering by main author would miss most of it. Keyed by person slug; values are
 * insight slugs. `profile` is what "Recent Publications" shows; "View more" lists `profile` + `more`.
 * A slug the CMS doesn't have yet is skipped until it is published there.
 */
export const CURATED_PUBLICATIONS: Record<string, { profile: string[]; more: string[] }> = {
  "john-onyido": {
    profile: [
      "the-international-comparative-legal-guide-to-copyright-2017-nigeria",
      "the-industrial-property-commission-bill-ipcom-and-the-new-trade-marks-bill-highlights-issues-and-recommendations-by-john-onyido-yetunde",
      "mondaqs-trademark-comparative-guide-2019-nigeria-john-onyido",
      "international-comparative-legal-guide-to-trade-marks-2019-nigeria-john-onyido",
      "copyright-in-the-digital-age-keynote-address-at-the-university-of-ilorin-intellectual-property-summit-2019-john-onyido",
      "strengthening-intellectual-property-rights-to-protect-innovators-and-creators-in-nigeria-john-onyido",
      "intellectual-property-2020-expert-guide-nigeria-john-onyido-bisola-scott-sandra-eke",
      "international-regulation-of-stolen-and-illegally-exported-cultural-objects-reclaiming-nigerias-pilfered-cultural-heritage-john-onyido",
      "essential-intellectual-property-safeguards-for-smes",
      "book-review-a-review-of-commentaries-analysis-on-nigerias-trade-marks-act",
      "international-comparative-legal-guide-on-cybersecurity-publication-2024",
      "keynote-address-of-mr-john-chike-onyido-on-the-event-theme-emerging-legal-areas-and-the-role-of-the-21st-century-lawyer-for-the-3rd-edition",
      // Not in the CMS yet.
      "repositioning-and-promoting-energy-investments-between-south-africa-and-nigeria-a-perspective-on-trade-secrets",
      "how-do-you-help-clients-protect-their-ip-portfolio-and-enforce-their-ip-rights-worldwide",
      "multi-sided-music-platforms-and-the-law-reflections-on-the-panel-discussion-on-the-digital-creative-economy",
      "in-this-interview-our-john-onyido-esq-partner-and-head-of-intellectual-property-and-technology-practice-speaks-on-global-ip-updates-with",
    ],
    more: [
      "updates-on-nccs-recent-activities-and-other-developments-in-the-nigerian-telecommunications-industry-3",
      "updates-on-nigerian-copyright-commissions-nccs-recent-activities-and-other-developments-in-the-copyright-industry-2",
      "updates-on-recent-activities-and-other-developments-in-the-privacy-sector",
      "updates-on-recent-activities-and-other-developments-at-the-national-agency-for-food-and-drugs-administration-control-nafdac",
      "update-on-the-central-bank-of-nigerias-creative-industry-financing-cifi-initiative",
      "updates-on-nigerian-copyright-commissions-nccs-recent-activities-and-other-developments-in-the-copyright-industry",
      "updates-on-the-recent-activities-and-other-developments-in-the-privacy-sector",
      "updates-on-nccs-recent-activities-and-other-developments-in-the-nigerian-telecommunications-industry-2",
      "updates-on-the-recent-activities-and-other-developments-in-national-agency-for-food-and-drugs-administration-control-nafdac",
      "updates-on-the-recent-activities-and-other-developments-in-the-data-privacy-sector",
      "updates-on-nigerian-copyright-commissions-nccs-recent-activities-and-other-developments-in-the-copyright-industry-3",
      "updates-on-the-recent-activities-and-other-developments-at-the-federal-competition-and-consumer-protection-commission",
      "updates-on-the-recent-activities-and-other-developments-at-the-national-information-technology-development-agency-nitda",
      "updates-on-the-recent-activities-and-other-developments-at-national-agency-for-food-and-drugs-administration-control-nafdac",
      "updates-on-the-recent-activities-and-other-developments-in-the-nigerian-telecommunications-sector",
      "mondaq-thought-leadership-awards-autumn-2022",
      "15th-annual-business-luncheon-talent-retention-challenges-future-of-the-legal-practice-in-nigeria",
      "a-brief-review-of-the-nigerian-draft-copyright-bill-2015-oluwafunmilayo-mayowa",
      "essential-intellectual-property-clauses-in-employment-contracts-bisola-scott",
      "intellectual-property-issues-in-fintech-oluwafunmilayo-mayowa",
      "licensing-in-the-nigerian-music-industry-francis-ololuo",
      "non-domestication-of-treaties-in-nigeria-as-a-breach-of-international-obligations-sandra-eke",
      "recommended-ways-to-protecting-business-concepts-as-intellectual-property-rights-in-nigeria-bisola-scott",
      "a-critique-of-the-jurisdiction-of-the-federal-high-court-in-nigeria-to-entertain-intellectual-property-matters",
      "registration-of-trademark-and-its-benefits",
      "a-review-of-the-nigerian-copyright-act-2022",
      "the-role-of-priority-dates-in-the-registration-and-enforcement-of-trademark-and-patent-rights-in-nigeria",
    ],
  },
};
