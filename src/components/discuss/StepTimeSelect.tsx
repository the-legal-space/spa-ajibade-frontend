"use client";

import { useState, type ReactNode } from "react";
import {
  getInitials,
  slotsForDay,
  isAvailable,
  formatShortDate,
  formatSummary,
  MONTH_NAMES,
  type StaffMember,
} from "@/lib/discuss/staff";

interface StepTimeSelectProps {
  member: StaffMember;
  onBack: () => void;
  onConfirm: (date: Date, slot: string) => void;
  submitting: boolean;
}

export default function StepTimeSelect({
  member,
  onBack,
  onConfirm,
  submitting,
}: StepTimeSelectProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);


  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
  };

  // Build calendar grid
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="cal-day empty" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const avail = isAvailable(date);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const isSel =
      selectedDate !== null && date.getTime() === selectedDate.getTime();

    let cls = "cal-day";
    if (isPast) cls += " past";
    else if (avail) cls += " available";
    if (isToday) cls += " today";
    if (isSel) cls += " selected";

    cells.push(
      <div
        key={d}
        className={cls}
        role="gridcell"
        tabIndex={avail ? 0 : undefined}
        aria-label={`${MONTH_NAMES[viewMonth]} ${d}, ${viewYear}${avail ? " – available" : " – unavailable"}`}
        onClick={() => avail && handleDateSelect(date)}
        onKeyDown={(e) => {
          if (avail && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleDateSelect(date);
          }
        }}
      >
        {d}
      </div>,
    );
  }

  return (
    <section
      className="step-panel active"
      id="step-3"
      aria-labelledby="step3-title"
    >
      <div className="step-header-row">
        <button
          className="btn-back"
          onClick={onBack}
          aria-label="Go back to staff selection"
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

      <div className="booking-shell">
        {/* LEFT — Staff info */}
        <aside className="booking-info">
          <h2 className="booking-title">Schedule a Call</h2>

          <div className="booking-staff">
            <div className="booking-avatar">{getInitials(member.name)}</div>
            <div>
              <div className="booking-staff-name">{member.name}</div>
              <div className="booking-staff-role">
                {member.role || member.departments.join(", ")}
              </div>
            </div>
          </div>

          <ul className="booking-meta">
            <li>
              <svg
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
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>30 minutes</span>
            </li>
            <li>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="7"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M16 10l6-3v10l-6-3V10z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Microsoft Teams</span>
            </li>
            <li>
              <svg
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
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
              </svg>
              <span>Lagos (GMT+01)</span>
            </li>
          </ul>

          {selectedDate && selectedSlot && (
            <div className="booking-selected-summary" id="booking-summary">
              <div className="summary-label">Selected time</div>
              <div className="summary-value">
                {formatSummary(selectedDate, selectedSlot)}
              </div>
            </div>
          )}
        </aside>

        <div className="booking-divider" />

        {/* MIDDLE — Calendar */}
        <div className="booking-calendar" id="booking-calendar">
          <div className="cal-header">
            <span className="cal-month-label" id="cal-month-label">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="cal-nav">
              <button
                className="cal-nav-btn"
                id="cal-prev"
                onClick={prevMonth}
                aria-label="Previous month"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                className="cal-nav-btn"
                id="cal-next"
                onClick={nextMonth}
                aria-label="Next month"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="cal-weekdays" aria-hidden="true">
            <span>SU</span>
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
          </div>

          <div
            className="cal-grid"
            id="cal-grid"
            role="grid"
            aria-label="Select a date"
          >
            {cells}
          </div>
        </div>

        {/* RIGHT — Time slots */}
        {selectedDate && (
          <>
            <div className="booking-divider" id="slots-divider" />
            <div className="booking-slots" id="booking-slots">
              <div className="slots-date-label" id="slots-date-label">
                {formatShortDate(selectedDate)}
              </div>
              <div className="slots-list" id="slots-list" role="list">
                {slotsForDay(selectedDate).map((slot) => (
                  <button
                    key={slot}
                    className={`slot-btn${selectedSlot === slot ? " selected" : ""}`}
                    onClick={() => handleSlotSelect(slot)}
                    aria-pressed={selectedSlot === slot}
                    aria-label={`Book at ${slot}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedDate && selectedSlot && (
        <div
          className="form-actions"
          id="confirm-actions"
          style={{ marginTop: 24 }}
        >
          <button
            className="btn-primary"
            id="confirm-booking"
            disabled={submitting}
            onClick={() => onConfirm(selectedDate, selectedSlot)}
          >
            {submitting ? "Sending…" : "Confirm Booking"}
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
      )}
    </section>
  );
}
