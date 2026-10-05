"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { MAIL_API_URL } from "@/lib/env";

type Summary = { f: string; l: string; e: string; d: string; t: string; ref: string };

/** Reads the booking out of the link for display only. The server checks the signature before sending anything. */
function readSummary(token: string | null): Summary | null {
  if (!token) return null;
  try {
    const body = token.split(".")[0] ?? "";
    const json = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    const p = JSON.parse(decodeURIComponent(escape(json))) as Summary;
    return p && typeof p.f === "string" ? p : null;
  } catch {
    return null;
  }
}

export default function ForwardForm() {
  const token = useSearchParams().get("t");
  const summary = useMemo(() => readSummary(token), [token]);
  const [to, setTo] = useState("");
  const [fromName, setFromName] = useState("");
  const [note, setNote] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (!token || !summary) {
    return (
      <section className="booking-success">
        <h3>This link isn&apos;t valid</h3>
        <p>Please use the &ldquo;Forward to appropriate team member&rdquo; button in the booking email you received.</p>
      </section>
    );
  }

  if (sentTo) {
    return (
      <section className="booking-success" id="forward-success">
        <div className="success-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3>Booking forwarded</h3>
        <p>
          The appointment request from {summary.f} {summary.l} has been sent to {sentTo}.
        </p>
        <button className="success-reset" onClick={() => { setSentTo(null); setTo(""); setNote(""); }}>
          Forward to someone else
        </button>
      </section>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      setFieldError("Please enter a valid email address.");
      return;
    }
    setFieldError("");
    setSending(true);
    try {
      const res = await fetch(`${MAIL_API_URL.replace(/\/$/, "")}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token, to: to.trim(), fromName: fromName.trim(), note: note.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) setSentTo(to.trim());
      else if (json?.errors?.to) setFieldError(json.errors.to);
      else setError(typeof json?.message === "string" ? json.message : "We couldn't forward the booking. Please try again.");
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    }
    setSending(false);
  };

  return (
    <section className="step-panel active" id="forward" aria-labelledby="forward-title">
      <h2 className="step-heading" id="forward-title">Forward to appropriate team member</h2>

      <div className="booking-selected-summary" style={{ marginBottom: 24 }}>
        <div className="summary-label">Appointment request</div>
        <div className="summary-value">
          {summary.f} {summary.l}
          <br />
          {summary.d}, {summary.t}
        </div>
      </div>

      {error && (
        <p className="booking-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <div className="form-group">
          <label htmlFor="fwd-to">Team member&apos;s email address</label>
          <input
            id="fwd-to"
            type="email"
            autoComplete="off"
            placeholder="name@spaajibade.com"
            value={to}
            onChange={(e) => { setTo(e.target.value); setFieldError(""); }}
            aria-invalid={Boolean(fieldError)}
            className={fieldError ? "error" : ""}
          />
          <span className="field-error" role="alert">{fieldError}</span>
        </div>
        <div className="form-group">
          <label htmlFor="fwd-name">
            Your name <span className="optional-tag">(optional)</span>
          </label>
          <input id="fwd-name" type="text" autoComplete="name" value={fromName} onChange={(e) => setFromName(e.target.value)} maxLength={80} />
        </div>
        <div className="form-group">
          <label htmlFor="fwd-note">
            Note to the team member <span className="optional-tag">(optional)</span>
          </label>
          <textarea id="fwd-note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={sending}>
            {sending ? "Forwarding…" : "Forward booking"}
          </button>
        </div>
      </form>
    </section>
  );
}
