import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        Signal lost
      </p>
      <h1 className="mt-3 bg-linear-to-r from-cyan to-violet bg-clip-text text-6xl font-semibold text-transparent">
        404
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        That route is not on the flight plan.
      </p>
      <Link
        href="/"
        className="mt-7 inline-block rounded-xl border border-edge bg-panel/60 px-5 py-2.5 text-sm transition-colors hover:border-cyan/50"
      >
        Return to overview
      </Link>
    </div>
  );
}
