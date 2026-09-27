"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { accordionPanelVariants, INTERACTION, TRANSITIONS } from "@/lib/motion";

export type AccordionItem = { id: string; question: string; answerHtml: string };

/** Single-open accordion with smooth height expand/collapse and icon morph. */
export function FaqAccordion({
  items,
  defaultOpen = 1,
  tone = "mist",
}: {
  items: AccordionItem[];
  defaultOpen?: number;
  tone?: "mist" | "white";
}) {
  const [open, setOpen] = useState<string | null>(items[defaultOpen]?.id ?? items[0]?.id ?? null);

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `faq-panel-${item.id}`;
        return (
          <li
            key={item.id}
            className={cn(
              "overflow-hidden rounded-xl transition-shadow duration-300",
              tone === "mist" ? "bg-mist" : "bg-white",
              isOpen ? "shadow-sm" : "",
            )}
          >
            <h3>
              <motion.button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                whileTap={INTERACTION.button.whileTap}
                transition={TRANSITIONS.tap}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="group flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors"
              >
                <span className="font-serif text-lg transition-colors group-hover:text-ink-700 md:text-[1.35rem]">
                  {item.question}
                </span>
                <motion.span
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-mist-200/80 text-ink transition-colors group-hover:bg-mist-300"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={TRANSITIONS.smooth}
                  aria-hidden
                >
                  {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </motion.span>
              </motion.button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  variants={accordionPanelVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    <div className="prose-firm text-[13px] leading-6" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
