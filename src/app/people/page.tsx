import type { Metadata } from "next";
import { Suspense } from "react";
import { getPage, getPeople } from "@/lib/api/endpoints";
import { PersonRole } from "@/lib/api/schemas";
import { pageMetadata } from "@/lib/seo";
import { readPage, readString } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { PersonCard } from "@/components/sections/cards";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { FilterTabs, Pagination } from "@/components/ui/listing-controls";
import { SortMenu } from "@/components/ui/sort-menu";

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
  const sortRaw = readString(sp.sort);
  const sort = SORTS.find((s) => s.value === sortRaw)?.value ?? "seniority";
  const page = readPage(sp.page);

  const [content, people] = await Promise.all([getPage("people"), getPeople({ role, sort, page, pageSize: 9 })]);
  const current = { role, sort: sort === "seniority" ? undefined : sort };
  const meta = people.meta ?? { page, totalPages: 1 };

  return (
    <>
      <PageHero hero={content.hero} />

      <Section tone="mist" labelledBy="directory-heading" id="directory">
        {content.directorySection.eyebrow ? <Eyebrow>{content.directorySection.eyebrow}</Eyebrow> : null}
        <Heading className="mt-2 max-w-3xl">
          <span id="directory-heading">{content.directorySection.title}</span>
        </Heading>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <FilterTabs options={content.roleFilters} param="role" base="/people" current={current} label="Filter attorneys by role" />
          <Suspense fallback={null}>
            <SortMenu options={[...SORTS]} defaultValue="seniority" />
          </Suspense>
        </div>

        {people.data.length > 0 ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {people.data.map((p) => (
              <li key={p.id}>
                <PersonCard person={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-xl bg-white p-10 text-center text-stone">No attorneys are listed in this group yet.</p>
        )}

        <Pagination page={meta.page} totalPages={meta.totalPages} base="/people" current={current} />
      </Section>

      <PageEnd />
    </>
  );
}
