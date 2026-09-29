import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata: Metadata = { title: "Terms of Service", robots: { index: false } };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" topic="terms of service" />;
}
