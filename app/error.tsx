"use client";

import { useEffect } from "react";

/**
 * An error boundary for everything under the root layout. It must be a Client
 * Component, and `reset()` re-renders the segment that threw.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app this is where Sentry / your logger would be called.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-rose">
        Telemetry fault
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The console hit an unexpected error while rendering this view.
        {error.digest && (
          <span className="mt-2 block font-mono text-[11px] text-muted/60">
            digest: {error.digest}
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-void"
      >
        Retry
      </button>
    </div>
  );
}
