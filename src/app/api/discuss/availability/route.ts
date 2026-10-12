import { clientIp, hit, jsonResponder, preflight } from "@/lib/mail/http";
import { bookedTimes } from "@/lib/discuss/bookings";
import { STAFF } from "@/lib/discuss/staff";

/**
 * GET /api/discuss/availability?staffId=john&date=2026-10-12: the times already booked with that
 * attorney on that day, so the booking page can grey them out. The booking route itself refuses a
 * taken slot too, so this only makes the page honest; it is not what prevents double bookings.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

export async function GET(req: Request) {
  const json = jsonResponder(req);
  const noStore = { "Cache-Control": "no-store" };

  if (hit(`availability:${clientIp(req)}`, 60, 60 * 1000).limited) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests." }, 429, { ...noStore, "Retry-After": "30" });
  }

  const url = new URL(req.url);
  const staffId = url.searchParams.get("staffId") ?? "";
  const date = url.searchParams.get("date") ?? "";
  if (!STAFF.some((s) => s.id === staffId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ ok: false, code: "BAD_REQUEST", message: "Invalid request." }, 400, noStore);
  }
  return json({ ok: true, booked: await bookedTimes(staffId, date) }, 200, noStore);
}
