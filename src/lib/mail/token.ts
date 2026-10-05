import { createHmac, createHash, timingSafeEqual } from "node:crypto";

/**
 * Signed, expiring link tokens for the "forward to another associate" action. The booking details
 * travel inside the token (nothing is stored), and the signature means only someone who received
 * the email can use the link; changing any detail invalidates it.
 *
 * Secret: MAIL_SIGNING_SECRET, or (if unset) derived from the mail password so it works out of the box.
 */

export type ForwardPayload = {
  v: 1;
  ref: string;
  f: string; // first name
  l: string; // last name
  e: string; // client email
  p: string; // client phone
  d: string; // date text
  t: string; // time text
  s: string; // staff id
  m: string; // message (shortened to keep the link a sensible length)
  x: number; // expiry, seconds since epoch
};

const TTL_DAYS = 45;
export const MAX_MESSAGE_IN_TOKEN = 700;

function secret() {
  const explicit = process.env.MAIL_SIGNING_SECRET;
  if (explicit) return explicit;
  const base = process.env.MAIL_PASS || process.env.EMAIL_PASS || "";
  return createHash("sha256").update("spa-forward:" + base).digest("hex");
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const sign = (body: string) => createHmac("sha256", secret()).update(body).digest();

export function createForwardToken(data: Omit<ForwardPayload, "v" | "x" | "m"> & { m: string }): string {
  const payload: ForwardPayload = {
    v: 1,
    ...data,
    m: data.m.length > MAX_MESSAGE_IN_TOKEN ? data.m.slice(0, MAX_MESSAGE_IN_TOKEN - 1) + "…" : data.m,
    x: Math.floor(Date.now() / 1000) + TTL_DAYS * 86400,
  };
  const body = b64(JSON.stringify(payload));
  return `${body}.${b64(sign(body))}`;
}

export function verifyForwardToken(token: string): ForwardPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ForwardPayload;
    if (p.v !== 1 || typeof p.x !== "number" || p.x < Date.now() / 1000) return null;
    return p;
  } catch {
    return null;
  }
}

/** Reads a token's contents without checking it. For showing a summary only; never trust it. */
export function peekForwardToken(token: string): ForwardPayload | null {
  try {
    const body = token.split(".")[0] ?? "";
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ForwardPayload;
  } catch {
    return null;
  }
}
