import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative -mt-[70px] bg-ink pt-[70px] text-white">
      <div className="container-site flex min-h-[60vh] flex-col items-start justify-center py-24">
        <p className="text-sm text-white/60">404</p>
        <h1 className="mt-3 font-serif text-4xl md:text-[3.25rem]">We couldn&apos;t find that page.</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
          It may have been moved, or it isn&apos;t published yet. Try one of these instead.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonClass("light")}>
            Go to the homepage
          </Link>
          <Link href="/practice-areas" className={buttonClass("ghostDark")}>
            Practice areas
          </Link>
          <Link href="/people" className={buttonClass("ghostDark")}>
            Our people
          </Link>
        </div>
      </div>
    </section>
  );
}
