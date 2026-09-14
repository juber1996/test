import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

/**
 * On-demand revalidation. Statically generated pages normally refresh on the
 * schedule set by `export const revalidate`, but a CMS webhook (or you, with
 * curl) can force a refresh immediately:
 *
 *   curl -X POST "https://<your-app>/api/revalidate?path=/missions&secret=..."
 *
 * The secret comes from the REVALIDATE_SECRET environment variable, which you
 * add in the Vercel dashboard under Settings → Environment Variables.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = request.nextUrl.searchParams.get("path") ?? "/";

  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    return Response.json(
      { revalidated: false, reason: "REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (secret !== expected) {
    return Response.json(
      { revalidated: false, reason: "Invalid secret" },
      { status: 401 },
    );
  }

  revalidatePath(path);

  return Response.json({ revalidated: true, path, at: new Date().toISOString() });
}
