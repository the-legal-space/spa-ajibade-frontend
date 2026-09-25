import Link from "next/link";
import type { FilterOption } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

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
      <ul className="flex w-max gap-2">
        {options.map((o) => {
          const isActive = o.value === active;
          return (
            <li key={o.value || "all"}>
              <Link
                href={withParams(base, current, { [param]: o.value || undefined, page: undefined })}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-[34px] items-center rounded-[4px] border px-4 text-[13px] transition-colors",
                  isActive ? "border-ink bg-ink text-white" : "border-mist-300 bg-white text-ink hover:border-ink",
                )}
              >
                {o.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
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
  if (totalPages <= 1) return null;
  const prev = page > 1 ? withParams(base, current, { page: page - 1 }) : null;
  const next = page < totalPages ? withParams(base, current, { page: page + 1 }) : null;
  const btn = "inline-flex h-9 items-center rounded-[4px] border border-mist-300 bg-white px-3 text-[13px]";
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between rounded-[4px] border border-mist-300 bg-white px-5 py-3.5">
      <p className="text-[13px] text-ink-700">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {prev ? (
          <Link href={prev} scroll={false} className={cn(btn, "hover:border-ink")} rel="prev">
            Previous
          </Link>
        ) : (
          <span className={cn(btn, "opacity-40")} aria-disabled>
            Previous
          </span>
        )}
        {next ? (
          <Link href={next} scroll={false} className={cn(btn, "hover:border-ink")} rel="next">
            Next
          </Link>
        ) : (
          <span className={cn(btn, "opacity-40")} aria-disabled>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
