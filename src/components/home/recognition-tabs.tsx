"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Recognition } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Media } from "@/components/ui/media";
import { MotionP } from "@/components/ui/motion-p";
import { INTERACTION, tabContentVariants, TRANSITIONS } from "@/lib/motion";

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
    {
      key: "achievements",
      label: labels.achievementsLabel,
      items: achievements,
    },
    {
      key: "recognizedBy",
      label: labels.recognizedByLabel,
      items: recognizedBy,
    },
  ].filter((t) => t.items.length > 0);
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  if (!current) return null;

  return (
    <div>
      {tabs.length > 1 ? (
        <div
          role="tablist"
          aria-label="Recognition"
          className="relative flex gap-6 border-b border-mist-300"
        >
          {tabs.map((t) => {
            const isSelected = t.key === current.key;
            return (
              <motion.button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={isSelected}
                whileTap={INTERACTION.button.whileTap}
                onClick={() => setActive(t.key)}
                className={cn(
                  "relative pb-3 text-sm transition-colors",
                  isSelected
                    ? "font-medium text-ink"
                    : "text-stone hover:text-ink",
                )}
              >
                {t.label}
                {isSelected ? (
                  <motion.span
                    layoutId="recognition-tab-underline"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink"
                    transition={TRANSITIONS.smooth}
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <MotionP className="font-serif text-[2rem] leading-tight md:text-[2.75rem]">
          {current.label}
        </MotionP>
      )}

      <AnimatePresence mode="wait">
        <motion.ul
          key={current.key}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role={tabs.length > 1 ? "tabpanel" : undefined}
          className="mt-6 flex flex-wrap gap-4"
        >
          {current.items.map((b) => (
            <li key={b.id}>
              <Badge item={b} />
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

function Badge({ item }: { item: Recognition }) {
  const organization = item.organization || item.directory?.name || "";
  const label = `${organization ? `${organization}: ` : ""}${item.title}${item.year ? ` ${item.year}` : ""}`;
  const inner = item.badge ? (
    <span className="block h-[100px] w-[88px] bg-white p-2">
      <Media image={item.badge} alt={label} className="object-contain" />
    </span>
  ) : (
    <span
      className="flex h-[100px] w-[112px] flex-col items-center justify-center bg-white px-2 text-center"
      aria-label={label}
    >
      <span className="font-serif text-[13px] leading-tight">
        {organization}
      </span>
      <span className="mt-1 text-[9px] uppercase tracking-wider text-stone">
        {item.title}
      </span>
      {item.year ? (
        <span className="mt-1 text-[11px] font-semibold">{item.year}</span>
      ) : null}
    </span>
  );

  return (
    <motion.div
      whileHover={INTERACTION.card.whileHover}
      whileTap={INTERACTION.card.whileTap}
      transition={TRANSITIONS.hover}
      className="shadow-xs transition-shadow duration-300 hover:shadow-sm"
    >
      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition hover:opacity-85"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </motion.div>
  );
}
