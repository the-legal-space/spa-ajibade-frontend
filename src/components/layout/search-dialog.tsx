"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/env";
import { SearchResults, type SearchResults as Results } from "@/lib/api/schemas";

type State = { status: "idle" } | { status: "loading" } | { status: "error"; message: string } | { status: "done"; results: Results };

/**
 * Header quick search. Calls the public /search endpoint straight from the browser
 * (debounced, per the API's 60 requests/minute limit) and shows grouped results.
 */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      setTimeout(() => inputRef.current?.focus(), 10);
    }
    if (!open && el.open) el.close();
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

  const total =
    state.status === "done" ? state.results.practiceAreas.length + state.results.people.length + state.results.insights.length : 0;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="Search the site"
      className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-mist-200 px-5">
        <Search className="size-5 text-stone" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={100}
          placeholder="Search practice areas, attorneys, insights…"
          aria-label="Search"
          className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-stone-400"
        />
        {state.status === "loading" ? <Loader2 className="size-4 animate-spin text-stone" aria-label="Searching" /> : null}
        <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-mist" aria-label="Close search">
          <X className="size-4" />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-3" aria-live="polite">
        {state.status === "idle" ? <p className="px-3 py-6 text-sm text-stone">Type at least two characters.</p> : null}
        {state.status === "error" ? <p className="px-3 py-6 text-sm text-danger">{state.message}</p> : null}
        {state.status === "done" && total === 0 ? (
          <p className="px-3 py-6 text-sm text-stone">No results for “{q.trim()}”.</p>
        ) : null}
        {state.status === "done" && total > 0 ? (
          <div className="space-y-4">
            <Group title="Practice areas" items={state.results.practiceAreas.map((p) => ({ href: `/practice-areas/${p.slug}`, title: p.title, meta: p.shortLabel }))} onPick={onClose} />
            <Group title="Attorneys" items={state.results.people.map((p) => ({ href: `/people/${p.slug}`, title: p.displayName, meta: p.roleLabel }))} onPick={onClose} />
            <Group title="Insights" items={state.results.insights.map((i) => ({ href: `/insights/${i.slug}`, title: i.title, meta: i.categoryLabels.join(", ") }))} onPick={onClose} />
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

function Group({ title, items, onPick }: { title: string; items: { href: string; title: string; meta?: string }[]; onPick: () => void }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-stone">{title}</p>
      <ul>
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} onClick={onPick} className="block rounded-lg px-3 py-2.5 hover:bg-mist">
              <span className="block text-sm text-ink">{it.title}</span>
              {it.meta ? <span className="block text-xs text-stone">{it.meta}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
