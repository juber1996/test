import Link from "next/link";
import type { Mission } from "@/lib/missions";
import { StatusBadge, formatDate } from "@/components/ui";

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <Link
      href={`/missions/${mission.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-edge/80 bg-panel/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-edge hover:bg-panel"
    >
      {/* Accent glow, tinted per mission */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-45"
        style={{ backgroundColor: mission.accent }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {mission.codename}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            {mission.name}
          </h3>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
        {mission.summary}
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-edge/70 pt-4 font-mono text-[11px]">
        <div>
          <dt className="text-muted/70">Launch</dt>
          <dd className="mt-0.5 text-ink/90">{formatDate(mission.launchDate)}</dd>
        </div>
        <div>
          <dt className="text-muted/70">Crew</dt>
          <dd className="mt-0.5 text-ink/90">
            {mission.crew === 0 ? "uncrewed" : mission.crew}
          </dd>
        </div>
        <div>
          <dt className="text-muted/70">Target</dt>
          <dd className="mt-0.5 truncate text-ink/90">{mission.destination}</dd>
        </div>
      </dl>
    </Link>
  );
}
