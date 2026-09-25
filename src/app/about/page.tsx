import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPage } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { CmsIcon } from "@/components/ui/icon";
import { buttonClass } from "@/components/ui/button";
import { FaqAccordion } from "@/components/sections/faq-accordion";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return pageMetadata(page.seo, { title: page.hero.title, description: page.hero.subtitle, path: "/about" });
}

export default async function AboutPage() {
  const page = await getPage("about");
  const { story, stats, missionSection, principles, awardsList } = page;

  return (
    <>
      <PageHero hero={page.hero} />

      {/* Our story */}
      <Section tone="white" labelledBy="story-heading">
        <div className="grid gap-12 lg:grid-cols-[1fr_551px]">
          <div className="flex flex-col">
            {story.eyebrow ? <Eyebrow>{story.eyebrow}</Eyebrow> : null}
            {story.quote ? (
              <figure className="mt-12 lg:mt-24">
                <blockquote className="max-w-sm font-serif text-2xl leading-snug md:text-[1.75rem]">
                  {story.quote} <span className="text-5xl leading-none text-mist-300" aria-hidden>&rdquo;</span>
                </blockquote>
                {story.quotePerson ? (
                  <figcaption className="mt-3">
                    <div className="aspect-[278/337] w-full max-w-[278px] overflow-hidden">
                      <Media image={story.quotePerson.photo} placeholder="portrait" name={story.quotePerson.displayName} alt={`Portrait of ${story.quotePerson.displayName}`} />
                    </div>
                    <Link href={`/people/${story.quotePerson.slug}`} className="mt-3 block text-sm font-medium hover:underline">
                      {story.quotePerson.displayName}
                    </Link>
                    <span className="text-sm text-stone">{story.quotePerson.roleLabel}</span>
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>
          <div>
            <Heading className="text-olive">
              <span id="story-heading">{story.title}</span>
            </Heading>
            <hr className="my-8 border-mist-200" />
            <div className="space-y-6 text-[15px] leading-8 text-ink-800">
              {story.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Stats */}
      {stats.items.length > 0 ? (
        <Section tone="white" className="pt-0 md:pt-0" labelledBy="stats-heading">
          <Heading>
            <span id="stats-heading">{stats.title}</span>
          </Heading>
          <dl className="mt-8 grid border-l border-t border-mist-200 sm:grid-cols-2 lg:grid-cols-4">
            {stats.items.map((s) => (
              <div key={s.value} className="border-b border-r border-mist-200 px-5 py-8">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <p className="font-serif text-2xl">{s.value}</p>
                  <p className="mt-2 text-sm text-ink-700">{s.caption}</p>
                  <p className="mt-2 font-serif text-xl italic text-stone-400">{s.label}</p>
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {/* Mission, vision & values */}
      <Section tone="mist" labelledBy="mission-heading">
        {missionSection.eyebrow ? <Eyebrow>{missionSection.eyebrow}</Eyebrow> : null}
        <Heading className="mt-2 max-w-3xl">
          <span id="mission-heading">{missionSection.title}</span>
        </Heading>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="aspect-[544/520] overflow-hidden rounded-md">
            <Media image={missionSection.image} sizes="(min-width:1024px) 50vw, 100vw" />
          </div>
          <FaqAccordion
            tone="white"
            defaultOpen={0}
            items={missionSection.items.map((m, i) => ({
              id: `mission-${i}`,
              question: m.title,
              answerHtml: `<p>${escapeHtml(m.body)}</p>`,
            }))}
          />
        </div>
      </Section>

      {/* Principles */}
      <Section tone="white" className="relative overflow-hidden" labelledBy="principles-heading">
        {principles.image ? (
          <div className="pointer-events-none absolute right-0 top-0 hidden h-[420px] w-[340px] lg:block" aria-hidden>
            <Media image={principles.image} className="object-contain" />
          </div>
        ) : null}
        <div className="relative">
          {principles.eyebrow ? <Eyebrow>{principles.eyebrow}</Eyebrow> : null}
          <Heading className="mt-2 max-w-3xl">
            <span id="principles-heading">{principles.title}</span>
          </Heading>
          <ul className="mt-10 grid border-l border-t border-mist-200 bg-white sm:grid-cols-2 lg:grid-cols-3">
            {principles.items.map((p) => (
              <li key={p.title} className="border-b border-r border-mist-200 p-8">
                <CmsIcon name={p.icon} className="size-7" />
                <h3 className="mt-8 font-serif text-2xl text-olive">{p.title}</h3>
                {p.text ? <p className="mt-2 text-[15px] leading-7 text-ink-800">{p.text}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Awards */}
      {awardsList.items.length > 0 ? (
        <section id="recognition" className="bg-ink py-16 text-white md:py-[68px]" aria-labelledby="awards-heading">
          <div className="container-site grid items-center gap-10 lg:grid-cols-2">
            <div>
              {awardsList.eyebrow ? <p className="text-xs text-white/70">{awardsList.eyebrow}</p> : null}
              <Heading className="mt-3">
                <span id="awards-heading">{awardsList.title}</span>
              </Heading>
              <ul className="mt-6 border-t border-white/15">
                {awardsList.items.map((a) => (
                  <li key={a.name} className="flex items-center justify-between gap-4 border-b border-white/15 py-4">
                    <span className="text-xl">{a.name}</span>
                    {a.url ? (
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className={buttonClass("light", "px-5")}>
                        View Awards <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden aspect-[524/560] overflow-hidden lg:block">
              <Media image={awardsList.image} placeholder="dark" />
            </div>
          </div>
        </section>
      ) : null}

      <PageEnd />
    </>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
