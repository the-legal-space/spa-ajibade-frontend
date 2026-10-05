"use client";

import { useState } from "react";
import { STAFF, getInitials, type StaffMember } from "@/lib/discuss/staff";

interface StepStaffSelectProps {
  initialSelected: StaffMember | null;
  onBack: () => void;
  onNext: (member: StaffMember) => void;
}

export default function StepStaffSelect({
  initialSelected,
  onBack,
  onNext,
}: StepStaffSelectProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelected?.id ?? null,
  );

  const select = (member: StaffMember) => {
    setSelectedId(member.id);
  };

  const continueToNext = () => {
    const member = STAFF.find((s) => s.id === selectedId);
    if (member) onNext(member);
  };

  return (
    <section
      className="step-panel active"
      id="step-2"
      aria-labelledby="step2-title"
    >
      <div className="step-header-row">
        <button
          className="btn-back"
          onClick={onBack}
          aria-label="Go back to user information"
        >
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
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
      </div>

      <h2 className="step-heading" id="step2-title">
        Choose the expert best suited to your needs.
      </h2>
      <p className="step-sub">
        Select a team member to see their availability.
      </p>

      <div
        className="staff-grid"
        id="staff-grid"
        role="radiogroup"
        aria-label="Staff selection"
        aria-required="true"
      >
        {STAFF.map((member) => {
          const isSelected = selectedId === member.id;
          return (
            <div
              key={member.id}
              role="radio"
              tabIndex={0}
              aria-checked={isSelected}
              aria-label={`Select ${member.name} – ${member.departments.join(", ")}`}
              data-id={member.id}
              className={`staff-card${member.highlight ? " highlight" : ""}${isSelected ? " selected" : ""}`}
              onClick={() => select(member)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(member);
                }
              }}
            >
              {member.highlight && (
                <span className="staff-card-badge">Cross-Department</span>
              )}
              <div className="staff-card-avatar" aria-hidden="true">
                {getInitials(member.name)}
              </div>
              <div className="staff-card-name">{member.name}</div>
              <div className="staff-card-role">{member.role}</div>
              <div className="staff-card-depts">
                {member.departments.map((dept) => (
                  <span className="staff-card-dept" key={dept}>
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <button
          className="btn-primary"
          id="step2-next"
          disabled={!selectedId}
          onClick={continueToNext}
        >
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
    </section>
  );
}
