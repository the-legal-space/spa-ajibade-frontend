"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONSENT_TEXT_VERSION } from "@/lib/env";
import { useActions } from "./actions-context";

const control =
  "w-full rounded-lg border border-mist-300 bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition placeholder:text-stone-400 focus:border-ink aria-[invalid=true]:border-danger";

function FieldShell({ label, error, hint, required, children, id }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : <span className="font-normal text-stone"> (optional)</span>}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-stone">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ label, error, hint, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} required={props.required} id={id}>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={cn(control, className)} {...props} />
    </FieldShell>
  );
}

export function TextArea({ label, error, hint, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} required={props.required} id={id}>
      <textarea id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} rows={5} className={cn(control, "resize-y", className)} {...props} />
    </FieldShell>
  );
}

export function Select({ label, error, children, className, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} required={props.required} id={id}>
      <select id={id} aria-invalid={!!error} className={cn(control, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_14px_center] bg-no-repeat pr-10", className)} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}

/**
 * The exact wording the visitor agrees to. Its version label (CONSENT_TEXT_VERSION) is
 * sent with every submission so the firm can prove what was shown. If you edit this
 * text, bump NEXT_PUBLIC_CONSENT_TEXT_VERSION.
 */
export const consentText = (firmName: string) =>
  `I agree that ${firmName} may use the information I have provided to respond to this request, in line with the Nigeria Data Protection Act 2023. Sending this form does not create a lawyer-client relationship.`;

export function ConsentCheckbox({ error, checked, onChange }: { error?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  const { firmName } = useActions();
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 text-sm leading-6 text-ink-700">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required
          aria-invalid={!!error}
          className="mt-1 size-4 shrink-0 accent-ink"
        />
        <span>{consentText(firmName)}</span>
      </label>
      {error ? <p className="mt-1 text-xs text-danger" role="alert">{error}</p> : null}
      <input type="hidden" name="consentTextVersion" value={CONSENT_TEXT_VERSION} />
    </div>
  );
}

/**
 * Spam trap. Humans never see or fill it; bots fill everything. Kept out of the
 * accessibility tree and away from autofill (odd name, autocomplete off, tabIndex -1).
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export function SuccessPanel({ reference, title, children, onDone }: { reference: string; title: string; children?: ReactNode; onDone?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 py-2">
      <CheckCircle2 className="size-10 text-success" aria-hidden />
      <div>
        <p className="font-serif text-2xl">{title}</p>
        {children ? <div className="mt-2 text-sm leading-6 text-ink-700">{children}</div> : null}
      </div>
      {reference ? (
        <div className="rounded-lg bg-mist px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-stone">Your reference</p>
          <p className="font-mono text-lg">{reference}</p>
          <p className="mt-1 text-xs text-stone">Please quote this if you contact the firm about this request.</p>
        </div>
      ) : null}
      {onDone ? (
        <button type="button" onClick={onDone} className="rounded-[4px] bg-ink px-4 py-3 text-sm text-white hover:bg-ink-700">
          Close
        </button>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}
