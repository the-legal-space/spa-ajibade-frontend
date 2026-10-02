"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PersonDetail } from "@/lib/api/schemas";

type EducationEntry = NonNullable<PersonDetail["education"]>["entries"][number];

export function PersonDetailsAccordion({
  educationIntro,
  educationEntries,
  memberships,
}: {
  educationIntro: string;
  educationEntries: EducationEntry[];
  memberships: string[];
}) {
  const hasEducation = Boolean(educationIntro) || educationEntries.length > 0;
  const hasMemberships = memberships.length > 0;
  const [openSection, setOpenSection] = useState<"education" | "memberships">(
    hasEducation ? "education" : "memberships",
  );

  if (!hasEducation && !hasMemberships) return null;

  function toggle(section: "education" | "memberships") {
    if (openSection !== section) {
      setOpenSection(section);
      return;
    }
    if (section === "education" && hasMemberships) setOpenSection("memberships");
    if (section === "memberships" && hasEducation) setOpenSection("education");
  }

  return (
    <div className="mt-7">
      {hasEducation ? (
        <section className="border-t border-mist-200 pt-4">
          <h2 id="person-education-heading">
            <button
              type="button"
              aria-expanded={openSection === "education"}
              aria-controls="person-education-panel"
              onClick={() => toggle("education")}
              className="flex w-full items-center justify-between gap-4 text-left font-serif text-xl"
            >
              Education &amp; Bar Associations
              <ChevronDown
                className={`size-4 shrink-0 transition-transform ${openSection === "education" ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          </h2>
          <div
            id="person-education-panel"
            role="region"
            aria-labelledby="person-education-heading"
            hidden={openSection !== "education"}
          >
            {educationIntro ? (
              <div
                className="prose-firm mt-2 text-sm leading-6"
                dangerouslySetInnerHTML={{ __html: educationIntro }}
              />
            ) : null}
            {educationEntries.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {educationEntries.map((entry, index) => (
                  <li
                    key={`${entry.qualification}-${index}`}
                    className="flex items-center justify-between gap-4 bg-mist px-4 py-3 text-sm"
                  >
                    <span>{entry.qualification}</span>
                    {entry.year !== null ? <span className="shrink-0">{entry.year}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasMemberships ? (
        <section className="mt-5 border-t border-mist-200 pt-4">
          <h2 id="person-memberships-heading">
            <button
              type="button"
              aria-expanded={openSection === "memberships"}
              aria-controls="person-memberships-panel"
              onClick={() => toggle("memberships")}
              className="flex w-full items-center justify-between gap-4 text-left font-serif text-xl"
            >
              Professional Memberships
              <ChevronDown
                className={`size-4 shrink-0 transition-transform ${openSection === "memberships" ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          </h2>
          <ul
            id="person-memberships-panel"
            role="region"
            aria-labelledby="person-memberships-heading"
            hidden={openSection !== "memberships"}
            className="mt-3 space-y-1"
          >
            {memberships.map((membership, index) => (
              <li key={`${membership}-${index}`} className="bg-mist px-4 py-3 text-sm">
                {membership}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}