import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "FAQs" };

export default function FaqPage() {
  notFound();
}
