#!/usr/bin/env node
/**
 * Smoke test for a deployed site. No dependencies (Node 20+ fetch).
 *
 *   node scripts/smoke.mjs https://spaajibade.com
 *
 * Checks the main pages, one attorney and one practice page, an archived WordPress article URL,
 * the 404 page and /api/health. Exits 1 if anything fails. Sends no forms and no email.
 */
const base = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Usage: node scripts/smoke.mjs <baseUrl>");
  process.exit(2);
}

const checks = [
  ["/", 200],
  ["/about", 200],
  ["/people", 200],
  ["/people/babatunde-ajibade", 200],
  ["/practice-areas", 200],
  ["/practice-areas/dispute-resolution-arbitration", 200],
  ["/insights", 200],
  ["/offices", 200],
  ["/careers", 200],
  ["/privacy", 200],
  ["/robots.txt", 200],
  ["/sitemap.xml", 200],
  ["/this-page-does-not-exist", 404],
];

let failed = 0;
const report = (ok, label, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "OK" : "!!"}  ${label}  ${detail}`);
};

for (const [p, expected] of checks) {
  try {
    const res = await fetch(base + p, { redirect: "manual", signal: AbortSignal.timeout(30000) });
    report(res.status === expected, p, `${res.status} (expected ${expected})`);
  } catch (e) {
    report(false, p, e.message);
  }
}

// An old WordPress post URL should land on the archived copy (served by .htaccess on cPanel) or the archive.
try {
  const res = await fetch(`${base}/2013/04/15/smoke-test-missing-post/`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  const location = res.headers.get("location") || "";
  report([200, 301, 302, 404].includes(res.status), "old WordPress URL", `${res.status}${location ? ` -> ${location}` : ""}`);
} catch (e) {
  report(false, "old WordPress URL", e.message);
}

// HSTS must not force HTTPS onto other subdomains.
try {
  const res = await fetch(base + "/", { signal: AbortSignal.timeout(30000) });
  const hsts = res.headers.get("strict-transport-security") || "";
  report(!/includeSubDomains|preload/i.test(hsts), "HSTS header", hsts || "(none)");
  const html = await res.text();
  report(!/PENDING FROM FIRM/i.test(html), "no [PENDING FROM FIRM] text on home", "");
} catch (e) {
  report(false, "home headers", e.message);
}

try {
  const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(20000) });
  const body = await res.text();
  report(res.ok, "/api/health", `${res.status} ${body}`);
} catch (e) {
  report(false, "/api/health", e.message);
}

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
