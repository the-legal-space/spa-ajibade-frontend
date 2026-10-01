"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { accordionPanelVariants, INTERACTION, TRANSITIONS } from "@/lib/motion";

export type AccordionItem = { id: string; question: string; answerHtml: string };

/**
 * Figma FAQ accordion: one item is always open (the first by default). Opening another closes
 * the current one; clicking the open item keeps it open, so the panel never collapses to nothing.
 */
export function FaqAccordion({
  items,
  defaultOpen = 0,
  tone = "mist",
}: {
  items: AccordionItem[];
  defaultOpen?: number;
  tone?: "mist" | "white";
}) {
  const [open, setOpen] = useState<string | null>(items[defaultOpen]?.id ?? items[0]?.id ?? null);

  return (
    <ul className="flex flex-col gap-4 lg:gap-5">
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `faq-panel-${item.id}`;
        return (
          <li
            key={item.id}
            className={cn(
              "overflow-hidden rounded-[12px]",
              tone === "mist" ? "bg-mist" : "bg-white",
            )}
          >
            <h3>
              <motion.button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                whileTap={INTERACTION.button.whileTap}
                transition={TRANSITIONS.tap}
                onClick={() => setOpen(item.id)}
                className={cn("group flex w-full items-center justify-between gap-5 p-5 text-left transition-[padding] duration-300 md:p-6", isOpen && "pb-2 md:pb-2")}
              >
                <span className="font-serif text-xl leading-7 text-[#0a0a0b] transition-colors group-hover:text-ink-700 md:text-2xl md:leading-[28px]">
                  {item.question}
                </span>
                <motion.span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full text-ink transition-colors",
                    isOpen ? "bg-[#e9e9e9]" : "bg-[rgba(10,10,11,0.04)] group-hover:bg-[#e9e9e9]",
                  )}
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={TRANSITIONS.smooth}
                  aria-hidden
                >
                  {isOpen ? <Minus className="size-5" strokeWidth={1.5} /> : <Plus className="size-5" strokeWidth={1.5} />}
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
                  <div className="px-5 pb-5 md:px-6 md:pb-6">
                    <div className="prose-firm text-sm leading-7 text-ink [&_p:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
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
