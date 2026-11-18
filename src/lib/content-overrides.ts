/**
 * Copy the firm approved that the CMS hasn't caught up with yet (the staging backend can't be edited
 * at the moment). Once the backend sends the same text, an entry changes nothing and can be deleted.
 */

export const FIRM_MOTTO = "Integrity, Excellence & Innovation in Legal Practice";

/** Home page "A Firm Built On Integrity" section, below the hero. */
export const ABOUT_FIRM_PARAGRAPHS = [
  "S. P. A. Ajibade & Co was founded in 1967. The Firm is managed by Dr. B. A. M. Ajibade, SAN as the Managing Partner together with six (6) other Partners, Dr. J. C. Onyido, Dr. K. Mayomi, Mrs. B. Gabari, Mr. P. O. Olalere, Dr. M. Ejelonu and Mr. M. Sowunmi. The Firm is focused on the following areas of practice: Dispute Resolution & Arbitration, Intellectual Property & Telecommunications, Corporate Finance & Capital Markets, Real Estate & Succession, Energy & Natural Resources.",
  "At S. P. A. Ajibade & Co, maintaining the integrity of the legal profession by ethically satisfying every client’s specific needs and interests, whilst ensuring the continuous growth and development of the Firm is the core of our daily practice.",
];

/** About page "Our Story": the heading is the motto; the profile download line below stays from the CMS. */
export const STORY = {
  title: FIRM_MOTTO,
  paragraphs: [
    "The firm was founded in 1967, when Nigerian businesses had few local options for the kind of legal counsel that large transactions and disputes demanded. Almost sixty years on, that gap has closed, but the reason clients choose S. P. A. Ajibade & Co. has not changed.",
    "We have handled disputes that took years to resolve and transactions that closed in weeks. We have advised on capital markets, aviation, energy, intellectual property, data protection and a good deal more besides. The work rarely looks the same twice.",
    "What has remained constant is our approach: judgment built over decades, not shortcuts learned from templates. Clients do not come to us because we are the oldest firm in the room. They come because, when something is genuinely at stake, they want counsel who has handled it before and who will tell them the truth.",
    "Today, that means offices in Lagos, Abuja and Ibadan, and a practice that spans far more ground than “corporate and commercial law” has ever captured.",
  ],
};

/** Short practice-area labels the firm wants spelled out in full, keyed by slug. */
export const PRACTICE_SHORT_LABELS: Record<string, string> = {
  "dispute-resolution-arbitration": "Dispute Resolution & Arbitration",
};
