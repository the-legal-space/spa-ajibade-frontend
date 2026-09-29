import { Bot, Mail, PhoneCall } from "lucide-react";
import type { Site } from "@/lib/api/schemas";
import { cleanHtml } from "@/lib/sanitize";
import { Eyebrow, Heading, Section } from "@/components/ui/primitives";
import { SmartLink } from "@/components/ui/smart-link";
import { FaqAccordion } from "./faq-accordion";
import { FIGMA } from "@/lib/figma-assets";

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
    <Section tone="white" id="faq" labelledBy="faq-heading">
      <div className="grid gap-8 lg:grid-cols-[552fr_780fr] lg:gap-5">
        <div className="flex flex-col justify-between gap-8">
          <div>
            {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
            <Heading as={headingLevel} className="mt-2" >
              <span id="faq-heading">{section.title}</span>
            </Heading>
          </div>
          {/* Figma "FAQ Contact Panel": black-to-grey glow artwork behind the copy. */}
          <div
            className="relative overflow-hidden rounded-[12px] bg-ink bg-cover bg-center p-6 text-white"
            style={{ backgroundImage: `url(${FIGMA.faqPanel})` }}
          >
            <p className="relative text-2xl leading-none">{shq.title}</p>
            <p className="relative mt-1 text-base leading-6 tracking-[-0.02em] text-mist">{shq.text}</p>
            <div className="relative mt-6 flex flex-wrap gap-3 md:gap-5">
              {shq.actions.map((a) => {
                const Icon = actionIcon[a.href];
                return (
                  <SmartLink key={a.href} link={a} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-[32px] bg-mist px-4 text-sm leading-7 text-ink transition-colors hover:bg-white">
                    {Icon ? <Icon className="size-5" strokeWidth={1.5} aria-hidden /> : null}
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
