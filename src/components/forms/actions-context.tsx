"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { OfficeRef, PracticeAreaRef } from "@/lib/api/schemas";
import { telHref } from "@/lib/utils";
import { MandateDialog } from "./mandate-dialog";
import { MessageDialog } from "./message-dialog";

/**
 * The CMS expresses some links as actions ("action:mandate", "action:message",
 * "action:call", "action:chat") instead of URLs. This provider owns what each one does,
 * so any button anywhere can trigger the right form without prop drilling.
 */

type DialogKind = "mandate" | "message" | null;

type ActionsValue = {
  run: (action: string, context?: { practiceArea?: string }) => void;
  phoneHref: string | null;
  firmName: string;
};

const ActionsContext = createContext<ActionsValue | null>(null);

export function useActions() {
  const ctx = useContext(ActionsContext);
  if (!ctx) throw new Error("useActions must be used inside <ActionsProvider>");
  return ctx;
}

export function ActionsProvider({
  children,
  firmName,
  phone,
  practiceAreas,
  offices,
}: {
  children: ReactNode;
  firmName: string;
  phone: string | null;
  practiceAreas: PracticeAreaRef[];
  offices: OfficeRef[];
}) {
  const [open, setOpen] = useState<DialogKind>(null);
  const [presetArea, setPresetArea] = useState<string | undefined>();
  const phoneHref = telHref(phone);

  const run = useCallback<ActionsValue["run"]>(
    (action, context) => {
      const name = action.replace(/^action:/, "");
      switch (name) {
        case "mandate":
          setPresetArea(context?.practiceArea);
          setOpen("mandate");
          break;
        case "call":
          if (phoneHref) window.location.href = phoneHref;
          else setOpen("message");
          break;
        // There is no chat assistant behind the API yet, so "Chat with us" opens the
        // message form. Swap this for the chatbot once one exists.
        case "chat":
        case "message":
        default:
          setOpen("message");
      }
    },
    [phoneHref],
  );

  const value = useMemo(() => ({ run, phoneHref, firmName }), [run, phoneHref, firmName]);

  return (
    <ActionsContext.Provider value={value}>
      {children}
      <MandateDialog
        open={open === "mandate"}
        onClose={() => setOpen(null)}
        practiceAreas={practiceAreas}
        offices={offices}
        defaultPracticeArea={presetArea}
      />
      <MessageDialog open={open === "message"} onClose={() => setOpen(null)} />
    </ActionsContext.Provider>
  );
}
