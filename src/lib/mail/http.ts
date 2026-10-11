import { NextResponse } from "next/server";

/** Shared by the mail routes: per-IP rate limiting and CORS for a separately hosted API. */

const hits = new Map<string, number[]>();
let lastSweep = 0;

/**
 * Counts one hit against `key` and reports whether it is over the limit (`max` hits per `windowMs`).
 * `retryAfter` is how many seconds until the oldest hit in the window expires. Hits made while over the
 * limit are not counted, so waiting out the window is always enough.
 * In memory: it resets when the server restarts, and each server instance keeps its own count.
 */
export function hit(key: string, max: number, windowMs: number): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return { limited: true, retryAfter: Math.max(1, Math.ceil(((recent[0] ?? now) + windowMs - now) / 1000)) };
  }
  recent.push(now);
  hits.set(key, recent);
  // Forget keys that have gone quiet (longest window used anywhere is a day).
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, v] of hits) if (v.every((t) => now - t >= 24 * 60 * 60 * 1000)) hits.delete(k);
  }
  return { limited: false, retryAfter: 0 };
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Per-IP limit for a route: `max` requests per window (default 5 per 10 minutes). */
export function rateLimited(bucket: string, req: Request, max = 5, windowMs = 10 * 60 * 1000) {
  return hit(`${bucket}:${clientIp(req)}`, max, windowMs).limited;
}

function allowedOrigins() {
  const configured = (process.env.MAIL_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const site = process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")] : [];
  return new Set([...configured, ...site, "http://localhost:3000"]);
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = { Vary: "Origin" };
  if (origin && allowedOrigins().has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

export const preflight = (req: Request) => new NextResponse(null, { status: 204, headers: corsHeaders(req) });

export function jsonResponder(req: Request) {
  const headers = corsHeaders(req);
  return (body: unknown, status: number, extra?: Record<string, string>) =>
    NextResponse.json(body, { status, headers: extra ? { ...headers, ...extra } : headers });
}
