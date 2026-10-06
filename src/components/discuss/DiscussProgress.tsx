import { Fragment } from "react";

const STEP_LABELS = ["Your Info", "Select Staff", "Book Time"];

interface BookingProgressProps {
  currentStep: number;
}

export default function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Booking progress"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={3}
    >
      <div className="progress-steps">
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          return (
            <Fragment key={label}>
              {step > 1 && (
                <div
                  className={`progress-line${currentStep >= step ? " done" : ""}`}
                />
              )}
              <div
                className={`progress-step${
                  currentStep === step
                    ? " active"
                    : currentStep > step
                      ? " completed"
                      : ""
                }`}
                data-step={step}
              >
                <div className="step-dot">
                  <span>{step}</span>
                </div>
                <span className="step-label">{label}</span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
