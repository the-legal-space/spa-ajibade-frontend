import type { Metadata } from "next";
import { STAFF } from "@/lib/discuss/staff";
import DiscussApp from "@/components/discuss/DiscussApp";
import "@/components/discuss/discuss.css";

export const metadata: Metadata = {
  title: "Discuss a Mandate",
  description: "Tell us what you need and choose a time to speak with the SPA Ajibade & Co. lawyer best suited to your matter.",
  alternates: { canonical: "/discuss" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DiscussPage({ searchParams }: Props) {
  const sp = await searchParams;
  const attorney = typeof sp.attorney === "string" ? sp.attorney : undefined;
  const preselected = STAFF.find((s) => s.slug === attorney) ?? null;

  return (
    <div className="booking-app" data-header-theme="dark">
      <div className="booking-wrapper">
        <DiscussApp preselectedStaffId={preselected?.id} />
      </div>
    </div>
  );
}
