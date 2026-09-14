import { readTelemetry } from "@/lib/telemetry";

/**
 * A Route Handler: a plain HTTP endpoint living inside the app directory.
 * The live console polls this every two seconds.
 *
 * Route Handlers are not cached by default, but the CDN in front of Vercel
 * might be, so the no-store header makes the intent explicit.
 */
export async function GET() {
  return Response.json(readTelemetry(), {
    headers: { "Cache-Control": "no-store" },
  });
}
