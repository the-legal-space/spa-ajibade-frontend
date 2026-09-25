"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { OfficeRef, PracticeAreaRef } from "@/lib/api/schemas";
import { CONSENT_TEXT_VERSION } from "@/lib/env";
import { submitForm } from "@/lib/submit";
import { Dialog } from "@/components/ui/dialog";
import { buttonClass } from "@/components/ui/button";
import { ConsentCheckbox, FormError, Honeypot, Select, SuccessPanel, TextArea, TextField } from "./fields";
import { useTurnstile } from "./turnstile";

const empty = { fullName: "", email: "", phone: "", organization: "", practiceArea: "", preferredOffice: "", summary: "" };

/** "Discuss a Mandate" → POST /enquiries */
export function MandateDialog({
  open,
  onClose,
  practiceAreas,
  offices,
  defaultPracticeArea,
}: {
  open: boolean;
  onClose: () => void;
  practiceAreas: PracticeAreaRef[];
  offices: OfficeRef[];
  defaultPracticeArea?: string;
}) {
  const [values, setValues] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const turnstile = useTurnstile();

  useEffect(() => {
    if (open) setValues((v) => ({ ...v, practiceArea: defaultPracticeArea ?? v.practiceArea }));
  }, [open, defaultPracticeArea]);

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  function close() {
    onClose();
    if (reference) {
      setValues(empty);
      setConsent(false);
      setReference(null);
    }
    setErrors({});
    setFormError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (values.fullName.trim().length < 2) local.fullName = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) local.email = "Please enter a valid email address.";
    if (values.phone && !/^[\d\s+()-]{7,20}$/.test(values.phone.trim())) local.phone = "Use digits, spaces, + ( ) or -, between 7 and 20 characters.";
    if (values.summary.trim().length < 20) local.summary = "Please give us at least 20 characters so the right lawyer can respond.";
    if (!consent) local.consent = "Please tick the box so we can respond to you.";
    setErrors(local);
    if (Object.keys(local).length) return;
    if (!turnstile.ready) {
      setFormError("Please complete the security check.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const body: Record<string, unknown> = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      summary: values.summary.trim(),
      consent: true,
      consentTextVersion: CONSENT_TEXT_VERSION,
      turnstileToken: turnstile.token,
      website,
    };
    if (values.phone.trim()) body.phone = values.phone.trim();
    if (values.organization.trim()) body.organization = values.organization.trim();
    if (values.practiceArea) body.practiceArea = values.practiceArea;
    if (values.preferredOffice) body.preferredOffice = values.preferredOffice;

    const result = await submitForm("/enquiries", body);
    setSubmitting(false);
    if (result.ok) {
      setReference(result.reference);
      return;
    }
    turnstile.reset();
    if (result.kind === "validation") setErrors(result.fieldErrors);
    setFormError(result.message);
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={reference !== null ? "Thank you" : "Discuss a Mandate"}
      description={reference !== null ? undefined : "Tell us briefly what you need. A member of the firm will respond, usually within one working day. Please don't include confidential details yet."}
      size="lg"
    >
      {reference !== null ? (
        <SuccessPanel reference={reference} title="Your enquiry has been received." onDone={close}>
          The appropriate partner's team will be in touch using the details you provided.
        </SuccessPanel>
      ) : (
        <form onSubmit={onSubmit} noValidate className="relative grid gap-4 md:grid-cols-2">
          <Honeypot value={website} onChange={setWebsite} />
          <TextField label="Full name" name="fullName" autoComplete="name" required maxLength={120} value={values.fullName} onChange={set("fullName")} error={errors.fullName} />
          <TextField label="Email" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={set("email")} error={errors.email} />
          <TextField label="Phone" name="phone" type="tel" autoComplete="tel" maxLength={20} value={values.phone} onChange={set("phone")} error={errors.phone} />
          <TextField label="Organisation" name="organization" autoComplete="organization" maxLength={160} value={values.organization} onChange={set("organization")} error={errors.organization} />
          <Select label="Practice area" name="practiceArea" value={values.practiceArea} onChange={set("practiceArea")} error={errors.practiceArea}>
            <option value="">Not sure yet</option>
            {practiceAreas.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </Select>
          <Select label="Preferred office" name="preferredOffice" value={values.preferredOffice} onChange={set("preferredOffice")} error={errors.preferredOffice}>
            <option value="">No preference</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2">
            <TextArea
              label="Summary of the matter"
              name="summary"
              required
              minLength={20}
              maxLength={2000}
              value={values.summary}
              onChange={set("summary")}
              error={errors.summary}
              hint={`${values.summary.length}/2000`}
            />
          </div>
          <div className="md:col-span-2">
            <ConsentCheckbox checked={consent} onChange={setConsent} error={errors.consent} />
          </div>
          {turnstile.widget ? <div className="md:col-span-2">{turnstile.widget}</div> : null}
          <div className="md:col-span-2">
            <FormError message={formError} />
          </div>
          <div className="flex justify-end md:col-span-2">
            <button type="submit" disabled={submitting} className={buttonClass("dark", "min-w-40")}>
              {submitting ? "Sending…" : "Send enquiry"}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
