import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { getPage, getPeople } from "@/lib/api/endpoints";
import { PersonRole } from "@/lib/api/schemas";
import { pageMetadata } from "@/lib/seo";
import { readPage, readString } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { PersonCard } from "@/components/sections/cards";
import { getCardDetails } from "@/lib/person-card";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { FilterTabs, ListingResults, Pagination } from "@/components/ui/listing-controls";
import { PeopleSortMenu } from "@/components/ui/people-sort-menu";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/reveal";
import { buttonClass } from "@/components/ui/button";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const SORTS = [
  { value: "seniority", label: "Seniority" },
  { value: "name_asc", label: "Name (A to Z)" },
  { value: "name_desc", label: "Name (Z to A)" },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("people");
  return pageMetadata(page.seo, { title: "Our People", description: page.hero.subtitle, path: "/people" });
}

export default async function PeoplePage({ searchParams }: Props) {
  const sp = await searchParams;
  const roleParsed = PersonRole.safeParse(readString(sp.role));
  const role = roleParsed.success ? roleParsed.data : undefined;
  const practiceArea = readString(sp.practiceArea)?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)?.[0];
  const sortRaw = readString(sp.sort);
  const sort = SORTS.find((s) => s.value === sortRaw)?.value ?? "seniority";
  const page = readPage(sp.page);

  const [content, people] = await Promise.all([getPage("people"), getPeople({ role, practiceArea, sort, page, pageSize: 9 })]);
  const current = { role, practiceArea, sort: sort === "seniority" ? undefined : sort };
  const meta = people.meta ?? { page, totalPages: 1 };
  const cardDetails = await getCardDetails(people.data);
  // Human-readable names of the filters in use, for the empty state ("Partners in Tax").
  const activeFilters = [
    role ? content.roleFilters.find((f) => f.value === role)?.label : undefined,
    practiceArea ? content.practiceAreaFilters.find((f) => f.value === practiceArea)?.label : undefined,
  ].filter((v): v is string => !!v);

  return (
    <>
      <PageHero hero={content.hero} />

      <Section tone="mist" labelledBy="directory-heading" id="directory">
        {content.directorySection.eyebrow ? <Eyebrow>{content.directorySection.eyebrow}</Eyebrow> : null}
        <Heading className="mt-1 max-w-3xl md:mt-2">
          <span id="directory-heading">{content.directorySection.title}</span>
        </Heading>

        <Reveal className="relative z-[35] mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs options={content.roleFilters} param="role" base="/people" current={current} label="Filter attorneys by role" />
          <PeopleSortMenu
            practiceAreas={[{ value: "", label: "All Practice Areas" }, ...content.practiceAreaFilters]}
            sorts={[...SORTS]}
            defaultSort="seniority"
            base="/people"
            current={current}
          />
        </Reveal>

        <ListingResults>
        {people.data.length > 0 ? (
          <MotionList key={`${role}|${practiceArea}|${sort}|${page}`} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {people.data.map((p) => (
              <MotionListItem key={p.id}>
                <PersonCard person={p} details={cardDetails[p.slug]} />
              </MotionListItem>
            ))}
          </MotionList>
        ) : (
          <Reveal className="mt-10 flex flex-col items-center rounded-[var(--radius-card)] bg-white px-6 py-16 text-center">
            <Users className="size-10 text-stone" strokeWidth={1.2} aria-hidden />
            <p className="mt-4 font-serif text-2xl">No attorneys match these filters</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone">
              {activeFilters.length > 0
                ? `We don't have anyone listed under ${activeFilters.join(" in ")} yet. Try a different combination, or view everyone.`
                : "No attorneys are listed here yet. Please check back soon."}
            </p>
            {activeFilters.length > 0 || sort !== "seniority" ? (
              <Link href="/people" scroll={false} className={buttonClass("outline", "mt-6")}>
                Clear filters
              </Link>
            ) : null}
          </Reveal>
        )}

        {people.data.length > 0 ? <Pagination page={meta.page} totalPages={meta.totalPages} base="/people" current={current} /> : null}
        </ListingResults>
      </Section>

      <PageEnd />
    </>
  );
}
