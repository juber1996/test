"use client";

import { useEffect, useState } from "react";
import type { Telemetry } from "@/lib/telemetry";

type Gauge = {
  key: keyof Telemetry;
  label: string;
  unit: string;
  min: number;
  max: number;
  accent: string;
};

const GAUGES: Gauge[] = [
  { key: "altitudeKm", label: "Altitude", unit: "km", min: 395, max: 420, accent: "#22d3ee" },
  { key: "velocityKmS", label: "Velocity", unit: "km/s", min: 7.6, max: 7.72, accent: "#a78bfa" },
  { key: "powerPct", label: "Power", unit: "%", min: 70, max: 100, accent: "#fbbf24" },
  { key: "signalDb", label: "Signal", unit: "dB", min: -80, max: -60, accent: "#34d399" },
  { key: "oxygenPct", label: "Oxygen", unit: "%", min: 20.4, max: 21.4, accent: "#f472b6" },
  { key: "temperatureC", label: "Cabin temp", unit: "°C", min: 16, max: 27, accent: "#22d3ee" },
];

/**
 * The client half of the live console: it polls the /api/telemetry Route
 * Handler and keeps a rolling history for the sparkline.
 *
 * `initial` comes from the server render, so the panel is never empty — even
 * on the very first paint, before any fetch has resolved.
 */
export function TelemetryFeed({ initial }: { initial: Telemetry }) {
  const [frame, setFrame] = useState<Telemetry>(initial);
  const [connected, setConnected] = useState(true);
  const [history, setHistory] = useState<number[]>([initial.altitudeKm]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch("/api/telemetry", { cache: "no-store" });
        if (!response.ok) throw new Error(String(response.status));
        const next: Telemetry = await response.json();
        if (cancelled) return;

        setHistory((previous) => [...previous, next.altitudeKm].slice(-48));
        setFrame(next);
        setConnected(true);
      } catch {
        if (!cancelled) setConnected(false);
      }
    }

    const timer = setInterval(poll, 2000);
    poll();

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-mint animate-pulse-ring text-mint" : "bg-rose"
            }`}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {connected ? "Downlink live" : "Downlink lost"}
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted/70 tabular-nums">
          {frame.timestamp.slice(11, 19)} UTC
        </span>
      </div>

      <Sparkline points={history} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GAUGES.map((gauge) => {
          const value = frame[gauge.key] as number;
          const pct = Math.min(
            100,
            Math.max(0, ((value - gauge.min) / (gauge.max - gauge.min)) * 100),
          );

          return (
            <div
              key={gauge.key}
              className="rounded-xl border border-edge/70 bg-void/40 px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {gauge.label}
              </p>
              <p className="mt-1 font-mono text-lg tabular-nums">
                {value}
                <span className="ml-1 text-xs text-muted">{gauge.unit}</span>
              </p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-edge">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: gauge.accent }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <div className="h-24 rounded-xl border border-edge/70 bg-void/40" />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - ((value - min) / span) * 100;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="overflow-hidden rounded-xl border border-edge/70 bg-void/40">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-24 w-full"
        role="img"
        aria-label="Altitude over the last 48 samples"
      >
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L100,100 L0,100 Z`} fill="url(#spark)" />
        <path
          d={path}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
