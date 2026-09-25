import { Bot, Mail, PhoneCall } from "lucide-react";
import type { Site } from "@/lib/api/schemas";
import { cleanHtml } from "@/lib/sanitize";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { FaqAccordion } from "./faq-accordion";

const actionIcon: Record<string, typeof Bot> = {
  "action:chat": Bot,
  "action:message": Mail,
  "action:call": PhoneCall,
};

export function FaqSection({ section, headingLevel = "h2" }: { section: Site["faqSection"]; headingLevel?: "h1" | "h2" }) {
  if (section.items.length === 0) return null;
  const items = section.items.map((f) => ({ id: f.id, question: f.question, answerHtml: cleanHtml(f.answer) }));
  const shq = section.stillHaveQuestions;

  return (
    <Section tone="white" labelledBy="faq-heading">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,450px)_1fr] lg:gap-4">
        <div className="flex flex-col justify-between gap-8">
          <div>
            {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
            <Heading as={headingLevel} className="mt-2" >
              <span id="faq-heading">{section.title}</span>
            </Heading>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-ink p-5 text-white">
            <div className="pointer-events-none absolute -top-16 left-1/3 size-56 rounded-full bg-white/25 blur-3xl" aria-hidden />
            <p className="relative text-xl">{shq.title}</p>
            <p className="relative mt-1 text-sm leading-6 text-white/85">{shq.text}</p>
            <div className="relative mt-5 flex flex-wrap gap-3">
              {shq.actions.map((a) => {
                const Icon = actionIcon[a.href];
                return (
                  <SmartLink key={a.href} link={a} className={buttonClass("pill", "text-[13px]")}>
                    {Icon ? <Icon className="size-4" strokeWidth={1.5} aria-hidden /> : null}
                    {a.label}
                  </SmartLink>
                );
              })}
            </div>
          </div>
        </div>
        <FaqAccordion items={items} />
      </div>
    </Section>
  );
}
