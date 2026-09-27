"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { TRANSITIONS } from "@/lib/motion";

/** "Sort By" dropdown that writes ?sort= into the URL (and resets to page 1). */
export function SortMenu({ options, defaultValue }: { options: { value: string; label: string }[]; defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("sort") ?? defaultValue;

  return (
    <motion.label
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={TRANSITIONS.hover}
      className="relative inline-flex items-center"
    >
      <span className="sr-only">Sort by</span>
      <select
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === defaultValue) next.delete("sort");
          else next.set("sort", e.target.value);
          next.delete("page");
          const qs = next.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="h-[42px] cursor-pointer appearance-none rounded-[4px] border border-mist-300 bg-white pl-4 pr-10 text-[13px] text-ink outline-none transition-colors hover:border-ink focus:border-ink shadow-xs"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value === defaultValue ? `Sort By: ${o.label}` : o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-stone" aria-hidden />
    </motion.label>
  );
}
