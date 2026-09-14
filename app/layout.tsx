import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavLinks } from "@/components/nav-links";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // metadataBase makes every relative OG/Twitter image URL absolute.
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Orbital — Mission Control",
    template: "%s · Orbital",
  },
  description:
    "A demo mission-control console built with the Next.js App Router: streaming, ISR, server actions and dynamic OG images.",
  openGraph: {
    type: "website",
    siteName: "Orbital",
    title: "Orbital — Mission Control",
    description: "A demo mission-control console built with the Next.js App Router.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="starfield" aria-hidden="true" />

        <header className="sticky top-0 z-50 border-b border-edge/70 bg-void/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-cyan to-violet text-void">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="3.2" />
                  <ellipse cx="12" cy="12" rx="10" ry="4.6" transform="rotate(-28 12 12)" />
                </svg>
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                Orbital
                <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  ops
                </span>
              </span>
            </Link>

            <NavLinks />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:py-14">
          {children}
        </main>

        <footer className="border-t border-edge/70 bg-deep/40">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              Orbital is a fictional demo project. Built with Next.js{" "}
              <span className="font-mono text-ink/70">App Router</span>.
            </p>
            <p className="font-mono">
              deployed via GitHub → Vercel
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
