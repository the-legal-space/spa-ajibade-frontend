"use client";

import { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "@/lib/env";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void; "expired-callback"?: () => void; theme?: string }) => string;
      remove: (id: string) => void;
    };
  }
}

/**
 * The API requires `turnstileToken` on every form even while the captcha is off
 * (any non-empty string is accepted). With no site key configured we send "disabled".
 * Set NEXT_PUBLIC_TURNSTILE_SITE_KEY when the firm switches Turnstile on; nothing else changes.
 */
export function useTurnstile() {
  const [token, setToken] = useState<string>(TURNSTILE_SITE_KEY ? "" : "disabled");
  const [nonce, setNonce] = useState(0);

  const widget = TURNSTILE_SITE_KEY ? <TurnstileWidget key={nonce} onToken={setToken} /> : null;
  const reset = () => {
    if (!TURNSTILE_SITE_KEY) return;
    setToken("");
    setNonce((n) => n + 1); // remounts the widget for a fresh token
  };
  return { token, widget, reset, ready: token.length > 0 };
}

function TurnstileWidget({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let widgetId: string | null = null;
    const mount = () => {
      if (!window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(el, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onToken,
        "expired-callback": () => onToken(""),
        theme: "light",
      });
    };
    let script = document.getElementById("cf-turnstile-script") as HTMLScriptElement | null;
    if (window.turnstile) mount();
    else {
      if (!script) {
        script = document.createElement("script");
        script.id = "cf-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", mount);
    }
    return () => {
      script?.removeEventListener("load", mount);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);

  return <div ref={ref} className="min-h-[65px]" />;
}
