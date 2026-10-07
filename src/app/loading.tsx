/**
 * Shown the instant a page link is clicked, while the next page's content loads (the header and footer
 * stay in place). Without it the old page just sits there until the new one is ready, which on a slow
 * connection looks like the site has frozen. (The progress bar across the top is NavProgress, in the layout.)
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading page">
      {/* Dark hero band, like the top of every page */}
      <div className="relative -mt-[var(--header-h)] min-h-[420px] animate-pulse bg-[#111] pt-[var(--header-h)]">
        <div className="container-site flex min-h-[380px] flex-col justify-end gap-4 pb-12">
          <div className="h-8 w-3/4 max-w-xl rounded bg-white/10 md:h-12" />
          <div className="h-4 w-full max-w-2xl rounded bg-white/10" />
          <div className="h-4 w-2/3 max-w-xl rounded bg-white/10" />
        </div>
      </div>

      {/* Content blocks */}
      <div className="container-site animate-pulse space-y-4 py-8 md:py-[68px]">
        <div className="h-4 w-24 rounded bg-mist-200" />
        <div className="h-8 w-2/3 max-w-lg rounded bg-mist-200" />
        <div className="grid gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-mist-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
