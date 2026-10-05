import type { Metadata } from "next";
import DiscussApp from "@/components/discuss/DiscussApp";
import "@/components/discuss/discuss.css";

export const metadata: Metadata = {
  title: "Discuss a Mandate",
  description: "Tell us what you need and choose a time to speak with the SPA Ajibade & Co. lawyer best suited to your matter.",
  alternates: { canonical: "/discuss" },
};

export default function DiscussPage() {
  return (
    <div className="booking-app" data-header-theme="dark">
      <div className="booking-wrapper">
        <DiscussApp />
      </div>
    </div>
  );
}
