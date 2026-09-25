"use client";

import { useState, type FormEvent } from "react";
import { CONSENT_TEXT_VERSION } from "@/lib/env";
import { submitForm } from "@/lib/submit";
import { Dialog } from "@/components/ui/dialog";
import { buttonClass } from "@/components/ui/button";
import { ConsentCheckbox, FormError, Honeypot, SuccessPanel, TextArea, TextField } from "./fields";
import { useTurnstile } from "./turnstile";

const empty = { fullName: "", email: "", phone: "", subject: "", message: "" };

/** "Message the firm" → POST /messages */
export function MessageDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [values, setValues] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const turnstile = useTurnstile();

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  function close() {
    onClose();
    if (reference !== null) {
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
    if (values.message.trim().length < 10) local.message = "Please write at least 10 characters.";
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
      message: values.message.trim(),
      consent: true,
      consentTextVersion: CONSENT_TEXT_VERSION,
      turnstileToken: turnstile.token,
      website,
    };
    if (values.phone.trim()) body.phone = values.phone.trim();
    if (values.subject.trim()) body.subject = values.subject.trim();

    const result = await submitForm("/messages", body);
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
      title={reference !== null ? "Thank you" : "Message the firm"}
      description={reference !== null ? undefined : "Questions about the firm or an existing matter. For a new instruction, use Discuss a Mandate."}
    >
      {reference !== null ? (
        <SuccessPanel reference={reference} title="Your message has been sent." onDone={close}>
          Someone from the firm will reply to the email address you gave.
        </SuccessPanel>
      ) : (
        <form onSubmit={onSubmit} noValidate className="relative grid gap-4">
          <Honeypot value={website} onChange={setWebsite} />
          <TextField label="Full name" name="fullName" autoComplete="name" required maxLength={120} value={values.fullName} onChange={set("fullName")} error={errors.fullName} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Email" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={set("email")} error={errors.email} />
            <TextField label="Phone" name="phone" type="tel" autoComplete="tel" maxLength={20} value={values.phone} onChange={set("phone")} error={errors.phone} />
          </div>
          <TextField label="Subject" name="subject" maxLength={160} value={values.subject} onChange={set("subject")} error={errors.subject} />
          <TextArea label="Message" name="message" required minLength={10} maxLength={2000} value={values.message} onChange={set("message")} error={errors.message} hint={`${values.message.length}/2000`} />
          <ConsentCheckbox checked={consent} onChange={setConsent} error={errors.consent} />
          {turnstile.widget}
          <FormError message={formError} />
          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className={buttonClass("dark", "min-w-40")}>
              {submitting ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
