"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const STATUSES = ["all", "active", "completed", "planned"] as const;

/**
 * Filters are kept in the URL, not in React state, so a filtered view can be
 * shared or reloaded. `useTransition` keeps the old list on screen (dimmed)
 * while the server renders the new one.
 */
export function MissionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeStatus = params.get("status") ?? "all";
  const [term, setTerm] = useState(params.get("q") ?? "");

  // Debounce the text input so we do not push a navigation on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (term) next.set("q", term);
      else next.delete("q");

      if (next.toString() === params.toString()) return;
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [term, params, pathname, router]);

  function setStatus(status: string) {
    const next = new URLSearchParams(params.toString());
    if (status === "all") next.delete("status");
    else next.set("status", status);

    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      className={`flex flex-col gap-3 transition-opacity sm:flex-row sm:items-center sm:justify-between ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <div className="relative sm:w-72">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search name, agency, target…"
          aria-label="Search missions"
          className="w-full rounded-xl border border-edge bg-panel/60 py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-cyan/60"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatus(status)}
            aria-pressed={activeStatus === status}
            className={`rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              activeStatus === status
                ? "bg-ink text-void"
                : "border border-edge text-muted hover:border-cyan/50 hover:text-ink"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
