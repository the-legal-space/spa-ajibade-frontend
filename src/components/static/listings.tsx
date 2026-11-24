"use client";

/**
 * People and Insights listings for the static export (scripts/build-static.sh), where there is no server
 * to read ?role=, ?author=, ?page= ... on each request. The page is built once with its default view;
 * here the browser reads the query string and, when it asks for something else, filters a data file
 * built from the CMS at the same time (/data/people.json, /data/insights.json). The Node build never
 * uses this file: its pages filter on the server.
 */

import Link from "next/link";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import type { FilterOption, InsightCard as Insight, PersonSummary } from "@/lib/api/schemas";
import type { PersonCardDetails } from "@/lib/person-card";
import { InsightCard, PersonCard } from "@/components/sections/cards";
import { Heading } from "@/components/ui/primitives";
import { FilterMenu, FilterTabs, ListingResults, Pagination, usePendingFlag } from "@/components/ui/listing-controls";
import { PeopleSortMenu } from "@/components/ui/people-sort-menu";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/reveal";
import { buttonClass } from "@/components/ui/button";
import { loadInsightsIndex, publicationsOf, type InsightsIndex } from "@/lib/insights-index";

type Params = Pick<URLSearchParams, "get"> | null;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const readSlug = (params: Params, key: string) => params?.get(key)?.match(SLUG)?.[0];

/** Fetches a data file once per page load; a failed fetch can be retried by the next view that needs it. */
function loader<T>(url: string) {
  let promise: Promise<T> | null = null;
  return () =>
    (promise ??= fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return r.json() as Promise<T>;
    })).catch((error) => {
      promise = null;
      throw error;
    });
}

/** The data file, loaded only once a view needs it (the default view is already in the page). */
function useIndex<T>(load: () => Promise<T>, needed: boolean) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!needed || data) return;
    let live = true;
    load().then(
      (d) => live && setData(d),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [needed, data, load]);
  const loading = needed && !data && !failed;
  usePendingFlag(loading);
  return { data, loading, failed };
}

/** Renders children only when the query string has (or, with `absent`, doesn't have) `param`. */
export function WhenParam({ param, absent, children }: { param: string; absent?: boolean; children: ReactNode }) {
  return (
    <Suspense fallback={absent ? children : null}>
      <WhenParamInner param={param} absent={absent}>
        {children}
      </WhenParamInner>
    </Suspense>
  );
}

function WhenParamInner({ param, absent, children }: { param: string; absent?: boolean; children: ReactNode }) {
  const has = !!readSlug(useSearchParams(), param);
  return has !== !!absent ? children : null;
}

/* ------------------------------------------------------------------ People ------------------------------------------------------------------ */

export const PEOPLE_SORTS = [
  { value: "seniority", label: "Seniority" },
  { value: "name_asc", label: "Name (A to Z)" },
  { value: "name_desc", label: "Name (Z to A)" },
] as const;

export type PeopleIndex = {
  /** Person slugs per role tab, in seniority order. */
  roles: Record<string, string[]>;
  /** Person slugs per practice area. */
  areas: Record<string, string[]>;
  nameAsc: string[];
  nameDesc: string[];
  people: Record<string, PersonSummary>;
  details: Record<string, PersonCardDetails>;
};

const loadPeople = loader<PeopleIndex>("/data/people.json");

type PeopleProps = {
  roleFilters: FilterOption[];
  practiceAreaFilters: FilterOption[];
  /** The default view (first tab, seniority), rendered into the page at build time. */
  initial: { people: PersonSummary[]; details: Record<string, PersonCardDetails> };
};

export function StaticPeopleListing(props: PeopleProps) {
  return (
    <Suspense fallback={<PeopleView {...props} params={null} />}>
      <PeopleFromUrl {...props} />
    </Suspense>
  );
}

function PeopleFromUrl(props: PeopleProps) {
  return <PeopleView {...props} params={useSearchParams()} />;
}

function PeopleView({ roleFilters, practiceAreaFilters, initial, params }: PeopleProps & { params: Params }) {
  const defaultRole = roleFilters[0]?.value || undefined;
  const requestedRole = params?.get("role")?.match(/^[a-z_]+$/)?.[0];
  const role = requestedRole && roleFilters.some((f) => f.value === requestedRole) ? requestedRole : defaultRole;
  const practiceArea = readSlug(params, "practiceArea");
  const sort = PEOPLE_SORTS.find((s) => s.value === params?.get("sort"))?.value ?? "seniority";
  const isDefault = role === defaultRole && !practiceArea && sort === "seniority";
  const { data, loading, failed } = useIndex(loadPeople, !isDefault);
  const current = { role, practiceArea, sort: sort === "seniority" ? undefined : sort };

  let people = initial.people;
  let details = initial.details;
  if (!isDefault && data) {
    let slugs = (role ? data.roles[role] : undefined) ?? Object.keys(data.people);
    if (practiceArea) {
      const inArea = new Set(data.areas[practiceArea] ?? []);
      slugs = slugs.filter((s) => inArea.has(s));
    }
    if (sort !== "seniority") {
      const order = new Map((sort === "name_asc" ? data.nameAsc : data.nameDesc).map((s, i) => [s, i]));
      slugs = [...slugs].sort((a, b) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity));
    }
    people = slugs.map((s) => data.people[s]).filter((p): p is PersonSummary => !!p);
    details = data.details;
  }
  const activeFilters = [
    role ? roleFilters.find((f) => f.value === role)?.label : undefined,
    practiceArea ? practiceAreaFilters.find((f) => f.value === practiceArea)?.label : undefined,
  ].filter((v): v is string => !!v);
  const showing = isDefault || data;

  return (
    <>
      <Reveal className="relative z-[35] mt-2 md:mt-8 flex flex-col gap-2 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs options={roleFilters} param="role" base="/people" current={current} label="Filter people by role" />
        <PeopleSortMenu
          practiceAreas={[{ value: "", label: "All Practice Areas" }, ...practiceAreaFilters]}
          sorts={[...PEOPLE_SORTS]}
          defaultSort="seniority"
          base="/people"
          current={current}
        />
      </Reveal>

      <ListingResults>
        {failed ? (
          <LoadFailed />
        ) : !showing ? (
          // Until the data file arrives, keep the default list on screen (dimmed by the pending flag).
          <PeopleGrid people={initial.people} details={initial.details} listKey="loading" />
        ) : people.length > 0 ? (
          <PeopleGrid people={people} details={details} listKey={`${role}|${practiceArea}|${sort}`} />
        ) : (
          <Reveal className="mt-10 flex flex-col items-center rounded-[var(--radius-card)] bg-white px-6 py-16 text-center">
            <Users className="size-10 text-stone" strokeWidth={1.2} aria-hidden />
            <p className="mt-4 font-serif text-2xl">No one matches these filters</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone">
              {activeFilters.length > 0
                ? `We don't have anyone listed under ${activeFilters.join(" in ")} yet. ${practiceArea ? "Try a different combination." : "Please check back soon."}`
                : "No one is listed here yet. Please check back soon."}
            </p>
            <Link href="/people" scroll={false} className={buttonClass("outline", "mt-6")}>
              Clear filters
            </Link>
          </Reveal>
        )}
        {loading ? <span className="sr-only" role="status">Loading</span> : null}
      </ListingResults>
    </>
  );
}

function PeopleGrid({ people, details, listKey }: { people: PersonSummary[]; details: Record<string, PersonCardDetails>; listKey: string }) {
  return (
    <MotionList key={listKey} className="mt-2 md:mt-8 grid grid-cols-1 gap-2 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => (
        <MotionListItem key={p.id}>
          <PersonCard person={p} details={details[p.slug]} />
        </MotionListItem>
      ))}
    </MotionList>
  );
}

/* ------------------------------------------------------------------ Insights ------------------------------------------------------------------ */

const INSIGHTS_PAGE_SIZE = 15;

export type { InsightsIndex };

const loadInsights = loadInsightsIndex;

type InsightsProps = {
  title: string;
  categoryFilters: FilterOption[];
  practiceAreaFilters: FilterOption[];
  /** First page of the default view (all categories, newest first), rendered into the page at build time. */
  initial: { items: Insight[]; totalPages: number };
};

export function StaticInsightsListing(props: InsightsProps) {
  return (
    <Suspense fallback={<InsightsView {...props} params={null} />}>
      <InsightsFromUrl {...props} />
    </Suspense>
  );
}

function InsightsFromUrl(props: InsightsProps) {
  return <InsightsView {...props} params={useSearchParams()} />;
}

function InsightsView({ title, categoryFilters, practiceAreaFilters, initial, params }: InsightsProps & { params: Params }) {
  const requestedCategory = params?.get("category") ?? undefined;
  const category = categoryFilters.some((f) => f.value && f.value === requestedCategory) ? requestedCategory : undefined;
  const practiceArea = readSlug(params, "practiceArea");
  const sort = params?.get("sort") === "oldest" ? "oldest" : "newest";
  const pageParam = Number(params?.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const authorSlug = readSlug(params, "author");
  const isDefault = !category && !practiceArea && sort === "newest" && page === 1 && !authorSlug;
  const { data, loading, failed } = useIndex(loadInsights, !isDefault);

  // An unknown author slug shows everything, as on the server-rendered site.
  const authorName = authorSlug && data ? data.authors[authorSlug] : undefined;
  const author = authorName ? { slug: authorSlug!, displayName: authorName } : null;
  const current = { category, practiceArea, sort: sort === "newest" ? undefined : sort, author: author?.slug };

  let items = initial.items;
  let totalPages = initial.totalPages;
  let shownPage = 1;
  if (!isDefault && data) {
    let all = (author ? publicationsOf(data, author.slug) : data.items).filter(
      (i) =>
        (!category || i.categories.includes(category as Insight["categories"][number])) &&
        (!practiceArea || i.practiceAreas.some((p) => p.slug === practiceArea)),
    );
    if (sort === "oldest") all = [...all].reverse();
    totalPages = Math.max(1, Math.ceil(all.length / INSIGHTS_PAGE_SIZE));
    shownPage = Math.min(page, totalPages);
    items = all.slice((shownPage - 1) * INSIGHTS_PAGE_SIZE, shownPage * INSIGHTS_PAGE_SIZE);
  }
  const showing = isDefault || data;

  return (
    <>
      {author ? (
        <Link href={`/people/${author.slug}`} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-stone hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden /> {author.displayName}
        </Link>
      ) : null}
      <Heading as="h1" reveal={false}>
        <span id="listing-heading">{author ? `Publications by ${author.displayName}` : title}</span>
      </Heading>
      <Reveal className="relative z-[35] mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs options={categoryFilters} param="category" base="/insights" current={current} label="Filter by category" />
        <FilterMenu options={practiceAreaFilters} param="practiceArea" base="/insights" current={current} label="Practice Area" />
      </Reveal>

      <ListingResults>
        {failed ? (
          <LoadFailed />
        ) : items.length > 0 ? (
          <MotionList
            key={showing ? `${category}|${practiceArea}|${sort}|${shownPage}|${author?.slug}` : "loading"}
            className="mt-4 md:mt-10 grid min-w-0 gap-x-4 gap-y-4 md:gap-y-12 md:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((i) => (
              <MotionListItem key={i.id} className="min-w-0">
                <InsightCard insight={i} />
              </MotionListItem>
            ))}
          </MotionList>
        ) : (
          <p className="mt-10 rounded-xl bg-white p-10 text-center text-stone">Nothing has been published in this category yet.</p>
        )}
        {showing ? <Pagination page={shownPage} totalPages={totalPages} base="/insights" current={current} /> : null}
        {loading ? <span className="sr-only" role="status">Loading</span> : null}
      </ListingResults>
    </>
  );
}

function LoadFailed() {
  return (
    <p className="mt-10 rounded-xl bg-white p-10 text-center text-stone">
      This list couldn&apos;t load. Please check your connection and{" "}
      <button type="button" className="underline underline-offset-2" onClick={() => window.location.reload()}>
        try again
      </button>
      .
    </p>
  );
}
