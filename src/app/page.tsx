import type { Metadata } from "next";
import Link from "next/link";
import { getPage } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import type { Recognition } from "@/lib/api/schemas";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { InsightCard, PersonCard } from "@/components/sections/cards";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { Media } from "@/components/ui/media";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { CmsIcon } from "@/components/ui/icon";
import { PracticeCarousel } from "@/components/home/practice-carousel";
import { ScrollRail } from "@/components/home/scroll-rail";
import { VideoShowcase } from "@/components/home/video-showcase";
import { RecognitionTabs } from "@/components/home/recognition-tabs";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return pageMetadata(page.seo, { absoluteTitle: true, path: "/" });
}

export default async function HomePage() {
  const page = await getPage("home");
  const { aboutFirm, whyChooseUs } = page;
  const badges: Recognition[] = [...page.recognitions.achievements, ...page.recognitions.recognizedBy];

  return (
    <>
      <PageHero hero={page.hero} size="lg" />

      {/* A Firm Built On Integrity */}
      <Section tone="mist" className="relative overflow-hidden" labelledBy="about-firm">
        <WorldMap />
        <div className="relative">
          <Heading className="max-w-2xl" >
            <span id="about-firm">{aboutFirm.title}</span>
          </Heading>
          <div className="mt-5 space-y-6 text-base leading-8 text-ink-800 md:text-[1.05rem]">
            {aboutFirm.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {aboutFirm.cta ? <SmartLink link={aboutFirm.cta} className={buttonClass("outline", "mt-6 bg-transparent")} /> : null}
        </div>
      </Section>

      <VideoShowcase showcase={page.videoShowcase} />

      {/* Recognition */}
      {badges.length > 0 ? (
        <Section tone="mist">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_496px]">
            <div>
              <Eyebrow className="mb-3">Recognition</Eyebrow>
              <RecognitionTabs
                labels={page.recognitionTabs}
                achievements={page.recognitions.achievements}
                recognizedBy={page.recognitions.recognizedBy}
              />
              <Link href="/about#recognition" className={buttonClass("dark", "mt-8")}>
                View Our Recognitions
              </Link>
            </div>
            <div className="hidden aspect-[496/560] overflow-hidden rounded-2xl lg:block">
              <Media image={null} />
            </div>
          </div>
        </Section>
      ) : null}

      {/* Focused Practice Areas */}
      {page.practiceAreas.length > 0 ? (
        <section className="overflow-hidden bg-ink py-16 text-white md:py-[68px]" aria-labelledby="practice-heading">
          <div className="container-site">
            <div className="text-center">
              {page.practiceSection.eyebrow ? <Eyebrow tone="light" className="justify-center">{page.practiceSection.eyebrow}</Eyebrow> : null}
              <Heading className="mt-3">
                <span id="practice-heading">{page.practiceSection.title}</span>
              </Heading>
            </div>
            <div className="mt-6">
              <PracticeCarousel areas={page.practiceAreas} />
            </div>
            {page.practiceSection.cta ? (
              <div className="-mt-[50px]">
                <SmartLink link={page.practiceSection.cta} className={buttonClass("light")} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Leadership */}
      {page.leadership.length > 0 ? (
        <Section tone="mist" labelledBy="leadership-heading">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {page.leadershipSection.eyebrow ? <Eyebrow>{page.leadershipSection.eyebrow}</Eyebrow> : null}
              <Heading className="mt-2 max-w-3xl">
                <span id="leadership-heading">{page.leadershipSection.title}</span>
              </Heading>
            </div>
            {page.leadershipSection.cta ? <SmartLink link={page.leadershipSection.cta} className={buttonClass("outline")} /> : null}
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.leadership.map((p) => (
              <li key={p.id}>
                <PersonCard person={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Why clients choose us */}
      <Section tone="black" labelledBy="why-heading">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            {whyChooseUs.eyebrow ? <p className="text-xs text-white/70">{whyChooseUs.eyebrow}</p> : null}
            <Heading className="mt-3 max-w-lg">
              <span id="why-heading">{whyChooseUs.title}</span>
            </Heading>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/85">{whyChooseUs.text}</p>
            <ul className="mt-8 space-y-7">
              {whyChooseUs.points.map((pt) => (
                <li key={pt.title} className="flex gap-3">
                  <CmsIcon name={pt.icon} className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="text-[15px]">{pt.title}</p>
                    {pt.text ? <p className="mt-1 text-sm text-white/70">{pt.text}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="aspect-[645/557] overflow-hidden rounded-sm">
            <Media image={whyChooseUs.image} placeholder="dark" sizes="(min-width:1024px) 50vw, 100vw" />
          </div>
        </div>
      </Section>

      {/* Recent publications */}
      {page.latestInsights.length > 0 ? (
        <Section tone="mist" labelledBy="insights-heading">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {page.insightsSection.eyebrow ? <Eyebrow>{page.insightsSection.eyebrow}</Eyebrow> : null}
              <Heading className="mt-2">
                <span id="insights-heading">{page.insightsSection.title}</span>
              </Heading>
            </div>
            {page.insightsSection.cta ? <SmartLink link={page.insightsSection.cta} className={buttonClass("outline")} /> : null}
          </div>
          <div className="mt-10">
            <ScrollRail label="Recent publications">
              {page.latestInsights.map((i) => (
                <div key={i.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]">
                  <InsightCard insight={i} />
                </div>
              ))}
            </ScrollRail>
          </div>
        </Section>
      ) : null}

      <PageEnd />
    </>
  );
}

function WorldMap() {
  // Subtle dotted backdrop standing in for the world-map texture in the design.
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(#dcdcdc_1px,transparent_1px)] [background-size:14px_14px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]"
    />
  );
}
