import type { Site } from "@/lib/api/schemas";
import { SmartLink } from "@/components/ui/smart-link";
import { buttonClass } from "@/components/ui/button";
import { Heading } from "@/components/ui/primitives";
import { MotionP } from "@/components/ui/motion-p";

export function ContactCallout({ callout }: { callout: Site["contactCallout"] }) {
  return (
    <section data-header-theme="dark" className="bg-[linear-gradient(180deg,#0b1a2c_0%,#1e2a38_55%,#3b3f45_100%)] text-white">
      <div className="container-site flex min-h-[420px] flex-col items-center justify-center py-20 text-center md:min-h-[520px]">
        <Heading className="max-w-4xl">{callout.title}</Heading>
        <MotionP className="mt-4 max-w-2xl text-lg leading-8 text-white/85 md:text-[1.35rem] md:leading-9">{callout.text}</MotionP>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {callout.primaryCta ? <SmartLink link={callout.primaryCta} className={buttonClass("light")} /> : null}
          {callout.secondaryCta ? <SmartLink link={callout.secondaryCta} className={buttonClass("ghostDark")} /> : null}
        </div>
      </div>
    </section>
  );
}
