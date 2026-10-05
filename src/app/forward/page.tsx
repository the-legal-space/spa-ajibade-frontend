import type { Metadata } from "next";
import { Suspense } from "react";
import ForwardForm from "@/components/discuss/ForwardForm";
import "@/components/discuss/discuss.css";

export const metadata: Metadata = {
  title: "Forward a booking",
  robots: { index: false, follow: false },
};

export default function ForwardPage() {
  return (
    <div className="booking-app" data-header-theme="dark">
      <div className="booking-wrapper">
        <main className="booking-main">
          <Suspense fallback={null}>
            <ForwardForm />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
