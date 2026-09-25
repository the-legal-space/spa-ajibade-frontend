import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/api/endpoints";
import { ApiNotFoundError } from "@/lib/api/client";
import { cleanHtml } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { formatLongDate } from "@/lib/utils";
import { DetailHero } from "@/components/sections/page-hero";
import { ContactCallout } from "@/components/sections/contact-callout";
import { getSite } from "@/lib/api/endpoints";
import { Section } from "@/components/ui/primitives";
import { ApplicationForm } from "@/components/forms/application-form";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  if (!/^[0-9a-f]{24}$/.test(id)) notFound();
  try {
    return await getJob(id);
  } catch (e) {
    if (e instanceof ApiNotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await load(id);
  return pageMetadata(undefined, { title: `${job.title} | Careers`, description: `${job.title}, ${job.office?.name ?? ""}. Apply to SPA Ajibade & Co.`, path: `/careers/${id}` });
}

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const [job, site] = await Promise.all([load(id), getSite()]);

  return (
    <>
      <DetailHero
        eyebrow={
          <Link href="/careers" className="hover:text-white">
            ← Careers
          </Link>
        }
        title={job.title}
      >
        <ul className="mt-6 flex flex-wrap gap-2">
          {job.chips.map((c) => (
            <li key={c} className="rounded-[4px] border border-white/20 px-3 py-1.5 text-xs">
              {c}
            </li>
          ))}
          {job.closingDate ? <li className="rounded-[4px] border border-white/20 px-3 py-1.5 text-xs">Closes {formatLongDate(job.closingDate)}</li> : null}
        </ul>
      </DetailHero>

      <Section tone="mist">
        <div className="grid gap-10 lg:grid-cols-[1fr_520px]">
          <div>
            {job.practiceArea ? <p className="text-sm font-semibold">{job.practiceArea.title}</p> : null}
            <div className="prose-firm mt-4" dangerouslySetInnerHTML={{ __html: cleanHtml(job.description) }} />
          </div>
          <div className="rounded-[var(--radius-card)] bg-white p-6 md:p-8">
            <h2 className="font-serif text-2xl">Send your CV</h2>
            <p className="mt-1 text-sm text-stone">PDF or Word (.docx), up to 5 MB.</p>
            <div className="mt-6">
              <ApplicationForm jobId={job.id} jobTitle={job.title} />
            </div>
          </div>
        </div>
      </Section>

      <ContactCallout callout={site.contactCallout} />
    </>
  );
}
