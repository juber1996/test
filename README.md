# Orbital

A small, deliberately over-engineered demo app — a fictional space mission-control console — built to practise the **local → GitHub → Vercel** workflow and to show off what the Next.js App Router can do.

Six screens, no database, no API keys, no paid services. It builds in about a minute and deploys in one click.

---

## 1. Run it locally

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000>.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (the same thing Vercel runs) |
| `npm start` | Serve the production build locally |
| `npm run lint` | ESLint |

> Before pushing anything, run `npm run build` locally. If it fails on your machine, it will fail on Vercel — and it is much faster to find out here.

---

## 2. What each part of the app teaches

The whole point of this project is that every route demonstrates a *different* rendering strategy. Run `npm run build` and look at the route table it prints — the symbols in that table are the lesson:

```
○  (Static)   prerendered at build time
●  (SSG)      prerendered from generateStaticParams
ƒ  (Dynamic)  server-rendered on every request
```

| Route | Type | What to look at |
| --- | --- | --- |
| `/` | Static + ISR | `export const revalidate = 3600` rebuilds the page at most hourly. The stats bar is slow on purpose and is wrapped in `<Suspense>`, so it **streams in** after the rest of the page has already painted. |
| `/missions` | Dynamic | Reading the `searchParams` prop forces per-request rendering. Filters live in the URL, so a filtered view is shareable and survives a reload. |
| `/missions/[slug]` | SSG + ISR | `generateStaticParams()` prerenders one HTML file per mission; `generateMetadata()` gives each its own `<title>`; `dynamicParams = false` makes unknown slugs 404. |
| `/missions/[slug]/opengraph-image` | Dynamic | A social preview PNG generated from JSX and CSS at request time. Open <http://localhost:3000/missions/aurora-7/opengraph-image> to see it. |
| `/control` | Dynamic | `dynamic = "force-dynamic"`. A **Server Action** writes the mission log to a cookie; a client component polls a Route Handler every 2 seconds for live telemetry. |
| `/api/telemetry` | Route Handler | A plain JSON endpoint living inside `app/`. |
| `/api/revalidate` | Route Handler | On-demand cache invalidation, guarded by a secret (see §5). |
| `/sitemap.xml`, `/robots.txt` | Static | Generated from code in `app/sitemap.ts` and `app/robots.ts`. |

Also worth opening:

- `app/error.tsx` — an error boundary. Throw something in a page to see it.
- `app/not-found.tsx` — the 404 screen. Try `/missions/does-not-exist`.
- `app/loading.tsx` — the instant skeleton shown during navigation.
- `lib/missions.ts` — every read is `async` and deliberately slow, so streaming is actually visible.

### Server Components vs Client Components

Almost everything here is a **Server Component** — it runs on the server, never ships to the browser, and can `await` data directly. Only four files start with `"use client"`, and each has a specific reason:

| File | Why it must be a Client Component |
| --- | --- |
| `components/nav-links.tsx` | `usePathname()` |
| `components/mission-filters.tsx` | input state, `useTransition()` |
| `components/telemetry-feed.tsx` | `setInterval`, `fetch` in the browser |
| `components/log-form.tsx` | `useActionState()` |
| `app/error.tsx` | error boundaries must be client-side |

That is the habit worth building: **server by default, client only when you need interactivity.**

---

## 3. Push it to GitHub

If this folder is not a git repo yet:

```bash
git init -b main
```

```bash
git add . && git commit -m "Initial commit"
```

Create an empty repo on GitHub (**do not** let it add a README, `.gitignore`, or licence — you already have them), then:

```bash
git remote add origin https://github.com/<your-username>/orbital.git
```

```bash
git push -u origin main
```

`-u` links your local `main` to the remote `main`, so after this first push you can just type `git push`.

### Check what you are committing

`.gitignore` already excludes `node_modules/`, `.next/`, and `.env*.local`. Verify before your first push:

```bash
git status --short
```

If you ever see `node_modules` or `.env.local` in that list, stop and fix `.gitignore` first. Secrets pushed to GitHub are effectively public forever, even if you delete the commit afterwards.

---

## 4. Connect GitHub to Vercel

1. Go to <https://vercel.com/new> and sign in **with your GitHub account**.
2. Pick the `orbital` repository → **Import**.
3. Vercel auto-detects Next.js. Leave every build setting on its default.
4. Add an environment variable (Settings → Environment Variables):
   - `REVALIDATE_SECRET` = any long random string
5. **Deploy.**

About a minute later you have a live URL like `https://orbital-xyz.vercel.app`.

### What you just set up

From now on, Vercel watches the repository:

| You do this | Vercel does this |
| --- | --- |
| `git push` to `main` | Builds and deploys to **production** |
| `git push` to any other branch | Builds and deploys a **preview** at its own URL |
| Open a pull request | Comments on the PR with the preview link |
| Push a commit that fails to build | Deployment fails; the previous version stays live |

That last row is the important one. **A broken build never replaces a working site.** This is why the workflow is safe to experiment with.

---

## 5. The everyday loop

Once connected, shipping a change looks like this:

```bash
git checkout -b tweak-hero
```

Edit something — say the headline in `app/page.tsx` — then:

```bash
git add . && git commit -m "Reword the hero headline"
```

```bash
git push -u origin tweak-hero
```

Open the pull request on GitHub. Vercel posts a preview URL in the PR within a minute. Click it, check your change on the real thing, then merge. Merging to `main` triggers the production deploy automatically.

### Try on-demand revalidation

`/` and `/missions/[slug]` are cached for an hour. To force a refresh without waiting or redeploying:

```bash
curl -X POST "https://<your-app>.vercel.app/api/revalidate?path=/&secret=<your-secret>"
```

This is the mechanism a CMS webhook would use: content changes → webhook fires → the affected page rebuilds, everything else stays cached.

---

## 6. Continuous integration

`.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, and `npm run build` on every push and pull request. It is independent of Vercel — Vercel tells you whether the site deployed, GitHub Actions tells you whether the code is clean.

It needs no configuration or secrets. Push once and open the **Actions** tab on GitHub to watch it run.

---

## 7. Things to try next

Small changes, in rough order of difficulty:

1. Add a seventh mission to the array in `lib/missions.ts`. Notice that `/missions`, the sitemap, and `generateStaticParams` all pick it up with no other edits.
2. Change `revalidate = 3600` to `60` on the home page and watch the route table in `npm run build` change.
3. Delete the `<Suspense>` wrapper around `<StatsBar />` and reload — the whole page now waits for the slow query. Put it back.
4. Swap `lib/missions.ts` for a real data source (a public API, or Vercel Postgres). Nothing else in the app should need to change.
5. Turn on [Cache Components](https://nextjs.org/docs/app/getting-started/caching) (`cacheComponents: true` in `next.config.ts`) and migrate to `use cache` — the newer caching model in Next.js 16.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · ESLint · Zero runtime dependencies beyond the framework.
