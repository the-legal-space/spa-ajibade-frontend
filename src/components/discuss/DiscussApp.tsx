"use client";

import { useState } from "react";
import DiscussProgress from "./DiscussProgress";
import StepUserInfo from "./StepUserInfo";
import StepStaffSelect from "./StepStaffSelect";
import StepTimeSelect from "./StepTimeSelect";
import { CONSENT_TEXT_VERSION } from "@/lib/env";
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

  // The request goes to the firm's own enquiries endpoint (the same one the site's other forms use),
  // with the chosen attorney and time written into the summary the firm reads.
  const handleConfirm = async (date: Date, slot: string) => {
    if (!selectedStaff) return;
    if (!turnstile.ready) {
      setError("Please complete the security check.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const summary = [
      `Appointment request with ${selectedStaff.name} (${selectedStaff.role}).`,
      `Preferred time: ${formatFullDate(date)}, ${slot}.`,
      "",
      userInfo.message || "No specific description provided.",
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

    const result = await submitForm("/enquiries", body);
    setSubmitting(false);
    if (result.ok) {
      setReference(result.reference);
      setSubmitted(true);
      return;
    }
    turnstile.reset();
    setError(result.message);
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
              " has been sent to the firm. You'll receive a confirmation once the time is accepted."
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
