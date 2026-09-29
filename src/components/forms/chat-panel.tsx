"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Maximize2, Minimize2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { TRANSITIONS } from "@/lib/motion";

export type ChatFaq = { question: string; answer: string };

type Msg = { from: "bot" | "user"; text: string; followUp?: boolean };

const STOP = new Set(["the", "a", "an", "is", "are", "do", "does", "i", "you", "your", "my", "of", "to", "and", "for", "in", "on", "how", "what", "can", "with", "it", "be", "we", "our"]);

function words(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** Best FAQ for a question by shared keywords. Returns null when nothing is a reasonable match. */
function bestAnswer(q: string, faqs: ChatFaq[]) {
  const qw = new Set(words(q));
  if (qw.size === 0) return null;
  let best: { faq: ChatFaq; score: number } | null = null;
  for (const faq of faqs) {
    const fw = new Set(words(`${faq.question} ${faq.question} ${faq.answer}`));
    let score = 0;
    qw.forEach((w) => {
      if (fw.has(w)) score += 1;
    });
    if (!best || score > best.score) best = { faq, score };
  }
  return best && best.score >= Math.min(2, qw.size) ? best.faq : null;
}

/**
 * "Chat with SPAACO AI" panel from the Figma chat modal (696 x 431, 24px radius, expand and
 * close controls, disclaimer under the input).
 *
 * There is no AI service behind the site yet, so the assistant answers from the firm's
 * published FAQ only and hands anything else to a person (message or call). Nothing typed here
 * leaves the visitor's browser. Replace `reply` with a call to the firm's assistant API once it
 * exists (server-side, with rate limiting and no client matter data in prompts).
 */
export function ChatPanel({
  open,
  onClose,
  faqs,
  firmName,
  onMessage,
  onCall,
}: {
  open: boolean;
  onClose: () => void;
  faqs: ChatFaq[];
  firmName: string;
  onMessage: () => void;
  onCall: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: `Hello, I'm SPAACO AI. I can answer common questions about ${firmName.replace(/\.+$/, "")}. What would you like to know?` },
  ]);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  function reply(q: string) {
    const hit = bestAnswer(q, faqs);
    return hit
      ? { from: "bot" as const, text: hit.answer }
      : {
          from: "bot" as const,
          text: "I don't have an answer to that yet. A member of the firm can help you directly.",
          followUp: true,
        };
  }

  function ask(q: string) {
    const text = q.trim().slice(0, 500);
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }, reply(text)]);
    setInput("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  const suggestions = faqs.slice(0, 3).map((f) => f.question);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label="Chat with SPAACO AI"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={TRANSITIONS.smooth}
          className={cn(
            "fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[24px] border border-ink/10 bg-white text-ink shadow-2xl md:bottom-8 md:right-8",
            expanded ? "h-[min(760px,calc(100dvh-48px))] w-[min(1000px,calc(100vw-32px))]" : "h-[min(431px,calc(100dvh-32px))] w-[696px]",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
            <p className="font-serif text-xl leading-7 md:text-2xl">Chat with SPAACO AI</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpanded((x) => !x)}
                className="hidden size-10 place-items-center rounded-full bg-mist transition-colors hover:bg-mist-200 sm:grid"
                aria-label={expanded ? "Shrink chat" : "Expand chat"}
              >
                {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-full bg-mist transition-colors hover:bg-mist-200"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-6",
                    m.from === "user" ? "rounded-br-sm bg-ink text-white" : "rounded-bl-sm bg-mist text-ink",
                  )}
                >
                  {m.text}
                  {m.followUp ? (
                    <span className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={onMessage} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium hover:bg-mist-200">
                        Message the firm
                      </button>
                      <button type="button" onClick={onCall} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium hover:bg-mist-200">
                        Call the firm
                      </button>
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
            {msgs.length === 1 && suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border-[0.5px] border-gray px-3 py-1.5 text-left text-xs transition-colors hover:border-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="border-t border-ink/10 px-5 pb-3 pt-3">
            <div className="flex items-center gap-2 rounded-full bg-mist py-1.5 pl-4 pr-1.5">
              <label htmlFor="chat-input" className="sr-only">
                Your question
              </label>
              <input
                id="chat-input"
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                autoComplete="off"
                placeholder="Ask a question"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-opacity disabled:opacity-40"
                aria-label="Send"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] leading-4 text-stone">
              SPAACO AI gives general information from the firm&apos;s FAQs, not legal advice. Please don&apos;t share confidential details here.
            </p>
          </form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
