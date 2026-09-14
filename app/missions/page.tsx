import type { Metadata } from "next";
import { Suspense } from "react";
import { MissionCard } from "@/components/mission-card";
import { MissionFilters } from "@/components/mission-filters";
import { Panel, SectionHeading, Shimmer } from "@/components/ui";
import { searchMissions } from "@/lib/missions";

export const metadata: Metadata = {
  title: "Missions",
  description: "Every mission in the Orbital programme, filterable by status.",
};

/**
 * Reading `searchParams` opts this route into dynamic rendering: it is built
 * per request, because the filters live in the URL.
 */
export default async function MissionsPage({
  searchParams,
}: PageProps<"/missions">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Programme archive" title="All missions" />

      <Suspense fallback={null}>
        <MissionFilters />
      </Suspense>

      {/* Re-keying the boundary makes the skeleton reappear on every new query. */}
      <Suspense key={`${q}-${status}`} fallback={<ListSkeleton />}>
        <MissionList q={q} status={status} />
      </Suspense>
    </div>
  );
}

async function MissionList({ q, status }: { q?: string; status?: string }) {
  const missions = await searchMissions({ q, status });

  if (missions.length === 0) {
    return (
      <Panel className="px-6 py-16 text-center">
        <p className="font-mono text-sm text-muted">No missions match that query.</p>
        <p className="mt-2 text-xs text-muted/70">
          Try clearing the search box or switching the status filter.
        </p>
      </Panel>
    );
  }

  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {missions.length} result{missions.length === 1 ? "" : "s"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {missions.map((mission) => (
          <MissionCard key={mission.slug} mission={mission} />
        ))}
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Shimmer key={i} className="h-56 rounded-2xl" />
      ))}
    </div>
  );
}
