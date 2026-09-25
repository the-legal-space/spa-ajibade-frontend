"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Thin wrapper over the native <dialog> element: focus trapping, Escape to close and
 * inert background come from the browser, so no extra dependency is needed.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    if (!open && el.open) el.close();
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/70 backdrop:backdrop-blur-sm",
        size === "md" ? "max-w-xl" : "max-w-3xl",
        className,
      )}
    >
      {open ? (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 id="dialog-title" className="font-serif text-2xl leading-tight md:text-3xl">
                {title}
              </h2>
              {description ? <p className="mt-2 text-sm leading-6 text-stone">{description}</p> : null}
            </div>
            <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full bg-mist hover:bg-mist-200" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
