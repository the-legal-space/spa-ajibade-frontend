import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { getDb, mongoConfigured } from "@/lib/db/mongo";
import { mailConfigured } from "@/lib/mail/discuss";
import { clientIp, hit } from "@/lib/mail/http";

/**
 * GET /api/health: is this server able to do its job? Used by the cPanel preflight check, the smoke
 * test and uptime monitors. Reports only states, never hosts, addresses or secrets, and never sends email.
 *
 *   { ok, apiReachable, mongo: "ok" | "unconfigured" | "error", mail: "configured" | "unconfigured" }
 *
 * `ok` means the content API answers; the site can't render without it. Mongo and mail are reported
 * separately because the site still renders without them (only bookings are affected).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 5000;

export async function GET(req: Request) {
  // Each call reaches the API and the database, so keep it from being used to hammer them.
  if (hit(`health:${clientIp(req)}`, 30, 60 * 1000).limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Cache-Control": "no-store" } });
  }

  const [apiReachable, mongo] = await Promise.all([checkApi(), checkMongo()]);
  const body = { ok: apiReachable, apiReachable, mongo, mail: mailConfigured() ? "configured" : "unconfigured" };
  return NextResponse.json(body, { status: apiReachable ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}

async function checkApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/site`, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    return res.ok;
  } catch {
    return false;
  }
}

async function checkMongo(): Promise<"ok" | "unconfigured" | "error"> {
  if (!mongoConfigured()) return "unconfigured";
  try {
    const db = await getDb();
    await db?.command({ ping: 1 }, { timeoutMS: TIMEOUT_MS });
    return "ok";
  } catch {
    return "error";
  }
}
