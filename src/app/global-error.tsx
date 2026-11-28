"use client";

import { useEffect } from "react";
import { logger } from "@/lib/log";

/**
 * Last-resort boundary for errors in the root layout itself (fonts, providers). It replaces the whole
 * document, so it can't rely on the app's CSS or components: plain inline styles only.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger("app").error(`Root layout crashed: ${error.message}`, error, { source: "global-error", digest: error.digest });
  }, [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#f7f8f5", color: "#1b241f", fontFamily: "system-ui, sans-serif", padding: 20 }}>
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: "0 0 8px" }}>Insightway hit an error.</h1>
          <p style={{ color: "#4a5650", margin: "0 0 20px" }}>Try again. If it keeps happening, reload the page and quote the reference below.</p>
          <button type="button" onClick={reset} style={{ background: "#2f6b4f", color: "#fff", border: 0, borderRadius: 999, padding: "10px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
          {error.digest ? <p style={{ marginTop: 16, fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#74807a" }}>Reference: {error.digest}</p> : null}
        </div>
      </body>
    </html>
  );
}
