"use client";

import { useRef, useState, type FormEvent } from "react";
import { Paperclip } from "lucide-react";
import { CONSENT_TEXT_VERSION } from "@/lib/env";
import { submitForm } from "@/lib/submit";
import { buttonClass } from "@/components/ui/button";
import { ConsentCheckbox, FormError, Honeypot, SuccessPanel, TextArea, TextField } from "./fields";
import { useTurnstile } from "./turnstile";

/**
 * Name of the multipart file field. The OpenAPI spec says `cv`; the written
 * Frontend Guide says `file`. The spec is used here. Confirm with the backend team
 * and change this one constant if needed.
 */
const CV_FIELD = "cv";
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const empty = { fullName: "", email: "", phone: "", coverNote: "" };

/** "Send your CV" → POST /jobs/{id}/applications (multipart). */
export function ApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [values, setValues] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const turnstile = useTurnstile();

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  function pickFile(f: File | null) {
    setErrors((e) => ({ ...e, [CV_FIELD]: "" }));
    if (!f) return setFile(null);
    const okType = /\.(pdf|docx)$/i.test(f.name);
    if (!okType) {
      setErrors((e) => ({ ...e, [CV_FIELD]: "Please attach a PDF or Word (.docx) document." }));
      return setFile(null);
    }
    if (f.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, [CV_FIELD]: "That file is larger than 5 MB." }));
      return setFile(null);
    }
    setFile(f);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (values.fullName.trim().length < 2) local.fullName = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) local.email = "Please enter a valid email address.";
    if (!/^[\d\s+()-]{7,20}$/.test(values.phone.trim())) local.phone = "Please enter a phone number (7 to 20 digits).";
    if (!file) local[CV_FIELD] = "Please attach your CV.";
    if (!consent) local.consent = "Please tick the box so we can consider your application.";
    setErrors(local);
    if (Object.keys(local).length) return;
    if (!turnstile.ready) {
      setFormError("Please complete the security check.");
      return;
    }

    const fd = new FormData();
    fd.set("fullName", values.fullName.trim());
    fd.set("email", values.email.trim());
    fd.set("phone", values.phone.trim());
    if (values.coverNote.trim()) fd.set("coverNote", values.coverNote.trim());
    fd.set(CV_FIELD, file!);
    fd.set("consent", "true");
    fd.set("consentTextVersion", CONSENT_TEXT_VERSION);
    fd.set("turnstileToken", turnstile.token);
    fd.set("website", website);

    setSubmitting(true);
    setFormError(null);
    const result = await submitForm(`/jobs/${jobId}/applications`, fd);
    setSubmitting(false);
    if (result.ok) {
      setReference(result.reference);
      return;
    }
    turnstile.reset();
    if (result.kind === "validation") setErrors(result.fieldErrors);
    if (result.kind === "file") setErrors((e) => ({ ...e, [CV_FIELD]: result.message }));
    setFormError(result.message);
  }

  if (reference !== null) {
    return (
      <SuccessPanel reference={reference} title="Application received.">
        Thank you for applying for {jobTitle}. The firm will contact you if your application is taken forward.
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4">
      <Honeypot value={website} onChange={setWebsite} />
      <TextField label="Full name" name="fullName" autoComplete="name" required maxLength={120} value={values.fullName} onChange={set("fullName")} error={errors.fullName} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={set("email")} error={errors.email} />
      <TextField label="Phone" name="phone" type="tel" autoComplete="tel" required maxLength={20} value={values.phone} onChange={set("phone")} error={errors.phone} />

      <div>
        <p className="mb-1.5 text-sm font-medium">
          CV <span className="text-danger">*</span>
        </p>
        <label
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-mist-300 px-4 py-4 text-sm hover:border-ink aria-[invalid=true]:border-danger"
          aria-invalid={!!errors[CV_FIELD]}
        >
          <Paperclip className="size-4 shrink-0 text-stone" aria-hidden />
          <span className="truncate">{file ? file.name : "Choose a PDF or DOCX file"}</span>
          <input ref={fileRef} type="file" name={CV_FIELD} accept={ACCEPT} className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
        </label>
        {errors[CV_FIELD] ? (
          <p className="mt-1 text-xs text-danger" role="alert">
            {errors[CV_FIELD]}
          </p>
        ) : null}
      </div>

      <TextArea label="Cover note" name="coverNote" maxLength={2000} value={values.coverNote} onChange={set("coverNote")} error={errors.coverNote} hint={`${values.coverNote.length}/2000`} />
      <ConsentCheckbox checked={consent} onChange={setConsent} error={errors.consent} />
      {turnstile.widget}
      <FormError message={formError} />
      <button type="submit" disabled={submitting} className={buttonClass("pillDark", "w-full")}>
        {submitting ? "Uploading…" : "Submit application"}
      </button>
    </form>
  );
}
