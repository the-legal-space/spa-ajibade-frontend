"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { isValidEmail, type UserInfo } from "@/lib/discuss/staff";
import { useActions } from "@/components/forms/actions-context";
import { consentText } from "@/components/forms/fields";

type FieldKey = "firstName" | "lastName" | "email" | "phone" | "message";
type FieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "phone" | "message" | "consent", string>
>;

interface StepUserInfoProps {
  initial: UserInfo;
  onNext: (info: UserInfo) => void;
}

export default function StepUserInfo({ initial, onNext }: StepUserInfoProps) {
  const { firmName } = useActions();
  const [form, setForm] = useState<UserInfo>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleChange =
    (key: FieldKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key as keyof FieldErrors]) {
        setErrors((er) => ({ ...er, [key]: "" }));
      }
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!form.firstName.trim())
      nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.email.trim()) nextErrors.email = "Email address is required.";
    else if (!isValidEmail(form.email))
      nextErrors.email = "Please enter a valid email address.";
    if (form.phone.trim() && !/^[\d\s+()-]{7,20}$/.test(form.phone.trim()))
      nextErrors.phone = "Use digits, spaces, + ( ) or -, between 7 and 20 characters.";
    if (!form.consent) nextErrors.consent = "Please tick the box so we can respond to you.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onNext({
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
    });
  };

  return (
    <section
      className="step-panel active"
      id="step-1"
      aria-labelledby="step1-title"
    >
      <h2 className="step-heading" id="step1-title">
        User Information
      </h2>

      <form id="user-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row two-col">
          <div className="form-group">
            <label htmlFor="first-name">First Name</label>
            <input
              type="text"
              id="first-name"
              name="firstName"
              autoComplete="given-name"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.firstName)}
              value={form.firstName}
              onChange={handleChange("firstName")}
              className={errors.firstName ? "error" : ""}
            />
            <span className="field-error" id="first-name-error" role="alert">
              {errors.firstName ?? ""}
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Last Name</label>
            <input
              type="text"
              id="last-name"
              name="lastName"
              autoComplete="family-name"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.lastName)}
              value={form.lastName}
              onChange={handleChange("lastName")}
              className={errors.lastName ? "error" : ""}
            />
            <span className="field-error" id="last-name-error" role="alert">
              {errors.lastName ?? ""}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-icon-wrap">
            <svg
              className="input-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              value={form.email}
              onChange={handleChange("email")}
              className={errors.email ? "error" : ""}
            />
          </div>
          <span className="field-error" id="email-error" role="alert">
            {errors.email ?? ""}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            Phone Number <span className="optional-tag">(optional)</span>
          </label>
          <div className="input-icon-wrap">
            <svg
              className="input-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              aria-invalid={Boolean(errors.phone)}
              className={errors.phone ? "error" : ""}
            />
          </div>
          <span className="field-error" id="phone-error" role="alert">
            {errors.phone ?? ""}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="message">
            Brief description of what you need legal assistance with{" "}
            <span className="optional-tag">(optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={1800}
            value={form.message}
            onChange={handleChange("message")}
            className={errors.message ? "error" : ""}
          />
          <span className="field-error" id="message-error" role="alert">
            {errors.message ?? ""}
          </span>
        </div>

        <div className="form-group consent-group">
          <label htmlFor="consent" className="consent-label">
            <input
              type="checkbox"
              id="consent"
              checked={form.consent}
              aria-invalid={Boolean(errors.consent)}
              onChange={(e) => {
                setForm((f) => ({ ...f, consent: e.target.checked }));
                if (errors.consent) setErrors((er) => ({ ...er, consent: "" }));
              }}
            />
            <span>{consentText(firmName)}</span>
          </label>
          <span className="field-error" id="consent-error" role="alert">
            {errors.consent ?? ""}
          </span>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" id="step1-next">
            Continue
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}
