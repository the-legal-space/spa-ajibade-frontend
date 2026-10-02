import type { InsightCard } from "@/lib/api/schemas";

type InsightChipSource = Pick<InsightCard, "categories" | "categoryLabels" | "practiceAreas">;

export function getInsightChipHref(insight: InsightChipSource, chipLabel: string) {
  const practiceArea = insight.practiceAreas.find(
    (area) => area.title === chipLabel || area.shortLabel === chipLabel,
  );
  if (practiceArea) return `/practice-areas/${practiceArea.slug}`;

  const params = new URLSearchParams();
  const categoryIndex = insight.categoryLabels.indexOf(chipLabel);
  const category = insight.categories[categoryIndex] ?? insight.categories[0];
  if (category) params.set("category", category);
  if (insight.practiceAreas[0]) {
    params.set("practiceArea", insight.practiceAreas[0].slug);
  }

  const query = params.toString();
  return `${query ? `/insights?${query}` : "/insights"}#listing`;
}