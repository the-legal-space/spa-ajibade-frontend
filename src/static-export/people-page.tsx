// Static export only: scripts/build-static.sh copies this over src/app/people/page.tsx.
// The default tab is built into the page; other tabs, practice areas and sorts filter in the browser.
import type { Metadata } from "next";
import { getPage, getPeople } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { getCardDetails } from "@/lib/person-card";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { StaticPeopleListing } from "@/components/static/listings";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("people");
  return pageMetadata(page.seo, { title: "Our People", description: page.hero.subtitle, path: "/people" });
}

export default async function PeoplePage() {
  const content = await getPage("people");
  const role = content.roleFilters[0]?.value || undefined;
  const people = await getPeople({ role, sort: "seniority", pageSize: Infinity });
  const details = await getCardDetails(people.data);

  return (
    <>
      <PageHero hero={content.hero} />

      <Section tone="mist" labelledBy="directory-heading" id="directory">
        {content.directorySection.eyebrow ? <Eyebrow>{content.directorySection.eyebrow}</Eyebrow> : null}
        <Heading className="mt-1 max-w-3xl md:mt-2">
          <span id="directory-heading">{content.directorySection.title}</span>
        </Heading>
        <StaticPeopleListing
          roleFilters={content.roleFilters}
          practiceAreaFilters={content.practiceAreaFilters}
          initial={{ people: people.data, details }}
        />
      </Section>

      <PageEnd />
    </>
  );
}
