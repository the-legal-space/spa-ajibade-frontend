"use client";

import { useState } from "react";
import DiscussProgress from "./DiscussProgress";
import StepUserInfo from "./StepUserInfo";
import StepStaffSelect from "./StepStaffSelect";
import StepTimeSelect from "./StepTimeSelect";
import { CONSENT_TEXT_VERSION, MAIL_API_URL } from "@/lib/env";
import { submitForm } from "@/lib/submit";
import { Honeypot } from "@/components/forms/fields";
import { useTurnstile } from "@/components/forms/turnstile";
import {
  EMPTY_USER_INFO,
  STAFF,
  formatFullDate,
  type StaffMember,
  type UserInfo,
} from "@/lib/discuss/staff";

export default function DiscussApp({ preselectedStaffId }: { preselectedStaffId?: string }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo>(EMPTY_USER_INFO);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(
    () => STAFF.find((s) => s.id === preselectedStaffId) ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string>("");
  const [website, setWebsite] = useState("");
  const turnstile = useTurnstile();

  // One confirmation, two deliveries: the mail endpoint emails the chosen attorney's team and sends the
  // client a confirmation; the enquiry is also recorded in the firm's dashboard (same endpoint the other
  // forms use). The request succeeds if either one went through, so the firm always hears about it.
  const handleConfirm = async (date: Date, slot: string) => {
    if (!selectedStaff) return;
    if (!turnstile.ready) {
      setError("Please complete the security check.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const fullDate = formatFullDate(date);
    const description = userInfo.message || "No specific description provided.";

    const sendMail = async (): Promise<{ ok: true; reference: string } | { ok: false; message: string }> => {
      try {
        const res = await fetch(MAIL_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            staffId: selectedStaff.id,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            phone: userInfo.phone,
            date: fullDate,
            time: slot,
            description,
            consent: true,
            website,
          }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.ok) return { ok: true, reference: String(json.reference ?? "") };
        return { ok: false, message: typeof json?.message === "string" ? json.message : "We couldn't send your request." };
      } catch {
        return { ok: false, message: "We couldn't reach the server. Check your connection and try again." };
      }
    };

    const recordEnquiry = () => {
      const summary = [
        `Appointment request with ${selectedStaff.name} (${selectedStaff.role}).`,
        `Preferred time: ${fullDate}, ${slot}.`,
        "",
        description,
      ].join("\n");
      const body: Record<string, unknown> = {
        fullName: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
        email: userInfo.email,
        summary,
        consent: true,
        consentTextVersion: CONSENT_TEXT_VERSION,
        turnstileToken: turnstile.token,
        website,
      };
      if (userInfo.phone) body.phone = userInfo.phone;
      return submitForm("/enquiries", body);
    };

    const [mail, enquiry] = await Promise.all([sendMail(), recordEnquiry()]);
    setSubmitting(false);

    if (mail.ok || enquiry.ok) {
      setReference(mail.ok ? mail.reference : enquiry.ok ? enquiry.reference : "");
      setSubmitted(true);
      return;
    }
    turnstile.reset();
    setError(mail.message || (enquiry.ok ? "" : enquiry.message));
  };

  const reset = () => {
    setCurrentStep(1);
    setUserInfo(EMPTY_USER_INFO);
    setSelectedStaff(null);
    setSubmitting(false);
    setSubmitted(false);
    setError(null);
    setReference("");
    setWebsite("");
  };

  return (
    <main className="booking-main">
      {submitted ? (
        <section className="booking-success" id="booking-success">
          <div className="success-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>Request received</h3>
          <p id="success-message">
            {"Your request to meet with "}
            {selectedStaff?.name}
            {
              " has been sent to the firm. A confirmation email is on its way to you, and the firm will be in touch to confirm the time."
            }
          </p>
          {reference ? (
            <p className="success-reference">
              Reference: <strong>{reference}</strong>
            </p>
          ) : null}
          <button className="success-reset" onClick={reset}>
            Make another booking
          </button>
        </section>
      ) : (
        <>
          <DiscussProgress currentStep={currentStep} />

          {error && (
            <p className="booking-error" role="alert">
              {error}
            </p>
          )}

          {currentStep === 1 && (
            <StepUserInfo
              initial={userInfo}
              onNext={(info) => {
                setUserInfo(info);
                setCurrentStep(2);
              }}
            />
          )}

          {currentStep === 2 && (
            <StepStaffSelect
              initialSelected={selectedStaff}
              onBack={() => setCurrentStep(1)}
              onNext={(member) => {
                setSelectedStaff(member);
                setCurrentStep(3);
              }}
            />
          )}

          <Honeypot value={website} onChange={setWebsite} />

          {currentStep === 3 && selectedStaff && (
            <StepTimeSelect
              member={selectedStaff}
              onBack={() => setCurrentStep(2)}
              onConfirm={handleConfirm}
              submitting={submitting}
            />
          )}
          {currentStep === 3 ? turnstile.widget : null}
        </>
      )}
    </main>
  );
}
