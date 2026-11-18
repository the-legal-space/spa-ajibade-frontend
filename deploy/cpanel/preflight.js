/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * cPanel preflight check. Shipped at the root of the `cpanel-build` branch next to server.js.
 *
 * The account has no shell, so this stands in for one: set it as the Node app's startup file on a
 * test path (e.g. spaajibade.com/spa-preflight), open that URL, and read the plain-text report.
 * It checks the files, which settings are present (names only, never values), outbound access to
 * MongoDB and SMTP (logs in to SMTP but sends nothing), then starts the real site privately on
 * 127.0.0.1 and requests a few pages. Switch the startup file to server.js for the real launch.
 */
const http = require("node:http");
const net = require("node:net");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const ROOT = __dirname;
const CACHE_MS = 60 * 1000;
let last = null; // { at, text }
let running = null;

/** Strip anything that could be a credential out of an error message. */
const clean = (s) =>
  String(s)
    .replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, "mongodb://***")
    .replace(/(pass(word)?|secret|token|key)=\S+/gi, "$1=***");

const line = (ok, label, detail = "") => `${ok === null ? "--" : ok ? "OK" : "!!"}  ${label}${detail ? `: ${detail}` : ""}`;

function tcp(host, port, ms = 5000) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(ms, () => done("timed out"));
    socket.once("connect", () => done(true));
    socket.once("error", (e) => done(e.code || e.message));
  });
}

function checkFiles(out) {
  out.push("== Files");
  for (const f of ["server.js", ".next/static", "public", "node_modules"]) {
    out.push(line(fs.existsSync(path.join(ROOT, f)), f));
  }
  const envFiles = fs.readdirSync(ROOT).filter((f) => f.startsWith(".env"));
  out.push(line(envFiles.length === 0, "no .env files in the app folder", envFiles.length ? `FOUND ${envFiles.join(", ")}: delete them` : ""));
}

function checkEnv(out) {
  out.push("", "== Settings (present or not; values are never shown)");
  const required = ["MONGODB_URI", "MAIL_USER", "MAIL_PASS", "SMTP_HOST", "SMTP_PORT", "MAIL_FROM", "MAIL_SIGNING_SECRET", "REVALIDATE_SECRET"];
  for (const name of required) out.push(line(!!process.env[name], name, process.env[name] ? "set" : "MISSING"));
  for (const name of ["MAIL_BCC", "MAIL_MESSAGE_TO", "MAIL_FORWARD_DOMAINS", "MONGODB_DB"]) {
    out.push(line(null, name, process.env[name] ? "set" : "not set (optional)"));
  }
  const mustBeUnset = { MAIL_TEST_RECIPIENT: "sends attorney emails to a test inbox", MAIL_DRY_RUN: "sends no email at all" };
  for (const [name, why] of Object.entries(mustBeUnset)) {
    out.push(line(!process.env[name], `${name} not set`, process.env[name] ? `SET (${why}): remove it` : ""));
  }
  out.push(line(process.env.MOCK_CSR !== "on", "MOCK_CSR not on", process.env.MOCK_CSR === "on" ? "ON (placeholder stories would show): remove it" : ""));
  out.push(line(process.env.NODE_ENV === "production", "NODE_ENV=production", process.env.NODE_ENV || "not set"));
}

async function checkMongo(out) {
  out.push("", "== MongoDB");
  const uri = process.env.MONGODB_URI;
  if (!uri) return out.push(line(false, "MONGODB_URI missing", "bookings won't be stored"));
  let MongoClient;
  try {
    ({ MongoClient } = require("mongodb"));
  } catch {
    return out.push(line(false, "mongodb package", "not in the build"));
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    await client.db(process.env.MONGODB_DB || "spa_ajibade").command({ ping: 1 });
    out.push(line(true, "connect + ping"));
  } catch (e) {
    out.push(line(false, "connect + ping", clean(e.message) + " [check Atlas Network Access allows this server's IP, and that the host allows outbound port 27017]"));
  } finally {
    await client.close().catch(() => {});
  }
}

async function checkMail(out) {
  out.push("", "== Email (SMTP)");
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const reach = await tcp(host, port);
  out.push(line(reach === true, `outbound ${host}:${port}`, reach === true ? "" : `${reach} [the host may block outbound SMTP]`));
  if (reach !== true) return;
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) return out.push(line(false, "SMTP login", "MAIL_USER / MAIL_PASS missing"));
  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch {
    return out.push(line(false, "nodemailer package", "not in the build"));
  }
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const transport = nodemailer.createTransport({ host, port, secure, requireTLS: !secure, auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS } });
  try {
    await transport.verify(); // logs in, sends nothing
    out.push(line(true, "SMTP login (nothing sent)"));
  } catch (e) {
    const hint = /5\.7\.139|SmtpClientAuthentication is disabled/i.test(e.message)
      ? " [Microsoft 365: enable Authenticated SMTP for this mailbox]"
      : /\b535\b/.test(e.message) ? " [wrong MAIL_USER / MAIL_PASS]" : "";
    out.push(line(false, "SMTP login", clean(e.message) + hint));
  } finally {
    transport.close();
  }
}

async function checkSite(out) {
  out.push("", "== The site itself (started privately on 127.0.0.1, not visible to visitors)");
  if (!fs.existsSync(path.join(ROOT, "server.js"))) return out.push(line(false, "server.js missing"));
  const port = 3900 + Math.floor(Math.random() * 90);
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), HOSTNAME: "127.0.0.1", NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  try {
    const base = `http://127.0.0.1:${port}`;
    let up = false;
    for (let i = 0; i < 40 && !up; i++) {
      await new Promise((r) => setTimeout(r, 500));
      up = (await tcp("127.0.0.1", port, 500)) === true;
    }
    out.push(line(up, "server.js started", up ? "" : "did not start within 20 s"));
    if (!up) return;
    for (const p of ["/", "/about", "/people", "/practice-areas", "/insights", "/this-page-does-not-exist"]) {
      try {
        const res = await fetch(base + p, { redirect: "manual", signal: AbortSignal.timeout(30000) });
        const expected = p === "/this-page-does-not-exist" ? 404 : 200;
        out.push(line(res.status === expected, `GET ${p}`, String(res.status)));
      } catch (e) {
        out.push(line(false, `GET ${p}`, clean(e.message)));
      }
    }
    try {
      const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(15000) });
      out.push(line(res.ok, "GET /api/health", `${res.status} ${await res.text()}`));
    } catch (e) {
      out.push(line(false, "GET /api/health", clean(e.message)));
    }
  } finally {
    child.kill();
    const tail = clean(log).trim().split("\n").slice(-15).join("\n");
    if (tail) out.push("", "-- server.js log (last lines)", tail);
  }
}

async function report() {
  const out = [`SPA Ajibade cPanel preflight, ${new Date().toISOString()}, Node ${process.version}`, ""];
  checkFiles(out);
  checkEnv(out);
  await checkMongo(out);
  await checkMail(out);
  await checkSite(out);
  const failures = out.filter((l) => l.startsWith("!!")).length;
  out.push("", failures ? `RESULT: ${failures} problem(s) marked !! above.` : "RESULT: all checks passed. Switch the startup file to server.js at cutover.");
  return out.join("\n");
}

http
  .createServer(async (_req, res) => {
    try {
      if (!last || Date.now() - last.at > CACHE_MS) {
        running ??= report().finally(() => (running = null));
        last = { at: Date.now(), text: await running };
      }
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      res.end(last.text);
    } catch (e) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Preflight crashed: ${clean(e && e.stack ? e.stack : e)}`);
    }
  })
  .listen(Number(process.env.PORT) || 3000);
