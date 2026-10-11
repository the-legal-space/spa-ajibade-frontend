import Image from "next/image";
import { FIGMA } from "@/lib/figma-assets";

/** Dark title band shared by the long legal pages (Privacy Policy, Terms of Use). */
export function LegalHero({ title }: { title: string }) {
  return (
    <section
      data-header-theme="dark"
      className="relative -mt-(--header-h) overflow-hidden bg-ink pt-(--header-h) text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08]"
        style={{ backgroundImage: `url(${FIGMA.videoMark})` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-1/2 hidden w-[42vw] -translate-y-1/2 opacity-[0.12] md:block"
      >
        <Image src="/brand/mark.png" alt="" width={240} height={240} className="h-auto w-full" priority />
      </div>
      <div className="container-site relative py-16 md:py-20">
        <h1 className="max-w-4xl font-serif text-[2.75rem] leading-[1.02] normal-case tracking-[-0.02em] md:text-[4.25rem]">
          {title}
        </h1>
      </div>
    </section>
  );
}
