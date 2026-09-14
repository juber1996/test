import type { MissionStatus } from "@/lib/missions";

const STATUS_STYLES: Record<MissionStatus, string> = {
  active: "border-mint/40 bg-mint/10 text-mint",
  completed: "border-muted/30 bg-muted/10 text-muted",
  planned: "border-amber/40 bg-amber/10 text-amber",
};

export function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${STATUS_STYLES[status]}`}
    >
      {status === "active" && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-ring" />
      )}
      {status}
    </span>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-edge/80 bg-panel/60 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/** Shimmer block used by every loading skeleton in the app. */
export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-edge/50 ${className}`}
    >
      <div className="absolute inset-0 animate-sweep bg-linear-to-r from-transparent via-ink/10 to-transparent" />
    </div>
  );
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
