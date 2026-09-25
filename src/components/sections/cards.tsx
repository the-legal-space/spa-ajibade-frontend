import Link from "next/link";
import { ArrowRight, ArrowUpRight, Play, Plus } from "lucide-react";
import type { InsightCard as Insight, PersonSummary, PracticeAreaCard as PracticeArea } from "@/lib/api/schemas";
import { cn, formatMonthYear, initials } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { Chip } from "@/components/ui/primitives";
import { SocialIcon } from "@/components/ui/social-icons";
import { buttonClass } from "@/components/ui/button";

export function PracticeAreaCard({ area, headingLevel = "h3" }: { area: PracticeArea; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="flex h-full flex-col rounded-[var(--radius-card)] bg-white p-3.5">
      <div className="aspect-[331/240] overflow-hidden rounded-xl">
        <Media image={area.image} alt="" />
      </div>
      <H className="mt-4 font-serif text-xl">{area.title}</H>
      <p className="mt-2 line-clamp-4 flex-1 text-[13px] leading-6 text-ink-700">{area.summary}</p>
      <Link href={`/practice-areas/${area.slug}`} className={buttonClass("dark", "mt-4 w-full py-2.5")} aria-label={`Learn more about ${area.title}`}>
        Learn More <ArrowRight className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

export function PersonCard({ person }: { person: PersonSummary }) {
  return (
    <article className="group relative rounded-[var(--radius-card)] bg-white p-1.5">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Media image={person.photo} alt={`Portrait of ${person.displayName}`} placeholder="portrait" name={person.displayName} className="transition duration-500 group-hover:scale-[1.03]" />
        <Link
          href={`/people/${person.slug}`}
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-[4px] bg-white text-ink transition hover:bg-mist"
          aria-label={`View ${person.displayName}'s profile`}
        >
          <Plus className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl bg-ink px-3.5 py-3 text-white">
        <div className="min-w-0">
          <h3 className="truncate text-[1.05rem] leading-snug">
            <Link href={`/people/${person.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {person.displayName}
            </Link>
          </h3>
          <p className="text-sm text-white/85">{person.roleLabel}</p>
        </div>
        {person.linkedinUrl ? (
          <a
            href={person.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 shrink-0"
            aria-label={`${person.displayName} on LinkedIn`}
          >
            <SocialIcon name="linkedin" className="size-6" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function AuthorLine({ author }: { author: Insight["author"] }) {
  if (author.type === "person") {
    const p = author.person;
    return (
      <Link href={`/people/${p.slug}`} className="flex min-w-0 items-center gap-2 hover:underline">
        <span className="size-7 shrink-0 overflow-hidden rounded-full">
          {p.photo ? (
            <Media image={p.photo} alt="" />
          ) : (
            <span className="grid size-full place-items-center bg-[#56697a] text-[10px] text-white">{initials(p.displayName)}</span>
          )}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-xs text-ink">{p.displayName}</span>
          <span className="block text-[10px] text-stone">{p.roleLabel}</span>
        </span>
      </Link>
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-white" aria-hidden>
        <svg viewBox="0 0 32 32" className="size-4">
          <path d="M5 6 L16 16 L5 26 M27 6 L16 16 L27 26" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-xs text-ink">{author.name}</span>
        <span className="block text-[10px] text-stone">{author.label}</span>
      </span>
    </span>
  );
}

export function InsightCard({ insight, className }: { insight: Insight; className?: string }) {
  const href = `/insights/${insight.slug}`;
  const date = formatMonthYear(insight.publishedAt);
  const isVideo = insight.format === "video";
  return (
    <article className={cn("flex h-full flex-col", className)}>
      <Link href={href} className="relative block aspect-[357/221] overflow-hidden" tabIndex={-1} aria-hidden>
        <Media image={insight.coverImage} alt="" />
        {isVideo ? (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full bg-white/30 backdrop-blur">
              <Play className="size-6 fill-white text-white" />
            </span>
          </span>
        ) : null}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {insight.chips.slice(0, 2).map((c) => (
            <Chip key={c} className="underline underline-offset-2">
              {c}
            </Chip>
          ))}
        </div>
        {date ? <Chip className="shrink-0">{date}</Chip> : null}
      </div>
      <h3 className="mt-3 flex-1 text-[15px] leading-6 text-ink">
        <Link href={href} className="hover:underline">
          {insight.title}
        </Link>
      </h3>
      <div className="mt-4 flex items-center justify-between gap-3">
        <AuthorLine author={insight.author} />
        <Link href={href} className={buttonClass("outline", "px-2.5 py-1.5 text-xs")}>
          {isVideo ? "Watch Video" : insight.cta.label || "Read More"} <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
