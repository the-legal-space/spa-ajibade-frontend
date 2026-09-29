"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Recognition } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
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
    { key: "achievements", label: labels.achievementsLabel, items: achievements },
    { key: "recognizedBy", label: labels.recognizedByLabel, items: recognizedBy },
  ].filter((t) => t.items.length > 0);
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  if (!current) return null;

  return (
    <div>
      {tabs.length > 1 ? (
        <div role="tablist" aria-label="Recognition" className="relative flex gap-6 border-b border-mist-300">
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
                  isSelected ? "font-medium text-ink" : "text-stone hover:text-ink",
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
        <MotionP className="font-serif text-[2rem] leading-tight md:text-[2.75rem]">{current.label}</MotionP>
      )}

      <AnimatePresence mode="wait">
        <motion.ul
          key={current.key}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role={tabs.length > 1 ? "tabpanel" : undefined}
          className="mt-6 space-y-0 divide-y divide-black/10 border-t border-black/10"
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
  const label = `${item.organization}: ${item.title}${item.year ? ` ${item.year}` : ""}`;

  return (
    <motion.div
      whileHover={INTERACTION.card.whileHover}
      whileTap={INTERACTION.card.whileTap}
      transition={TRANSITIONS.hover}
      className="flex items-center justify-between gap-4 border-b border-black/10 py-4"
    >
      <span className="text-xl leading-tight text-ink" aria-label={label}>{item.organization}</span>
    </motion.div>
  );
}
