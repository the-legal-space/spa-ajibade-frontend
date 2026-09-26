"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/env";
import { SearchResults, type SearchResults as Results } from "@/lib/api/schemas";
import { Logo } from "@/components/ui/logo";
import { InsightCard, PersonCard, PracticeAreaCard } from "@/components/sections/cards";

type State = { status: "idle" } | { status: "loading" } | { status: "error"; message: string } | { status: "done"; results: Results };

/**
 * Full-screen site search, following the "NAV SEARCH" frames: a white page with the
 * search field in the header row, an empty state, then result cards.
 * Calls the public /search endpoint from the browser, debounced (60 requests/minute limit).
 */
export function SearchDialog({ open, onClose, firmName, descriptor }: { open: boolean; onClose: () => void; firmName: string; descriptor: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      document.documentElement.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 10);
    }
    if (!open && el.open) {
      el.close();
      document.documentElement.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setState({ status: "idle" });
      return;
    }
    const controller = new AbortController();
    setState({ status: "loading" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(term.slice(0, 100))}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (res.status === 429) throw new Error("You're searching quickly. Please wait a moment and try again.");
        if (!res.ok) throw new Error("Search is unavailable right now.");
        const json = await res.json();
        const parsed = SearchResults.safeParse(json?.data);
        if (!parsed.success) throw new Error("Search is unavailable right now.");
        setState({ status: "done", results: parsed.data });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState({ status: "error", message: (err as Error).message });
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  const close = () => {
    document.documentElement.style.overflow = "";
    onClose();
  };

  const r = state.status === "done" ? state.results : null;
  const total = r ? r.practiceAreas.length + r.people.length + r.insights.length : 0;

  return (
    <dialog
      ref={ref}
      onClose={close}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      aria-label="Search the site"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-white p-0 text-ink backdrop:bg-transparent"
    >
      <div className="sticky top-0 z-10 border-b border-mist-200 bg-white">
        <div className="container-site flex h-[70px] items-center gap-4">
          <Link href="/" onClick={close} className="hidden shrink-0 md:block" aria-label={`${firmName} home`}>
            <Logo firmName={firmName} descriptor={descriptor} tone="dark" />
          </Link>
          <div className="flex flex-1 items-center gap-3 rounded-full bg-mist px-4 md:mx-8">
            <Search className="size-4 text-stone" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={100}
              placeholder="Search for anything on our website…"
              aria-label="Search"
              className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
            {state.status === "loading" ? <Loader2 className="size-4 animate-spin text-stone" aria-label="Searching" /> : null}
          </div>
          <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full bg-ink text-white hover:bg-ink-700" aria-label="Close search">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="container-site py-10" aria-live="polite">
        {state.status === "idle" || state.status === "loading" ? (
          <EmptyState title="Search The Firm's Site" text="Find practice areas, attorneys and insights. Type at least two characters." />
        ) : null}
        {state.status === "error" ? <EmptyState title="Search is unavailable" text={state.message} /> : null}
        {r && total === 0 ? <EmptyState title={`No results for “${q.trim()}”`} text="Try a different word, such as a practice area or an attorney's name." /> : null}

        {r && total > 0 ? (
          <div className="space-y-12" onClick={(e) => (e.target as HTMLElement).closest("a") && close()}>
            {r.practiceAreas.length > 0 ? (
              <ResultGroup title="Practice Areas" count={r.practiceAreas.length}>
                {r.practiceAreas.map((a) => (
                  <li key={a.id}>
                    <PracticeAreaCard area={a} />
                  </li>
                ))}
              </ResultGroup>
            ) : null}
            {r.people.length > 0 ? (
              <ResultGroup title="Attorneys" count={r.people.length}>
                {r.people.map((p) => (
                  <li key={p.id}>
                    <PersonCard person={p} />
                  </li>
                ))}
              </ResultGroup>
            ) : null}
            {r.insights.length > 0 ? (
              <ResultGroup title="Insights & News" count={r.insights.length}>
                {r.insights.map((i) => (
                  <li key={i.id}>
                    <InsightCard insight={i} />
                  </li>
                ))}
              </ResultGroup>
            ) : null}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <span className="grid size-16 place-items-center rounded-full bg-mist">
        <Search className="size-6 text-stone" aria-hidden />
      </span>
      <p className="mt-4 font-serif text-2xl">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-stone">{text}</p>
    </div>
  );
}

function ResultGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-baseline gap-2 font-serif text-2xl">
        {title} <span className="font-sans text-sm text-stone">{count}</span>
      </h2>
      <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  );
}
