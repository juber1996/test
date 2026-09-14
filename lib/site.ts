/**
 * Resolves the public base URL of the deployment.
 *
 * Order matters:
 *  1. NEXT_PUBLIC_SITE_URL — set this in Vercel once you have a custom domain.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — injected by Vercel, stable across deploys.
 *  3. localhost — development fallback.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
