"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { id: string; question: string; answerHtml: string };

/** Single-open accordion. Answers are pre-sanitised on the server. */
export function FaqAccordion({ items, defaultOpen = 1, tone = "mist" }: { items: AccordionItem[]; defaultOpen?: number; tone?: "mist" | "white" }) {
  const [open, setOpen] = useState<string | null>(items[defaultOpen]?.id ?? items[0]?.id ?? null);

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `faq-panel-${item.id}`;
        return (
          <li key={item.id} className={cn("rounded-xl", tone === "mist" ? "bg-mist" : "bg-white")}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
              >
                <span className="font-serif text-lg md:text-[1.35rem]">{item.question}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mist-200/80" aria-hidden>
                  {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" hidden={!isOpen} className="px-5 pb-5">
              <div className="prose-firm text-[13px] leading-6" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
