"use client";

/** Last-resort screen when the site shell itself cannot load (for example the API is down). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-NG">
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "Georgia, serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 14, opacity: 0.7, fontFamily: "system-ui, sans-serif" }}>SPA Ajibade &amp; Co.</p>
            <h1 style={{ fontWeight: 400, fontSize: 40, lineHeight: 1.2, margin: "12px 0" }}>We&apos;ll be right back.</h1>
            <p style={{ fontFamily: "system-ui, sans-serif", opacity: 0.8, lineHeight: 1.6 }}>
              The site is having trouble loading its content. Please try again in a moment. For urgent matters, email frontoffice@spaajibade.com.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 24, background: "#fff", color: "#000", border: 0, padding: "12px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
