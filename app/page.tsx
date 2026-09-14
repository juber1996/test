import Link from "next/link";
import { Suspense } from "react";
import { MissionCard } from "@/components/mission-card";
import { Panel, SectionHeading, Shimmer, formatNumber } from "@/components/ui";
import { getMissions, getProgrammeStats } from "@/lib/missions";

/**
 * The home page is statically prerendered at build time and then refreshed at
 * most once an hour (Incremental Static Regeneration).
 */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />

      {/*
        Everything above renders immediately. The stats bar is slow (see
        getProgrammeStats), so it is wrapped in Suspense and streamed in
        afterwards instead of blocking the whole page.
      */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsBar />
      </Suspense>

      <section>
        <SectionHeading
          eyebrow="Flight manifest"
          title="Currently flying"
          action={
            <Link
              href="/missions"
              className="rounded-lg border border-edge px-3 py-1.5 text-xs text-muted transition-colors hover:border-cyan/50 hover:text-ink"
            >
              All missions →
            </Link>
          }
        />
        <Suspense fallback={<CardsSkeleton />}>
          <ActiveMissions />
        </Suspense>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="animate-rise">
      <p className="inline-flex items-center gap-2 rounded-full border border-edge bg-panel/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-mint" />
        All systems nominal
      </p>

      <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
        Six missions.
        <br />
        <span className="bg-linear-to-r from-cyan via-violet to-rose bg-clip-text text-transparent">
          One console.
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
        Orbital is a fictional flight-operations console, built as a tour of the
        Next.js App Router — streaming, incremental regeneration, server actions
        and generated social images, all in one small project.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/missions"
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-void transition-transform hover:scale-[1.02]"
        >
          Browse missions
        </Link>
        <Link
          href="/control"
          className="rounded-xl border border-edge bg-panel/60 px-5 py-2.5 text-sm text-ink transition-colors hover:border-cyan/50"
        >
          Open live console
        </Link>
      </div>
    </section>
  );
}

async function StatsBar() {
  const stats = await getProgrammeStats();

  const items = [
    { label: "Missions", value: String(stats.total), accent: "text-cyan" },
    { label: "In flight", value: String(stats.active), accent: "text-mint" },
    { label: "Crew in space", value: String(stats.crewInSpace), accent: "text-violet" },
    { label: "Km covered", value: formatNumber(stats.kilometres), accent: "text-amber" },
  ];

  return (
    <Panel className="grid grid-cols-2 divide-edge/70 p-1 sm:grid-cols-4 sm:divide-x">
      {items.map((item) => (
        <div key={item.label} className="animate-rise px-5 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {item.label}
          </p>
          <p className={`mt-2 text-3xl font-semibold tabular-nums ${item.accent}`}>
            {item.value}
          </p>
        </div>
      ))}
    </Panel>
  );
}

async function ActiveMissions() {
  const missions = await getMissions();
  const active = missions.filter((mission) => mission.status === "active");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {active.map((mission) => (
        <MissionCard key={mission.slug} mission={mission} />
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <Panel className="grid grid-cols-2 gap-px p-1 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="px-5 py-6">
          <Shimmer className="h-2.5 w-20" />
          <Shimmer className="mt-3 h-8 w-16" />
        </div>
      ))}
    </Panel>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Shimmer key={i} className="h-56 rounded-2xl" />
      ))}
    </div>
  );
}
