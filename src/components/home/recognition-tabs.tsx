"use client";

import { useState } from "react";
import type { Recognition } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/media";

export function RecognitionTabs({
  labels,
  achievements,
  recognizedBy,
}: {
  labels: { achievementsLabel: string; recognizedByLabel: string };
  achievements: Recognition[];
  recognizedBy: Recognition[];
}) {
  const tabs = [
    { key: "achievements", label: labels.achievementsLabel, items: achievements },
    { key: "recognizedBy", label: labels.recognizedByLabel, items: recognizedBy },
  ].filter((t) => t.items.length > 0);
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  if (!current) return null;

  return (
    <div>
      {tabs.length > 1 ? (
        <div role="tablist" aria-label="Recognition" className="flex gap-6 border-b border-mist-300">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={t.key === current.key}
              onClick={() => setActive(t.key)}
              className={cn("-mb-px border-b-2 pb-3 text-sm", t.key === current.key ? "border-ink text-ink" : "border-transparent text-stone hover:text-ink")}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="font-serif text-[2rem] leading-tight md:text-[2.75rem]">{current.label}</p>
      )}
      <ul role={tabs.length > 1 ? "tabpanel" : undefined} className="mt-6 flex flex-wrap gap-4">
        {current.items.map((b) => (
          <li key={b.id}>
            <Badge item={b} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ item }: { item: Recognition }) {
  const label = `${item.organization}: ${item.title}${item.year ? ` ${item.year}` : ""}`;
  const inner = item.badge ? (
    <span className="block h-[100px] w-[88px] bg-white p-2">
      <Media image={item.badge} alt={label} className="object-contain" />
    </span>
  ) : (
    <span className="flex h-[100px] w-[112px] flex-col items-center justify-center bg-white px-2 text-center" aria-label={label}>
      <span className="font-serif text-[13px] leading-tight">{item.organization}</span>
      <span className="mt-1 text-[9px] uppercase tracking-wider text-stone">{item.title}</span>
      {item.year ? <span className="mt-1 text-[11px] font-semibold">{item.year}</span> : null}
    </span>
  );
  return item.url ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block transition hover:opacity-80">
      {inner}
    </a>
  ) : (
    inner
  );
}
