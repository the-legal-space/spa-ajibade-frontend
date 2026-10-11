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

// Browser-side brake (the server enforces the real limits): at most one request a minute and three an hour
// from this browser. Kept in localStorage; if that is unavailable it simply does nothing.
const SENT_KEY = "spa-discuss-sent";
const MIN_GAP_MS = 60 * 1000;
const MAX_PER_HOUR = 3;

function readSent(): number[] {
  try {
    const list = JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((t): t is number => typeof t === "number" && Date.now() - t < 60 * 60 * 1000) : [];
  } catch {
    return [];
  }
}

/** Seconds to wait before this browser may send another request, or 0 if it may send now. */
function waitSeconds(): number {
  const sent = readSent();
  const now = Date.now();
  const last = sent.length ? Math.max(...sent) : 0;
  const gap = last ? MIN_GAP_MS - (now - last) : 0;
  const hour = sent.length >= MAX_PER_HOUR ? Math.min(...sent) + 60 * 60 * 1000 - now : 0;
  return Math.max(0, Math.ceil(Math.max(gap, hour) / 1000));
}

function rememberSent() {
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify([...readSent(), Date.now()]));
  } catch {
    /* storage unavailable: the server limits still apply */
  }
}

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
  // Bumped when the chosen time turns out to be taken, so the time picker reloads what is booked.
  const [refreshKey, setRefreshKey] = useState(0);
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

    const wait = waitSeconds();
    if (wait > 0) {
      setError(
        wait > 90
          ? `You've sent several requests recently. Please try again in about ${Math.ceil(wait / 60)} minutes, or call the firm.`
          : `Please wait ${wait} second${wait === 1 ? "" : "s"} before sending another request.`,
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    const fullDate = formatFullDate(date);
    const description = userInfo.message || "No specific description provided.";

    const sendMail = async (): Promise<{ ok: true; reference: string } | { ok: false; message: string; code?: string }> => {
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
        return {
          ok: false,
          code: typeof json?.code === "string" ? json.code : undefined,
          message: typeof json?.message === "string" ? json.message : "We couldn't send your request.",
        };
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

    // The booking goes first: it claims the time, and if somebody else holds it the visitor has to pick
    // another one (nothing is recorded or sent in that case). Any other failure still records the enquiry
    // in the dashboard below, so the firm hears about the request either way.
    const mail = await sendMail();
    if (!mail.ok && mail.code === "SLOT_TAKEN") {
      setSubmitting(false);
      setError(mail.message);
      setRefreshKey((k) => k + 1);
      return;
    }
    const enquiry = await recordEnquiry();
    setSubmitting(false);

    if (mail.ok || enquiry.ok) {
      rememberSent();
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
              refreshKey={refreshKey}
            />
          )}
          {currentStep === 3 ? turnstile.widget : null}
        </>
      )}
    </main>
  );
}
