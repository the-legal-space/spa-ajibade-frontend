"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { motion } from "motion/react";
import type {
  InsightCard as Insight,
  PersonSummary,
  PracticeAreaCard as PracticeArea,
} from "@/lib/api/schemas";
import { cn, formatMonthYear, initials } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { Chip } from "@/components/ui/primitives";
import { SocialIcon } from "@/components/ui/social-icons";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { INTERACTION, TRANSITIONS } from "@/lib/motion";
import {
  FIGMA,
  insightCardCover,
  personAvatar,
  personPhoto,
  practiceImage,
} from "@/lib/figma-assets";

const MotionLink = motion.create(Link);

export function PracticeAreaCard({
  area,
  headingLevel = "h3",
}: {
  area: PracticeArea;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  return (
    <motion.article
      whileHover={INTERACTION.card.whileHover}
      whileTap={INTERACTION.card.whileTap}
      transition={TRANSITIONS.hover}
      className="group flex h-full flex-col rounded-[var(--radius-card)] bg-white p-3.5 transition-shadow duration-300 hover:shadow-md"
    >
      <div className="aspect-[331/240] overflow-hidden rounded-xl">
        <Media
          image={practiceImage(area.slug, area.image)}
          alt=""
          className="transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <H className="mt-4 font-serif text-xl">{area.title}</H>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-7 text-ink-700">
        {area.summary}
      </p>
      <MotionLink
        href={`/practice-areas/${area.slug}`}
        whileHover={INTERACTION.button.whileHover}
        whileTap={INTERACTION.button.whileTap}
        transition={TRANSITIONS.hover}
        className={buttonClass("dark", "mt-4 w-full rounded-[12px]! py-2.5")}
        aria-label={`Learn more about ${area.title}`}
      >
        Learn More <ArrowRight className="size-4" aria-hidden />
      </MotionLink>
    </motion.article>
  );
}

export type PersonCardDetails = {
  practiceAreas: { slug: string; title: string }[];
  summary: string | null;
};

const MANDATE_LINK = {
  label: "Discuss a Mandate",
  href: "action:mandate",
  kind: "action" as const,
};

/**
 * Figma partner card ("Partner Grid") with the "HOVER ANIMATION" state: hovering (or focusing)
 * the card grows the white "+" square into a panel over the photo with the role, practice areas,
 * a short summary and "Discuss a Mandate". On touch screens the "+" toggles the panel.
 * The name still opens the attorney's profile.
 */
export function PersonCard({
  person,
  details,
}: {
  person: PersonSummary;
  details?: PersonCardDetails;
}) {
  const href = `/people/${person.slug}`;
  const [open, setOpen] = useState(false);
  const panelId = `person-panel-${person.slug}`;
  return (
    <motion.article
      whileHover={INTERACTION.card.whileHover}
      transition={TRANSITIONS.hover}
      data-open={open || undefined}
      onMouseLeave={() => setOpen(false)}
      className="group/card relative flex flex-col gap-1.5 rounded-[24px] bg-white p-2 transition-shadow duration-300 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden rounded-[16px] bg-card-blue">
        <Media
          image={personPhoto(person.slug, person.photo)}
          alt={`Portrait of ${person.displayName}`}
          placeholder="portrait"
          name={person.displayName}
          sizes="(min-width:1024px) 440px, (min-width:640px) 50vw, 100vw"
        />

        {/* The "+" square that grows into the panel (top-right anchored, like the Figma smart animate). */}
        <div
          id={panelId}
          className={cn(
            "absolute right-4 top-4 z-20 overflow-hidden rounded-[2px] bg-white text-ink shadow-sm",
            "size-9 transition-[width,height,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            "group-hover/card:h-[calc(100%-32px)] group-hover/card:w-[calc(100%-32px)] group-hover/card:rounded-[16px]",
            "group-focus-within/card:h-[calc(100%-32px)] group-focus-within/card:w-[calc(100%-32px)] group-focus-within/card:rounded-[16px]",
            "group-data-[open]/card:h-[calc(100%-32px)] group-data-[open]/card:w-[calc(100%-32px)] group-data-[open]/card:rounded-[16px]",
          )}
        >
          <div
            className={cn(
              "flex h-full w-[calc(100%)] min-w-[240px] flex-col p-5 opacity-0 transition-opacity duration-200 md:p-6",
              "group-hover/card:opacity-100 group-hover/card:delay-200 group-focus-within/card:opacity-100 group-data-[open]/card:opacity-100 group-data-[open]/card:delay-200",
            )}
          >
            <p className="text-lg leading-tight">{person.roleLabel}</p>
            {details?.practiceAreas.length ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {details.practiceAreas.slice(0, 3).map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/practice-areas/${a.slug}`}
                      tabIndex={-1}
                      className="inline-block max-w-full truncate rounded-[4px] border-[0.5px] border-gray bg-mist px-2 py-1.5 text-[11px] leading-none hover:border-ink"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {details?.summary ? (
              <p className="mt-3 line-clamp-4 text-[15px] italic leading-7 text-ink">
                {details.summary}
              </p>
            ) : null}
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <SmartLink
                link={MANDATE_LINK}
                practiceArea={details?.practiceAreas[0]?.slug}
                className={buttonClass("dark", "w-full")}
              />
              <Link
                href={href}
                className="text-center text-xs text-stone underline underline-offset-2 hover:text-ink"
              >
                View full profile
              </Link>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Hide" : "Show"} details for ${person.displayName}`}
          className="absolute right-4 top-4 z-30 grid size-9 place-items-center rounded-[2px] text-ink md:pointer-events-none md:group-focus-within/card:pointer-events-auto"
        >
          <svg
            viewBox="0 0 14 14"
            className="size-3.5 transition-transform duration-300 group-hover/card:rotate-45 group-focus-within/card:rotate-45 group-data-[open]/card:rotate-45"
            aria-hidden
          >
            <path d="M0 7h14M7 0v14" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
      <div className="flex min-h-[84px] items-center justify-between gap-3 rounded-[16px] bg-ink p-4 text-white">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-medium leading-tight md:text-xl">
            <Link href={href} className="hover:underline">
              {person.displayName}
            </Link>
          </h3>
          <p className="truncate text-base leading-6 tracking-[-0.02em] text-mist">
            {person.roleLabel}
          </p>
        </div>
        {person.linkedinUrl ? (
          <motion.a
            href={person.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={TRANSITIONS.hover}
            className="relative z-10 shrink-0"
            aria-label={`${person.displayName} on LinkedIn`}
          >
            <SocialIcon name="linkedin" className="size-6" />
          </motion.a>
        ) : (
          <SocialIcon name="linkedin" className="size-6 shrink-0" />
        )}
      </div>
    </motion.article>
  );
}

function AuthorLine({ author }: { author: Insight["author"] }) {
  if (author.type === "person") {
    const p = author.person;
    const avatar = personAvatar(p.slug, p.photo);
    return (
      <Link
        href={`/people/${p.slug}`}
        className="group/author flex min-w-0 items-center gap-2"
      >
        <span className="size-[30px] shrink-0 overflow-hidden rounded-full bg-card-blue">
          {avatar ? (
            <Media image={avatar} alt="" sizes="30px" />
          ) : (
            <span className="grid size-full place-items-center text-[10px] text-white">
              {initials(p.displayName)}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5 leading-none">
          <span className="block truncate text-xs text-ink group-hover/author:underline">
            {p.displayName}
          </span>
          <span className="block truncate text-[10px] text-ink/80">
            {p.roleLabel}
          </span>
        </span>
      </Link>
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      {/* The firm's own mark from the Figma, the same on every firm-authored card. */}
      <img
        src={FIGMA.firmAvatar}
        alt=""
        width={30}
        height={30}
        className="size-[30px] shrink-0 rounded-full"
      />
      <span className="flex min-w-0 flex-col gap-0.5 leading-none">
        <span className="block truncate text-xs text-ink">{author.name}</span>
        <span className="block truncate text-[10px] text-ink/80">
          {author.label}
        </span>
      </span>
    </span>
  );
}

function insightChipHref(insight: Pick<Insight, "categories" | "practiceAreas">) {
  const params = new URLSearchParams();
  const category = insight.categories[0];
  const practiceArea = insight.practiceAreas[0]?.slug;

  if (category) params.set("category", category);
  if (practiceArea) params.set("practiceArea", practiceArea);

  return params.size > 0 ? `/insights?${params.toString()}` : undefined;
}

export function InsightCard({
  insight,
  className,
}: {
  insight: Insight;
  className?: string;
}) {
  const href = `/insights/${insight.slug}`;
  const date = formatMonthYear(insight.publishedAt);
  const isVideo = insight.format === "video";
  return (
    <motion.article
      whileHover={INTERACTION.card.whileHover}
      whileTap={INTERACTION.card.whileTap}
      transition={TRANSITIONS.hover}
      className={cn("group flex h-full flex-col", className)}
    >
      <Link
        href={href}
        className="relative block aspect-[437/271] overflow-hidden rounded-[4px]"
        tabIndex={-1}
        aria-hidden
      >
        <Media
          image={insightCardCover(insight.slug, insight.coverImage)}
          alt=""
          sizes="(min-width:1024px) 437px, (min-width:640px) 50vw, 85vw"
          className="transition duration-500 group-hover:scale-[1.03]"
        />
        {isVideo ? (
          <span className="absolute inset-0 grid place-items-center">
            <motion.span
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="grid size-14 place-items-center rounded-full bg-white/30 backdrop-blur"
            >
              <Play className="size-6 fill-white text-white" />
            </motion.span>
          </span>
        ) : null}
      </Link>
      {/* Chips stay on one line: long labels ("Dispute Resolution and Arbitration") truncate. */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 gap-1">
          {insight.chips.slice(0, 2).map((c) => {
            const href = insightChipHref(insight);
            return (
              <Chip key={c} title={c} href={href} className="underline underline-offset-2">
                {c}
              </Chip>
            );
          })}
        </div>
        {date ? (
          <Chip compact className="shrink-0">
            {date}
          </Chip>
        ) : null}
      </div>
      <h3 className="mt-3 line-clamp-3 flex-1 text-base font-medium leading-7 text-ink">
        <Link href={href} className="hover:underline">
          {insight.title}
        </Link>
      </h3>
      <div className="mt-3 flex items-center justify-between gap-3 overflow-visible">
        <AuthorLine author={insight.author} />
        <MotionLink
          href={href}
          whileHover={INTERACTION.button.whileHover}
          whileTap={INTERACTION.button.whileTap}
          transition={TRANSITIONS.hover}
          className="inline-flex shrink-0 origin-right items-center gap-1 rounded-[4px] border-[0.5px] border-gray px-3 py-2 text-xs leading-none text-ink transition-colors hover:border-ink"
        >
          {isVideo ? "Watch Video" : insight.cta?.label || "Read More"}{" "}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </MotionLink>
      </div>
    </motion.article>
  );
}
