"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { FilterOption } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { TRANSITIONS } from "@/lib/motion";
import { withParams } from "@/components/ui/listing-controls";

type SortOption = { value: string; label: string };

/** "Sort By" popover: a Practice Area list (filter) plus ordering options, all written to the URL. */
export function PeopleSortMenu({
  practiceAreas,
  sorts,
  defaultSort,
  base,
  current,
}: {
  practiceAreas: FilterOption[];
  sorts: SortOption[];
  defaultSort: string;
  base: string;
  current: Record<string, string | undefined>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeArea = current.practiceArea ?? "";
  const activeSort = current.sort ?? defaultSort;
  const row = "block border-b border-mist-200 py-3.5 text-[14px] leading-tight transition-colors last:border-b-0 hover:text-stone";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-[42px] cursor-pointer items-center gap-3 rounded-[4px] border border-mist-300 bg-white px-4 text-[13px] text-ink shadow-xs transition-colors hover:border-ink"
      >
        Sort By
        <ChevronDown className={cn("size-4 text-stone transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={TRANSITIONS.hover}
            className="absolute right-0 top-full z-20 mt-2 max-h-[70vh] w-[min(320px,calc(100vw-2.5rem))] overflow-y-auto rounded-xl bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <p className="border-b border-mist-200 pb-3 text-[14px] font-semibold">Practice Area</p>
            <ul>
              {practiceAreas.map((o) => (
                <li key={o.value || "all"}>
                  <Link
                    href={withParams(base, current, { practiceArea: o.value || undefined, page: undefined })}
                    scroll={false}
                    onClick={() => setOpen(false)}
                    aria-current={o.value === activeArea ? "true" : undefined}
                    className={cn(row, o.value === activeArea && "font-semibold")}
                  >
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-2 border-b border-mist-200 pb-3 pt-3 text-[14px] font-semibold">Order</p>
            <ul>
              {sorts.map((s) => (
                <li key={s.value}>
                  <Link
                    href={withParams(base, current, { sort: s.value === defaultSort ? undefined : s.value, page: undefined })}
                    scroll={false}
                    onClick={() => setOpen(false)}
                    aria-current={s.value === activeSort ? "true" : undefined}
                    className={cn(row, s.value === activeSort && "font-semibold")}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
