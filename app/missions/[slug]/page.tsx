import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel, StatusBadge, formatDate, formatNumber } from "@/components/ui";
import { getMission, getMissionSlugs } from "@/lib/missions";

/**
 * Prerender one HTML file per mission at build time…
 */
export function generateStaticParams() {
  return getMissionSlugs().map((slug) => ({ slug }));
}

/** …and regenerate each of them at most once an hour (ISR). */
export const revalidate = 3600;

/** Unknown slugs 404 instead of being rendered on demand. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/missions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const mission = await getMission(slug);

  if (!mission) return { title: "Mission not found" };

  return {
    title: mission.name,
    description: mission.summary,
    openGraph: {
      title: `${mission.name} — ${mission.codename}`,
      description: mission.summary,
    },
  };
}

export default async function MissionPage({
  params,
}: PageProps<"/missions/[slug]">) {
  const { slug } = await params;
  const mission = await getMission(slug);

  if (!mission) notFound();

  const specs = [
    { label: "Agency", value: mission.agency },
    { label: "Destination", value: mission.destination },
    { label: "Launch", value: formatDate(mission.launchDate) },
    { label: "Duration", value: `${formatNumber(mission.durationDays)} days` },
    { label: "Crew", value: mission.crew === 0 ? "Uncrewed" : `${mission.crew}` },
    { label: "Distance", value: `${formatNumber(mission.distanceKm)} km` },
  ];

  return (
    <article className="animate-rise space-y-10">
      <Link
        href="/missions"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
      >
        ← All missions
      </Link>

      <header className="relative overflow-hidden rounded-3xl border border-edge/80 bg-panel/50 p-7 sm:p-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: mission.accent }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-void"
            style={{ backgroundColor: mission.accent }}
          >
            {mission.codename}
          </span>
          <StatusBadge status={mission.status} />
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {mission.name}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          {mission.summary}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {specs.map((spec) => (
          <Panel key={spec.label} className="px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {spec.label}
            </p>
            <p className="mt-1.5 text-sm font-medium">{spec.value}</p>
          </Panel>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
            Mission brief
          </h2>
          <p className="mt-3 text-[15px] leading-[1.75] text-ink/85">
            {mission.description}
          </p>
        </div>

        <Panel className="h-fit p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
            Primary objectives
          </h2>
          <ol className="mt-4 space-y-3">
            {mission.objectives.map((objective, index) => (
              <li key={objective} className="flex gap-3 text-sm text-ink/85">
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md font-mono text-[10px] text-void"
                  style={{ backgroundColor: mission.accent }}
                >
                  {index + 1}
                </span>
                {objective}
              </li>
            ))}
          </ol>
        </Panel>
      </section>
    </article>
  );
}
