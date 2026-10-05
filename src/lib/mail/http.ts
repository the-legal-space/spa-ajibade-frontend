import { NextResponse } from "next/server";

/** Shared by the mail routes: per-IP rate limiting and CORS for a separately hosted API. */

const hits = new Map<string, number[]>();

export function rateLimited(bucket: string, req: Request, max = 5, windowMs = 10 * 60 * 1000) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  return false;
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
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

export const preflight = (req: Request) => new NextResponse(null, { status: 204, headers: corsHeaders(req) });

export function jsonResponder(req: Request) {
  const headers = corsHeaders(req);
  return (body: unknown, status: number) => NextResponse.json(body, { status, headers });
}
