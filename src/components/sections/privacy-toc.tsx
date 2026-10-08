"use client";

import { useEffect, useState } from "react";

const contents = [
  { label: "Introduction", href: "#introduction" },
  { label: "Consent", href: "#consent" },
  { label: "Information we collect", href: "#information-we-collect" },
  { label: "How we use information", href: "#how-we-use-information" },
  { label: "How we protect information", href: "#how-we-protect-information" },
  { label: "Data processing principles", href: "#data-processing-principles" },
  { label: "Lawful bases", href: "#lawful-bases" },
  { label: "How we share information", href: "#how-we-share-information" },
  { label: "International transfers", href: "#international-transfers" },
  { label: "Data retention", href: "#data-retention" },
  { label: "Purpose limitation", href: "#purpose-limitation" },
  { label: "Data minimisation", href: "#data-minimisation" },
  { label: "Cookies", href: "#cookies" },
  { label: "Your choices and rights", href: "#your-choices-and-rights" },
  { label: "Regulatory compliance", href: "#regulatory-compliance" },
  { label: "Updates", href: "#updates" },
  { label: "Complaints and remedies", href: "#complaints-and-remedies" },
  { label: "Questions and enquiries", href: "#questions-and-enquiries" },
  { label: "Glossary", href: "#glossary" },
];

export function PrivacyTableOfContents() {
  const [activeSection, setActiveSection] = useState("#introduction");

  useEffect(() => {
    const sections = contents
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(`#${visible.target.id}`);
        }
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.15, 0.4] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
      <p className="font-serif text-xl text-ink">Contents</p>
      <nav aria-label="Privacy policy contents" className="mt-5 flex flex-col gap-1">
        {contents.map((item) => {
          const isActive = activeSection === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? "true" : undefined}
              className={`rounded-sm px-3 py-2 text-sm leading-5 transition-colors hover:bg-mist hover:text-ink ${
                isActive ? "bg-mist font-medium text-ink" : "text-stone"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
