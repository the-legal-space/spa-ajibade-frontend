"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { PersonDetail } from "@/lib/api/schemas";

type EducationEntry = NonNullable<PersonDetail["education"]>["entries"][number];
type Publication = NonNullable<PersonDetail["publications"]>[number];
type SectionKey = "education" | "memberships" | "publications";

export function PersonDetailsAccordion({
  educationIntro,
  educationEntries,
  memberships,
  publications,
}: {
  educationIntro: string;
  educationEntries: EducationEntry[];
  memberships: string[];
  publications: Publication[];
}) {
  const sections: { key: SectionKey; title: string; content: ReactNode }[] = [];

  if (educationIntro || educationEntries.length > 0) {
    sections.push({
      key: "education",
      title: "Education & Bar Associations",
      content: (
        <>
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
        </>
      ),
    });
  }

  if (memberships.length > 0) {
    sections.push({
      key: "memberships",
      title: "Professional Memberships",
      content: (
        <ul className="mt-3 space-y-1">
          {memberships.map((membership, index) => (
            <li key={`${membership}-${index}`} className="bg-mist px-4 py-3 text-sm">
              {membership}
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (publications.length > 0) {
    sections.push({
      key: "publications",
      title: "Publications",
      content: (
        <ul className="mt-3 space-y-1">
          {publications.map((publication, index) => {
            const meta = [publication.date, publication.label].filter(Boolean).join(" · ");
            return (
              <li key={`${publication.title}-${index}`} className="bg-mist px-4 py-3 text-sm">
                {publication.insightSlug ? (
                  <Link href={`/insights/${publication.insightSlug}`} className="hover:underline">
                    {publication.title}
                  </Link>
                ) : (
                  <span>{publication.title}</span>
                )}
                {meta ? <span className="mt-1 block text-xs text-stone">{meta}</span> : null}
              </li>
            );
          })}
        </ul>
      ),
    });
  }

  const [openSection, setOpenSection] = useState<SectionKey | undefined>(sections[0]?.key);

  if (sections.length === 0) return null;

  // One panel is always open: closing the open one opens the next.
  function toggle(key: SectionKey) {
    if (openSection !== key) {
      setOpenSection(key);
      return;
    }
    const index = sections.findIndex((section) => section.key === key);
    const next = sections[(index + 1) % sections.length];
    if (next && next.key !== key) setOpenSection(next.key);
  }

  return (
    <div className="mt-7">
      {sections.map((section, index) => {
        const open = openSection === section.key;
        return (
          <section
            key={section.key}
            className={`${index > 0 ? "mt-5 " : ""}border-t border-mist-200 pt-4`}
          >
            <h2 id={`person-${section.key}-heading`}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`person-${section.key}-panel`}
                onClick={() => toggle(section.key)}
                className="flex w-full items-center justify-between gap-4 text-left font-serif text-xl"
              >
                {section.title}
                <ChevronDown
                  className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
            </h2>
            <div
              id={`person-${section.key}-panel`}
              role="region"
              aria-labelledby={`person-${section.key}-heading`}
              hidden={!open}
            >
              {section.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}
