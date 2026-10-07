import type { Metadata } from "next";
import { getPage } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
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
import { RecognitionFeature } from "@/components/home/recognition-feature";
import { FIGMA, cmsOr } from "@/lib/figma-assets";
import { getCardDetails } from "@/lib/person-card";
import { withoutDefaultFocus } from "@/lib/utils";
import { REVEAL } from "@/lib/motion";
import { MotionP } from "@/components/ui/motion-p";
import { MotionList, MotionListItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/reveal";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return pageMetadata(page.seo, { absoluteTitle: true, path: "/" });
}

export default async function HomePage() {
  const page = await getPage("home");
  const { aboutFirm, whyChooseUs } = page;
  // CMS hero image and slides; the Figma photograph only fills in when the CMS has none.
  const hero = { ...page.hero, image: withoutDefaultFocus(cmsOr(page.hero.image, FIGMA.heroHome)) };
  const cardDetails = await getCardDetails(page.leadership);
  // The Figma carousel shows five focus areas, in this order. Anything else the CMS lists stays
  // on the Practice Areas page. If none of these slugs exist, fall back to the CMS list.
  const FOCUS = [
    "corporate-finance-capital-markets",
    "energy-natural-resources",
    "dispute-resolution-arbitration",
    "intellectual-property",
    "real-estate-succession",
  ];
  const focused = FOCUS.map((slug) =>
    page.practiceAreas.find((a) => a.slug === slug),
  ).filter((a): a is NonNullable<typeof a> => !!a);
  const practiceAreas = focused.length > 0 ? focused : page.practiceAreas;

  return (
    <>
      <PageHero hero={hero} size="lg" imageClassName="object-top" />

      {/* A Firm Built On Integrity */}
      <section
        className="relative overflow-hidden bg-mist py-8 text-ink md:py-[68px]"
        aria-labelledby="about-firm"
      >
        {/* Figma "About Image": world map at 8% behind the copy. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: `url(${FIGMA.aboutMap})` }}
        />
        <div className="container-site relative flex flex-col items-stretch gap-2 md:items-start md:gap-11 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-2.5">
            <Heading className="max-w-[666px]">
              <span id="about-firm">{aboutFirm.title}</span>
            </Heading>
            <div className="space-y-9 text-sm leading-7 text-ink md:text-xl md:leading-9">
              {aboutFirm.paragraphs.map((p, i) => (
                <MotionP
                  key={i}
                  transition={{ ...REVEAL.transition, delay: i * 0.15 }}
                >
                  {p}
                </MotionP>
              ))}
            </div>
          </div>
          {aboutFirm.cta ? (
            <Reveal className="max-md:w-full">
              <SmartLink
                link={aboutFirm.cta}
                className={buttonClass("outline")}
              />
            </Reveal>
          ) : null}
        </div>
      </section>

      <VideoShowcase showcase={page.videoShowcase} />

      <RecognitionFeature section={page.recognitionSection} />

      {/* Focused Practice Areas */}
      {practiceAreas.length > 0 ? (
        <section
          data-header-theme="dark"
          className="overflow-hidden bg-[#0a0a0b] py-8 text-white md:py-[68px]"
          aria-labelledby="practice-heading"
        >
          <div className="container-site max-md:px-4">
            <div className="flex flex-col items-center gap-1 text-center md:gap-1">
              {page.practiceSection.eyebrow ? (
                <Eyebrow tone="light" className="justify-center font-medium">
                  {page.practiceSection.eyebrow}
                </Eyebrow>
              ) : null}
              <Heading>
                <span id="practice-heading">{page.practiceSection.title}</span>
              </Heading>
            </div>
            <Reveal className="mt-2 md:mt-1">
              <PracticeCarousel
                areas={practiceAreas}
                cta={page.practiceSection.cta}
              />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Leadership */}
      {page.leadership.length > 0 ? (
        <Section tone="mist" labelledBy="leadership-heading">
          <div className="flex flex-wrap items-start justify-between gap-2 md:gap-6">
            <div>
              {page.leadershipSection.eyebrow ? (
                <Eyebrow>{page.leadershipSection.eyebrow}</Eyebrow>
              ) : null}
              <Heading className="mt-1 max-w-[895px] md:mt-2">
                <span id="leadership-heading">
                  {page.leadershipSection.title}
                </span>
              </Heading>
            </div>
            {page.leadershipSection.cta ? (
              <Reveal className="max-md:w-full">
                <SmartLink
                  link={page.leadershipSection.cta}
                  className={buttonClass("outline")}
                />
              </Reveal>
            ) : null}
          </div>
          <MotionList className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {page.leadership.map((p) => (
              <MotionListItem key={p.id}>
                <PersonCard person={p} details={cardDetails[p.slug]} />
              </MotionListItem>
            ))}
          </MotionList>
        </Section>
      ) : null}

      {/* Why clients choose us */}
      <Section tone="black" labelledBy="why-heading">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:py-[60px]">
          <div className="flex flex-col justify-center gap-2 md:gap-4 lg:gap-6">
            <div className="flex flex-col gap-1 md:gap-4">
              <div className="flex flex-col gap-1 md:gap-4">
                {whyChooseUs.eyebrow ? (
                  <MotionP className="text-sm font-medium text-gray">
                    {whyChooseUs.eyebrow}
                  </MotionP>
                ) : null}
                <Heading className="text-[#f2f1f0]">
                  <span id="why-heading">{whyChooseUs.title}</span>
                </Heading>
              </div>
              <MotionP className="text-sm leading-7 text-mist md:text-xl md:leading-9">
                {whyChooseUs.text}
              </MotionP>
            </div>
            <Reveal>
            <ul className="flex max-w-[328px] flex-col gap-2 md:gap-3">
              {whyChooseUs.points.map((pt) => (
                <li
                  key={pt.title}
                  className="flex items-center gap-3 md:gap-3 py-0 md:min-h-16 md:py-5"
                >
                  <CmsIcon name={pt.icon} className="size-5 shrink-0" />
                  <div>
                    <MotionP className="text-base text-[12px] leading-7">
                      {pt.title}
                    </MotionP>
                    {pt.text ? (
                      <MotionP className="mt-1 text-sm text-white/70">
                        {pt.text}
                      </MotionP>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            </Reveal>
          </div>
          <Reveal className="relative min-h-[307px] overflow-hidden rounded-[5px] md:min-h-[560px]">
            <Media
              image={withoutDefaultFocus(cmsOr(whyChooseUs.image, FIGMA.whyClients))}
              sizes="(min-width:1024px) 50vw, 100vw"
              className="absolute inset-0 object-[50%_21%]"
            />
          </Reveal>
        </div>
      </Section>

      {/* Recent publications */}
      {page.latestInsights.length > 0 ? (
        <Section tone="mist" labelledBy="insights-heading">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {page.insightsSection.eyebrow ? (
                <Eyebrow>{page.insightsSection.eyebrow}</Eyebrow>
              ) : null}
              <Heading className="mt-1 md:mt-2">
                <span id="insights-heading">{page.insightsSection.title}</span>
              </Heading>
            </div>
          </div>
          <Reveal className="mt-2 md:mt-11">
            <ScrollRail
              label="Recent publications"
              footerStart={
                page.insightsSection.cta ? (
                  <SmartLink link={page.insightsSection.cta} className={buttonClass("outline", "w-full")} />
                ) : null
              }
            >
              {page.latestInsights.map((i) => (
                <div
                  key={i.id}
                  className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[437px]"
                >
                  <InsightCard insight={i} />
                </div>
              ))}
            </ScrollRail>
          </Reveal>
        </Section>
      ) : null}

      <PageEnd />
    </>
  );
}
