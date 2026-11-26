"use client";

import { Button, Topo } from "@/components/atlas";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5">
      <Topo seed="error" className="absolute inset-0 size-full text-line-2" opacity={0.7} />
      <div className="relative max-w-md text-center">
        <p className="text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-3">Something broke</p>
        <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.035em]">We lost the trail for a moment.</h1>
        <p className="mt-2 text-ink-2">The page hit an unexpected error. Try again; if it keeps happening, tell us the reference below.</p>
        <Button variant="pri" className="mt-6" onClick={reset}>Try again</Button>
        {error.digest ? <p className="mt-4 font-mono text-xs text-ink-3">Reference: {error.digest}</p> : null}
      </div>
    </div>
  );
}
