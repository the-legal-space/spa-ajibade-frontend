import type { Site } from "@/lib/api/schemas";
import { FIGMA } from "@/lib/figma-assets";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { Heading } from "@/components/ui/primitives";
import { MotionP } from "@/components/ui/motion-p";
import { Reveal } from "@/components/ui/reveal";

/** Figma "Contact Callout": sunset sky photograph under 70% black, centred copy and two buttons. */
export function ContactCallout({ callout }: { callout: Site["contactCallout"] }) {
  return (
    <section data-header-theme="dark" className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${FIGMA.contactCallout})` }} />
      <div aria-hidden className="absolute inset-0 bg-black/70" />
      <div className="container-site relative flex min-h-[460px] flex-col items-center justify-center gap-6 py-24 text-center md:min-h-[642px] md:py-[147px]">
        <div className="flex flex-col items-center gap-3">
          <Heading className="max-w-5xl">{callout.title}</Heading>
          <MotionP className="max-w-[894px] text-lg leading-8 text-mist md:text-2xl md:leading-[44px]">{callout.text}</MotionP>
        </div>
        <Reveal className="flex flex-wrap justify-center gap-3" delay={0.1}>
          {callout.primaryCta ? <SmartLink link={callout.primaryCta} className={buttonClass("light")} /> : null}
          {callout.secondaryCta ? <SmartLink link={callout.secondaryCta} className={buttonClass("ghostDark")} /> : null}
        </Reveal>
      </div>
    </section>
  );
}
