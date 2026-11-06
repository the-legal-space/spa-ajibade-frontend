/**
 * Corrections to people data the CMS hasn't caught up with yet, keyed by person slug and applied
 * wherever a person is parsed (cards, profiles, authors). Once the backend sends the same values an
 * entry changes nothing and can be deleted.
 */
export const PERSON_OVERRIDES: Record<string, { role?: "associate"; roleLabel?: string }> = {
  // Promoted from Trainee Associate.
  "oluchi-ogbodo": { role: "associate", roleLabel: "Associate" },
};

export function withPersonOverrides<T extends { slug: string }>(person: T): T {
  const override = PERSON_OVERRIDES[person.slug];
  return override ? { ...person, ...override } : person;
}
