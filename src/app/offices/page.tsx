import type { Metadata } from "next";
import { Clock, Mail, MapPin, Navigation, PhoneCall } from "lucide-react";
import { getPage } from "@/lib/api/endpoints";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";
import { PageHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";
import { Heading, Section } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("offices");
  return pageMetadata(page.seo, { title: "Our Offices", description: page.hero.subtitle, path: "/offices" });
}

function directions(o: { directionsUrl: string | null; coordinates: { lat: number; lng: number } | null; address: string; name: string }) {
  if (o.directionsUrl) return o.directionsUrl;
  if (o.coordinates) return `https://www.google.com/maps/dir/?api=1&destination=${o.coordinates.lat},${o.coordinates.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.address}, ${o.name}, Nigeria`)}`;
}

// The offices page is not in the Figma yet; it uses the same card language as Careers.
export default async function OfficesPage() {
  const page = await getPage("offices");

  return (
    <>
      <PageHero hero={page.hero} />
      <Section tone="mist">
        <ul className="grid gap-5 lg:grid-cols-3">
          {page.offices.map((o) => {
            const tel = telHref(o.phone);
            return (
              <li key={o.id}>
                <article id={o.slug} className="flex h-full flex-col rounded-[var(--radius-card)] bg-white p-6 md:p-7" aria-labelledby={`office-${o.slug}`}>
                  <Heading as="h2" size="h3">
                    <span id={`office-${o.slug}`}>{o.name}</span>
                  </Heading>
                  <dl className="mt-5 flex-1 space-y-4 text-[15px] leading-6">
                    <div className="flex gap-3">
                      <dt className="sr-only">Address</dt>
                      <MapPin className="mt-0.5 size-4 shrink-0 text-stone" aria-hidden />
                      <dd>{o.address}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="sr-only">Opening hours</dt>
                      <Clock className="mt-0.5 size-4 shrink-0 text-stone" aria-hidden />
                      <dd>{o.hours}</dd>
                    </div>
                    {o.phone ? (
                      <div className="flex gap-3">
                        <dt className="sr-only">Phone</dt>
                        <PhoneCall className="mt-0.5 size-4 shrink-0 text-stone" aria-hidden />
                        <dd>{tel ? <a href={tel} className="hover:underline">{o.phone}</a> : o.phone}</dd>
                      </div>
                    ) : null}
                    {o.email ? (
                      <div className="flex gap-3">
                        <dt className="sr-only">Email</dt>
                        <Mail className="mt-0.5 size-4 shrink-0 text-stone" aria-hidden />
                        <dd>
                          <a href={`mailto:${o.email}`} className="hover:underline">
                            {o.email}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <a href={directions(o)} target="_blank" rel="noopener noreferrer" className={buttonClass("dark", "mt-6 w-full")}>
                    <Navigation className="size-4" aria-hidden /> Get directions
                  </a>
                </article>
              </li>
            );
          })}
        </ul>
      </Section>
      <PageEnd />
    </>
  );
}
