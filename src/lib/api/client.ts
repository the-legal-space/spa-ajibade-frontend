import "server-only";
import { z } from "zod";
import { API_BASE_URL } from "@/lib/env";

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

async function request(path: string, tags: string[]): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: [ALL_CONTENT_TAG, ...tags] },
    });
  } catch (cause) {
    throw new ApiError(`Could not reach the content API (${(cause as Error).message})`, 503, path);
  }

  if (res.status === 404) throw new ApiNotFoundError(path);
  if (!res.ok) throw new ApiError(`Content API responded ${res.status}`, res.status, path);
  return res.json();
}

export async function apiGet<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  opts: { query?: Query; tags?: string[] } = {},
): Promise<z.infer<T>> {
  const fullPath = buildPath(path, opts.query);
  const json = await request(fullPath, opts.tags ?? []);
  const parsed = z.object({ data: schema }).safeParse(json);
  if (!parsed.success) {
    console.error(`[api] Unexpected response shape for ${fullPath}`, parsed.error.flatten());
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
      meta: z
        .object({ page: z.number(), pageSize: z.number(), total: z.number(), totalPages: z.number() })
        .optional(),
    })
    .safeParse(json);
  if (!parsed.success) {
    console.error(`[api] Unexpected list shape for ${fullPath}`, parsed.error.flatten());
    throw new ApiError(`Unexpected response shape for ${fullPath}`, 502, fullPath);
  }
  return parsed.data as { data: z.infer<T>[]; meta?: { page: number; pageSize: number; total: number; totalPages: number } };
}
