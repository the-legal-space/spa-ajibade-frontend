import { API_BASE_URL } from "@/lib/env";
import { ApiErrorBody, SubmissionReceipt } from "@/lib/api/schemas";

/**
 * Browser-side form submission.
 *
 * Forms post straight from the visitor's browser to the API (not through our Next
 * server) on purpose: the API rate-limits per visitor IP, and proxying would make
 * every visitor share the server's IP and lock everyone out after five submissions.
 */

export type SubmitResult =
  | { ok: true; reference: string }
  | { ok: false; kind: "validation"; fieldErrors: Record<string, string>; message: string }
  | { ok: false; kind: "rate_limited"; message: string }
  | { ok: false; kind: "file"; message: string }
  | { ok: false; kind: "network" | "server"; message: string };

export async function submitForm(path: string, body: Record<string, unknown> | FormData): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: body instanceof FormData ? { Accept: "application/json" } : { "Content-Type": "application/json", Accept: "application/json" },
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    return { ok: false, kind: "network", message: "We couldn't reach the firm's server. Check your connection and try again." };
  }

  const json = await res.json().catch(() => null);

  if (res.status === 201 || res.ok) {
    const receipt = SubmissionReceipt.safeParse(json?.data);
    return { ok: true, reference: receipt.success ? receipt.data.reference : "" };
  }

  if (res.status === 429) {
    return { ok: false, kind: "rate_limited", message: "You've sent a few of these in a short time. Please try again in a few minutes." };
  }
  if (res.status === 413) return { ok: false, kind: "file", message: "That file is larger than 5 MB. Please attach a smaller CV." };
  if (res.status === 415) return { ok: false, kind: "file", message: "Please attach your CV as a PDF or Word (.docx) document." };
  if (res.status === 422) return { ok: false, kind: "file", message: "We couldn't accept that file. Please try a different copy of your CV." };

  const parsed = ApiErrorBody.safeParse(json);
  if (res.status === 400 && parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const d of parsed.data.error.details ?? []) fieldErrors[d.path] = d.message;
    return { ok: false, kind: "validation", fieldErrors, message: "Please check the highlighted fields." };
  }

  return { ok: false, kind: "server", message: "Something went wrong on our side. Please try again, or call the firm directly." };
}
