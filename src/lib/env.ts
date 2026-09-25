export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://spaaco.onrender.com/api/v1"
).replace(/\/$/, "");

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const CONSENT_TEXT_VERSION = process.env.NEXT_PUBLIC_CONSENT_TEXT_VERSION || "v1-2026-09";

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
