"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { OfficeRef, PracticeAreaRef } from "@/lib/api/schemas";
import { telHref } from "@/lib/utils";
import { MandateDialog } from "./mandate-dialog";
import { MessageDialog } from "./message-dialog";
import { ChatPanel, type ChatFaq } from "./chat-panel";

/**
 * The CMS expresses some links as actions ("action:mandate", "action:message",
 * "action:call", "action:chat") instead of URLs. This provider owns what each one does,
 * so any button anywhere can trigger the right form without prop drilling.
 */

type DialogKind = "mandate" | "message" | "chat" | null;

type ActionsValue = {
  run: (action: string, context?: { practiceArea?: string; attorney?: string }) => void;
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
  faqs = [],
}: {
  children: ReactNode;
  firmName: string;
  phone: string | null;
  practiceAreas: PracticeAreaRef[];
  offices: OfficeRef[];
  faqs?: ChatFaq[];
}) {
  const [open, setOpen] = useState<DialogKind>(null);
  const [presetArea, setPresetArea] = useState<string | undefined>();
  const phoneHref = telHref(phone);
  const router = useRouter();

  const run = useCallback<ActionsValue["run"]>(
    (action, context) => {
      const name = action.replace(/^action:/, "");
      switch (name) {
        case "mandate":
          router.push(context?.attorney ? `/discuss?attorney=${encodeURIComponent(context.attorney)}` : "/discuss");
          break;
        case "call":
          if (phoneHref) window.location.href = phoneHref;
          else setOpen("message");
          break;
        // "Chat with us" opens the SPAACO AI panel (answers from the published FAQ for now).
        case "chat":
          setOpen("chat");
          break;
        case "message":
        default:
          setOpen("message");
      }
    },
    [phoneHref, router],
  );

  const closeChat = useCallback(() => setOpen((o) => (o === "chat" ? null : o)), []);
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
      <ChatPanel
        open={open === "chat"}
        onClose={closeChat}
        faqs={faqs}
        firmName={firmName}
        onMessage={() => setOpen("message")}
        onCall={() => {
          if (phoneHref) window.location.href = phoneHref;
          else setOpen("message");
        }}
      />
    </ActionsContext.Provider>
  );
}
