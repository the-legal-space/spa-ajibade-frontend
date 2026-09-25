"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

/** "Sort By" dropdown that writes ?sort= into the URL (and resets to page 1). */
export function SortMenu({ options, defaultValue }: { options: { value: string; label: string }[]; defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("sort") ?? defaultValue;

  return (
    <label className="relative inline-flex items-center">
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
        className="h-[42px] appearance-none rounded-[4px] border border-mist-300 bg-white pl-4 pr-10 text-[13px] text-ink outline-none hover:border-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value === defaultValue ? `Sort By: ${o.label}` : o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-stone" aria-hidden />
    </label>
  );
}
