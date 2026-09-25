import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getPage } from "@/lib/api/endpoints";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { formatLongDate } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { Heading, Section } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("careers");
  return pageMetadata(page.seo, { title: "Careers", description: page.hero.subtitle, path: "/careers" });
}

export default async function CareersPage() {
  const page = await getPage("careers");

  return (
    <>
      <PageHero hero={page.hero} />

      <Section tone="mist" labelledBy="jobs-heading">
        <Heading>
          <span id="jobs-heading">{page.jobsSection.title}</span>
        </Heading>

        {page.jobs.length > 0 ? (
          <ul className="mt-10 space-y-8">
            {page.jobs.map((job) => (
              <li key={job.id}>
                <article className="rounded-[var(--radius-card)] bg-white p-5 md:p-6" aria-labelledby={`job-${job.id}`}>
                  {job.practiceArea ? <p className="text-sm font-semibold">{job.practiceArea.title}</p> : null}
                  <div className="prose-firm mt-4 text-base leading-8 md:text-[1.05rem]" dangerouslySetInnerHTML={{ __html: cleanHtml(job.description) }} />
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {job.chips.map((c) => (
                      <li key={c} className="rounded-[4px] bg-mist px-2.5 py-1.5 text-[12px]">
                        {c}
                      </li>
                    ))}
                    {job.closingDate ? <li className="rounded-[4px] bg-mist px-2.5 py-1.5 text-[12px]">Closes {formatLongDate(job.closingDate)}</li> : null}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <h3 id={`job-${job.id}`} className="font-serif text-2xl md:text-[1.75rem]">
                      {job.title}
                    </h3>
                    <Link href={`/careers/${job.id}`} className={buttonClass("pillDark")}>
                      Send your CV
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-center rounded-[var(--radius-card)] bg-white px-6 py-16 text-center">
            <Briefcase className="size-10 text-stone" strokeWidth={1.2} aria-hidden />
            <p className="mt-4 font-serif text-2xl">No open roles right now</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone">
              We aren&apos;t recruiting at the moment. New vacancies are posted here first, so please check back.
            </p>
          </div>
        )}
      </Section>

      <PageEnd />
    </>
  );
}
