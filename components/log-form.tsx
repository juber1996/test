"use client";

import { useActionState } from "react";
import { addLogEntry } from "@/app/actions";
import { initialLogState } from "@/lib/log-state";

/**
 * `useActionState` wires a Server Action straight into a <form>. It gives back
 * the action's return value, a bound action, and a `pending` flag — no fetch
 * call, no API route, no client-side state management.
 */
export function LogForm() {
  const [state, formAction, pending] = useActionState(
    addLogEntry,
    initialLogState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="author"
          required
          maxLength={24}
          placeholder="Call sign"
          aria-label="Call sign"
          className="rounded-xl border border-edge bg-void/50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-cyan/60 sm:w-40"
        />
        <input
          name="message"
          required
          maxLength={160}
          placeholder="Log a status update…"
          aria-label="Log entry"
          className="flex-1 rounded-xl border border-edge bg-void/50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-cyan/60"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-void transition-opacity disabled:opacity-50"
        >
          {pending ? "Transmitting…" : "Transmit"}
        </button>
      </div>

      {state.status !== "idle" && (
        <p
          role="status"
          className={`font-mono text-[11px] ${
            state.status === "error" ? "text-rose" : "text-mint"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
