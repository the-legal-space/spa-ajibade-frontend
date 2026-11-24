import "server-only";
import { z } from "zod";
import { API_BASE_URL } from "@/lib/env";
import { PaginationMeta as PaginationMetaSchema } from "@/lib/api/schemas";

/**
 * Server-side fetcher for the public content API.
 *
 * Caching: every read goes through Next's data cache for REVALIDATE_SECONDS and is
 * tagged, so the backend's "content changed" webhook (POST /api/revalidate) can
 * refresh the site immediately. Pages themselves render per request, which keeps
 * builds independent of the API being awake.
 */

export const REVALIDATE_SECONDS = 300;
export const ALL_CONTENT_TAG = "spa-content";

export class ApiNotFoundError extends Error {
  constructor(path: string) {
    super(`Not found: ${path}`);
    this.name = "ApiNotFoundError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string,
    /** For 429: how long the API asked us to wait before trying again. */
    public retryAfterMs?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | undefined | null>;

function buildPath(path: string, query?: Query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * A busy or waking API (503, a dropped connection) usually answers on a second try. A 429 means the API's rate
 * limit (300 requests a minute per address) is used up, which a full static build reaches: wait until its window
 * resets, plus a random spread so the waiting requests don't all arrive in the same second again.
 */
const RETRY_DELAYS_MS = [1000, 3000, 8000, 15000, 30000];
const MAX_RATE_LIMIT_RETRIES = 8;

async function request(path: string, tags: string[], bypassCache = false): Promise<unknown> {
  for (let attempt = 0, limited = 0; ; ) {
    try {
      return await requestOnce(path, tags, bypassCache);
    } catch (error) {
      if (!(error instanceof ApiError) || error instanceof ApiNotFoundError) throw error;
      let delay: number;
      if (error.status === 429 && limited < MAX_RATE_LIMIT_RETRIES) {
        limited++;
        delay = (error.retryAfterMs ?? 60_000) + Math.random() * 20_000;
      } else if (error.status >= 500 && attempt < RETRY_DELAYS_MS.length) {
        delay = RETRY_DELAYS_MS[attempt++] ?? 30_000;
      } else {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/** Seconds to wait from a 429: Retry-After, else the reset in "RateLimit: limit=300, remaining=0, reset=42". */
function retryAfterMs(res: Response) {
  const header = res.headers.get("retry-after") ?? res.headers.get("ratelimit")?.match(/reset=(\d+)/)?.[1];
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 + 500 : undefined;
}

async function requestOnce(path: string, tags: string[], bypassCache: boolean): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      ...(bypassCache
        ? { cache: "no-store" as const }
        : { next: { revalidate: REVALIDATE_SECONDS, tags: [ALL_CONTENT_TAG, ...tags] } }),
    });
  } catch (cause) {
    throw new ApiError(`Could not reach the content API (${(cause as Error).message})`, 503, path);
  }

  if (res.status === 404) throw new ApiNotFoundError(path);
  if (!res.ok) {
    throw new ApiError(`Content API responded ${res.status}`, res.status, path, res.status === 429 ? retryAfterMs(res) : undefined);
  }
  return res.json();
}

export async function apiGet<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  opts: { query?: Query; tags?: string[] } = {},
): Promise<z.infer<T>> {
  const fullPath = buildPath(path, opts.query);
  const responseSchema = z.object({ data: schema });
  const tags = opts.tags ?? [];
  let parsed = responseSchema.safeParse(await request(fullPath, tags));
  if (!parsed.success) {
    parsed = responseSchema.safeParse(await request(fullPath, tags, true));
  }
  if (!parsed.success) {
    console.error(`[api] Unexpected response shape for ${fullPath}`, parsed.error.issues);
    throw new ApiError(`Unexpected response shape for ${fullPath}`, 502, fullPath);
  }
  return parsed.data.data;
}

export async function apiList<T extends z.ZodTypeAny>(
  path: string,
  itemSchema: T,
  opts: { query?: Query; tags?: string[] } = {},
) {
  const fullPath = buildPath(path, opts.query);
  const json = await request(fullPath, opts.tags ?? []);
  const parsed = z
    .object({
      data: z.array(itemSchema),
      meta: PaginationMetaSchema.optional(),
    })
    .safeParse(json);
  if (!parsed.success) {
    console.error(`[api] Unexpected list shape for ${fullPath}`, parsed.error.flatten());
    throw new ApiError(`Unexpected response shape for ${fullPath}`, 502, fullPath);
  }
  return parsed.data as { data: z.infer<T>[]; meta?: { page: number; pageSize: number; total: number; totalPages: number } };
}
