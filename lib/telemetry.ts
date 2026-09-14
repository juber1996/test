export type Telemetry = {
  timestamp: string;
  altitudeKm: number;
  velocityKmS: number;
  signalDb: number;
  powerPct: number;
  oxygenPct: number;
  temperatureC: number;
  uplink: "nominal" | "degraded";
};

/**
 * Derives a plausible telemetry frame from the current clock. Because the value
 * depends on `Date.now()`, any route that renders it cannot be prerendered —
 * which is exactly what makes /control a dynamic route.
 */
export function readTelemetry(now = Date.now()): Telemetry {
  const t = now / 1000;
  const wave = (period: number, phase = 0) =>
    Math.sin((t / period) * Math.PI * 2 + phase);

  return {
    timestamp: new Date(now).toISOString(),
    altitudeKm: round(408 + wave(37) * 6.4, 2),
    velocityKmS: round(7.66 + wave(23, 1.1) * 0.04, 3),
    signalDb: round(-71 + wave(11, 0.4) * 5, 1),
    powerPct: round(87 + wave(53, 2.2) * 9, 1),
    oxygenPct: round(20.9 + wave(67, 0.8) * 0.3, 2),
    temperatureC: round(21.5 + wave(29, 1.9) * 3.2, 1),
    uplink: wave(97) > -0.85 ? "nominal" : "degraded",
  };
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
