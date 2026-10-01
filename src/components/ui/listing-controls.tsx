"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import type { FilterOption } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { INTERACTION, TRANSITIONS } from "@/lib/motion";

const MotionLink = motion.create(Link);

/** Builds a URL keeping existing params, applying overrides, and dropping empty values. */
export function withParams(base: string, current: Record<string, string | undefined>, overrides: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== "" && !(k === "page" && String(v) === "1")) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Filter tabs as plain links, so filtered views are shareable and crawlable. */
export function FilterTabs({
  options,
  param,
  base,
  current,
  label,
}: {
  options: FilterOption[];
  param: string;
  base: string;
  current: Record<string, string | undefined>;
  label: string;
}) {
  const active = current[param] ?? "";
  return (
    <nav aria-label={label} className="hide-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <ul className="flex w-max gap-2 py-0.5">
        {options.map((o) => {
          const isActive = o.value === active;
          return (
            <li key={o.value || "all"}>
              <MotionLink
                href={withParams(base, current, { [param]: o.value || undefined, page: undefined })}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-[34px] items-center rounded-[4px] border-[0.5px] px-4 text-[13px] transition-colors",
                  isActive ? "border-ink bg-ink text-white shadow-xs" : "border-mist-300 bg-white text-ink hover:border-ink",
                )}
              >
                {o.label}
              </MotionLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Compact practice-area dropdown used beside the Insights category tabs. */
export function FilterMenu({
  options,
  param,
  base,
  current,
  label,
}: {
  options: FilterOption[];
  param: string;
  base: string;
  current: Record<string, string | undefined>;
  label: string;
}) {
  const active = current[param] ?? "";

  return (
    <details className="group relative z-20 shrink-0 self-end lg:self-auto">
      <summary className="flex h-[34px] min-w-[120px] cursor-pointer list-none items-center justify-between gap-3 rounded-[4px] border-[0.5px] border-mist-300 bg-white px-4 text-[13px] text-ink shadow-xs marker:hidden hover:border-ink">
        Sort By
        <ChevronDown className="size-4 text-stone transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute right-0 top-[calc(100%+4px)] w-[min(300px,calc(100vw-40px))] overflow-hidden rounded-xl border border-mist-200 bg-white shadow-lg">
        <p className="px-4 pb-2 pt-3 text-[11px] font-semibold text-ink">{label}</p>
        <ul className="max-h-[320px] overflow-y-auto pb-2">
          {[{ value: "", label: "All Practice Areas" }, ...options].map((option) => (
            <li key={option.value || "all"}>
              <Link
                href={withParams(base, current, { [param]: option.value || undefined, page: undefined })}
                scroll={false}
                aria-current={option.value === active ? "page" : undefined}
                className={cn(
                  "block border-t border-mist-100 px-4 py-2.5 text-[12px] transition-colors hover:bg-mist",
                  option.value === active ? "font-medium text-ink" : "text-ink-700",
                )}
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export function Pagination({
  page,
  totalPages,
  base,
  current,
}: {
  page: number;
  totalPages: number;
  base: string;
  current: Record<string, string | undefined>;
}) {
  if (totalPages < 1) return null;
  const prev = page > 1 ? withParams(base, current, { page: page - 1 }) : null;
  const next = page < totalPages ? withParams(base, current, { page: page + 1 }) : null;
  const btn = "inline-flex h-9 items-center rounded-[4px] border-[0.5px] border-mist-300 bg-white px-3 text-[13px] transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between rounded-[4px] border border-mist-300 bg-white px-5 py-3.5 shadow-xs">
      <p className="text-[13px] text-ink-700">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {prev ? (
          <MotionLink
            href={prev}
            scroll={false}
            whileHover={INTERACTION.button.whileHover}
            whileTap={INTERACTION.button.whileTap}
            transition={TRANSITIONS.hover}
            className={cn(btn, "hover:border-ink")}
            rel="prev"
          >
            Previous
          </MotionLink>
        ) : (
          <span className={cn(btn, "opacity-40")} aria-disabled>
            Previous
          </span>
        )}
        {next ? (
          <MotionLink
            href={next}
            scroll={false}
            whileHover={INTERACTION.button.whileHover}
            whileTap={INTERACTION.button.whileTap}
            transition={TRANSITIONS.hover}
            className={cn(btn, "hover:border-ink")}
            rel="next"
          >
            Next
          </MotionLink>
        ) : (
          <span className={cn(btn, "opacity-40")} aria-disabled>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
