import type { Metadata } from "next";
import { Suspense } from "react";
import { LogForm } from "@/components/log-form";
import { TelemetryFeed } from "@/components/telemetry-feed";
import { Panel, SectionHeading, Shimmer } from "@/components/ui";
import { clearLog } from "@/app/actions";
import { readLog } from "@/lib/log";
import { readTelemetry } from "@/lib/telemetry";

export const metadata: Metadata = {
  title: "Mission control",
  description: "Live telemetry downlink and the shared mission log.",
};

/**
 * This route is always rendered per request: the telemetry frame depends on
 * the clock, and the log is read from a cookie.
 */
export const dynamic = "force-dynamic";

export default function ControlPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Downlink"
        title="Mission control"
        action={
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:block">
            rendered per request
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="p-6">
          {/* The first frame is rendered on the server, then the client takes over. */}
          <TelemetryFeed initial={readTelemetry()} />
        </Panel>

        <Panel className="flex flex-col p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
            Mission log
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted/80">
            Entries are saved to a cookie on your own browser, written by a
            Server Action. Nothing leaves your machine.
          </p>

          <div className="mt-5">
            <LogForm />
          </div>

          <Suspense fallback={<LogSkeleton />}>
            <LogList />
          </Suspense>
        </Panel>
      </div>
    </div>
  );
}

async function LogList() {
  const entries = await readLog();

  if (entries.length === 0) {
    return (
      <p className="mt-6 border-t border-edge/70 pt-6 font-mono text-[11px] text-muted/70">
        No entries yet. Transmit the first one.
      </p>
    );
  }

  return (
    <div className="mt-6 flex-1 border-t border-edge/70 pt-5">
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="animate-rise">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">
                {entry.author}
              </span>
              <span className="font-mono text-[10px] text-muted/60 tabular-nums">
                {entry.at.slice(11, 16)}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink/85">
              {entry.message}
            </p>
          </li>
        ))}
      </ul>

      {/* A Server Action invoked directly by a form, with no client component. */}
      <form action={clearLog} className="mt-5">
        <button
          type="submit"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-rose"
        >
          Clear log
        </button>
      </form>
    </div>
  );
}

function LogSkeleton() {
  return (
    <div className="mt-6 space-y-4 border-t border-edge/70 pt-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Shimmer className="h-2.5 w-24" />
          <Shimmer className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}
