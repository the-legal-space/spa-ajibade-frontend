import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Our Offices" };

export default function OfficesPage() {
  notFound();
}
