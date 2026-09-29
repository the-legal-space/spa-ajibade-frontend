import { getSite } from "@/lib/api/endpoints";
import { DetailHero } from "@/components/sections/page-hero";
import { PageEnd } from "@/components/sections/page-end";

/**
 * Footer "Terms of Service" and "Privacy Policy" targets from the Figma.
 * The firm's approved text is not in the CMS yet, so the page says so plainly and gives
 * the contact address instead of showing invented legal wording.
 */
export async function LegalPage({ title, topic }: { title: string; topic: string }) {
  const site = await getSite();
  const email = site.settings.email;
  return (
    <>
      <DetailHero title={title} />
      <section className="bg-white py-16 md:py-[68px]">
        <div className="container-site max-w-3xl text-lg leading-8 text-ink">
          <p>
            The firm&apos;s {topic} is being finalised and will be published here.
            {email ? (
              <>
                {" "}
                For any question in the meantime, write to{" "}
                <a href={`mailto:${email}`} className="underline underline-offset-2">
                  {email}
                </a>
                .
              </>
            ) : null}
          </p>
        </div>
      </section>
      <PageEnd faq={false} />
    </>
  );
}
