import { cache } from "react";

export type MissionStatus = "active" | "completed" | "planned";

export type Mission = {
  slug: string;
  name: string;
  codename: string;
  agency: string;
  status: MissionStatus;
  launchDate: string;
  destination: string;
  crew: number;
  durationDays: number;
  distanceKm: number;
  summary: string;
  description: string;
  accent: string;
  objectives: string[];
};

/**
 * A tiny local "database". In a real app this would be Postgres, a CMS, or an
 * external API — nothing else in the project would change, because every read
 * already goes through the async functions at the bottom of this file.
 */
const MISSIONS: Mission[] = [
  {
    slug: "aurora-7",
    name: "Aurora 7",
    codename: "AUR-07",
    agency: "Orbital Dynamics",
    status: "active",
    launchDate: "2031-03-14",
    destination: "Low Earth Orbit",
    crew: 4,
    durationDays: 180,
    distanceKm: 412,
    accent: "#22d3ee",
    summary:
      "A long-duration orbital laboratory studying crystal growth in microgravity.",
    description:
      "Aurora 7 is the seventh flight in the Aurora programme and the first to carry a full materials-science payload. The crew of four operates a pressurised laboratory module for one hundred and eighty days, running a rotating schedule of protein crystallisation and alloy solidification experiments that cannot be reproduced under Earth gravity.",
    objectives: [
      "Grow 240 protein crystal samples in microgravity",
      "Validate the closed-loop water recovery system",
      "Test autonomous docking software revision 4.2",
    ],
  },
  {
    slug: "helios-prime",
    name: "Helios Prime",
    codename: "HEL-01",
    agency: "Solaris Consortium",
    status: "active",
    launchDate: "2030-11-02",
    destination: "Solar Polar Orbit",
    crew: 0,
    durationDays: 2190,
    distanceKm: 149600000,
    accent: "#fbbf24",
    summary:
      "An uncrewed probe mapping the solar magnetic field from a polar vantage point.",
    description:
      "Helios Prime uses a Venus gravity assist to climb out of the ecliptic plane and observe the solar poles directly — a viewpoint no crewed mission can reach. Its magnetometer boom and coronagraph return a continuous stream of data used to forecast space weather days before it reaches Earth.",
    objectives: [
      "Map polar field reversal across one full solar cycle",
      "Image coronal mass ejections from above the ecliptic",
      "Deliver 6-hour advance warning for geomagnetic storms",
    ],
  },
  {
    slug: "meridian-station",
    name: "Meridian Station",
    codename: "MRD-STN",
    agency: "Orbital Dynamics",
    status: "active",
    launchDate: "2028-06-21",
    destination: "Lunar Gateway",
    crew: 8,
    durationDays: 3650,
    distanceKm: 384400,
    accent: "#a78bfa",
    summary:
      "A permanently crewed waystation in near-rectilinear halo orbit around the Moon.",
    description:
      "Meridian Station is the staging point for every surface expedition in the programme. Eight crew members rotate on six-month shifts, maintaining the fuel depot, the lander garage, and the deep-space communications relay that keeps the far side of the Moon in constant contact with Earth.",
    objectives: [
      "Maintain continuous crewed presence in cislunar space",
      "Refuel and service surface landers between expeditions",
      "Relay communications for far-side surface operations",
    ],
  },
  {
    slug: "tessera-1",
    name: "Tessera 1",
    codename: "TES-01",
    agency: "Vanguard Aerospace",
    status: "completed",
    launchDate: "2026-09-08",
    destination: "Mars Transfer Orbit",
    crew: 0,
    durationDays: 260,
    distanceKm: 225000000,
    accent: "#f97316",
    summary:
      "The cargo precursor that pre-positioned supplies in Mars orbit ahead of crewed flights.",
    description:
      "Tessera 1 carried forty tonnes of consumables, spare parts, and an inflatable surface habitat to Mars orbit, where it waits for the first crewed arrival. The mission proved the aerocapture manoeuvre that saved enough propellant to make the whole architecture viable.",
    objectives: [
      "Demonstrate aerocapture in the Martian atmosphere",
      "Pre-position 40 t of cargo in Mars orbit",
      "Validate 260-day autonomous cruise operations",
    ],
  },
  {
    slug: "quill-observatory",
    name: "Quill Observatory",
    codename: "QLL-OBS",
    agency: "Deep Field Institute",
    status: "completed",
    launchDate: "2025-04-17",
    destination: "Sun-Earth L2",
    crew: 0,
    durationDays: 1825,
    distanceKm: 1500000,
    accent: "#34d399",
    summary:
      "An infrared observatory that surveyed 100,000 exoplanet atmospheres from L2.",
    description:
      "Parked at the second Sun-Earth Lagrange point, Quill spent five years staring at the same patch of sky, building the deepest infrared survey ever attempted. Its transit spectroscopy catalogue is still the reference dataset for atmospheric composition studies.",
    objectives: [
      "Survey 100,000 candidate exoplanet atmospheres",
      "Detect biosignature gases around temperate worlds",
      "Publish an open infrared sky catalogue",
    ],
  },
  {
    slug: "vesper-outpost",
    name: "Vesper Outpost",
    codename: "VSP-OUT",
    agency: "Vanguard Aerospace",
    status: "planned",
    launchDate: "2034-02-09",
    destination: "Mars Surface — Jezero",
    crew: 6,
    durationDays: 900,
    distanceKm: 225000000,
    accent: "#f472b6",
    summary:
      "The first crewed surface outpost, targeting a 900-day stay in Jezero crater.",
    description:
      "Vesper Outpost lands six crew beside the cargo already delivered by Tessera 1. The expedition is designed around in-situ resource utilisation: water pulled from subsurface ice, oxygen cracked from atmospheric carbon dioxide, and methane synthesised on the surface for the return flight.",
    objectives: [
      "Land six crew within 500 m of the cargo cache",
      "Produce 25 t of return propellant from local resources",
      "Drill 20 m into the Jezero delta deposits",
    ],
  },
];

/** Stands in for the latency of a real database or API call. */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * `cache` de-duplicates calls within a single request, so a page and its
 * `generateMetadata` can both ask for the same mission without paying twice.
 */
export const getMissions = cache(async (): Promise<Mission[]> => {
  await delay(400);
  return MISSIONS;
});

export const getMission = cache(
  async (slug: string): Promise<Mission | undefined> => {
    await delay(300);
    return MISSIONS.find((mission) => mission.slug === slug);
  },
);

export function getMissionSlugs(): string[] {
  return MISSIONS.map((mission) => mission.slug);
}

export type MissionFilters = {
  q?: string;
  status?: string;
};

/** Server-side filtering — this is what the `searchParams` prop feeds into. */
export async function searchMissions({
  q,
  status,
}: MissionFilters): Promise<Mission[]> {
  const missions = await getMissions();
  const term = q?.trim().toLowerCase() ?? "";

  return missions.filter((mission) => {
    const matchesStatus =
      !status || status === "all" || mission.status === status;
    const matchesTerm =
      !term ||
      mission.name.toLowerCase().includes(term) ||
      mission.agency.toLowerCase().includes(term) ||
      mission.destination.toLowerCase().includes(term) ||
      mission.summary.toLowerCase().includes(term);

    return matchesStatus && matchesTerm;
  });
}

export async function getProgrammeStats() {
  await delay(900); // deliberately slow, so the streaming skeleton is visible
  const missions = await getMissions();

  return {
    total: missions.length,
    active: missions.filter((m) => m.status === "active").length,
    crewInSpace: missions
      .filter((m) => m.status === "active")
      .reduce((sum, m) => sum + m.crew, 0),
    kilometres: missions.reduce((sum, m) => sum + m.distanceKm, 0),
  };
}
