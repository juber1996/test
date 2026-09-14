import { Shimmer } from "@/components/ui";

/**
 * Shown instantly on navigation while the route segment renders on the server.
 * Next.js wraps the page in a <Suspense> boundary using this as the fallback.
 */
export default function Loading() {
  return (
    <div className="space-y-8">
      <Shimmer className="h-4 w-40" />
      <Shimmer className="h-16 w-full max-w-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
