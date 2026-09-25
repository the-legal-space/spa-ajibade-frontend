import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ALL_CONTENT_TAG } from "@/lib/api/client";

/**
 * Webhook for the backend's "content changed" notification.
 *
 *   POST /api/revalidate
 *   Header: x-revalidate-secret: <REVALIDATE_SECRET>
 *   Body (optional): { "tags": ["people", "person:john-onyido"] }
 *
 * With no tags, everything is refreshed. Tags used by the site: site, page:<key>,
 * practice-areas, practice-area:<slug>, people, person:<slug>, insights,
 * insight:<slug>, offices, jobs, job:<id>.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("x-revalidate-secret") ?? "";
  if (!expected || !safeEqual(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tags: string[] = [];
  try {
    const body = (await req.json()) as { tags?: unknown };
    if (Array.isArray(body.tags)) tags = body.tags.filter((t): t is string => typeof t === "string" && /^[a-z0-9:_-]{1,160}$/i.test(t)).slice(0, 50);
  } catch {
    /* empty body means refresh everything */
  }

  const toRefresh = tags.length ? tags : [ALL_CONTENT_TAG];
  for (const tag of toRefresh) revalidateTag(tag);
  return NextResponse.json({ revalidated: toRefresh, at: new Date().toISOString() });
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
