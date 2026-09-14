import { ImageResponse } from "next/og";
import { getMission } from "@/lib/missions";

export const alt = "Orbital mission briefing card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * A social preview image, rendered as PNG on the server from JSX + CSS.
 * Visit /missions/aurora-7/opengraph-image to see it directly.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mission = await getMission(slug);

  if (!mission) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#04060f",
            color: "#e8ecff",
            fontSize: 64,
          }}
        >
          Mission not found
        </div>
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#04060f",
          backgroundImage: `radial-gradient(900px 600px at 85% -10%, ${mission.accent}33, transparent), radial-gradient(700px 500px at 0% 110%, #a78bfa22, transparent)`,
          color: "#e8ecff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: mission.accent,
            }}
          />
          <div
            style={{
              fontSize: 24,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#8b96bd",
            }}
          >
            Orbital · {mission.codename}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>
            {mission.name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 32,
              lineHeight: 1.4,
              color: "#8b96bd",
              maxWidth: 900,
            }}
          >
            {mission.summary}
          </div>
        </div>

        <div style={{ display: "flex", gap: 56, fontSize: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "#8b96bd", fontSize: 20 }}>STATUS</span>
            <span style={{ color: mission.accent, textTransform: "uppercase" }}>
              {mission.status}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "#8b96bd", fontSize: 20 }}>DESTINATION</span>
            <span>{mission.destination}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: "#8b96bd", fontSize: 20 }}>CREW</span>
            <span>{mission.crew === 0 ? "Uncrewed" : mission.crew}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
