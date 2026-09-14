import { cookies } from "next/headers";

export type LogEntry = {
  id: string;
  author: string;
  message: string;
  at: string;
};

const COOKIE = "orbital_log";
const MAX_ENTRIES = 8;

/**
 * The mission log lives in a cookie rather than a database. That keeps the
 * project dependency-free while still being genuinely stateful per visitor,
 * and it survives on Vercel where a module-level array would not (each
 * serverless invocation can run on a different machine).
 */
export async function readLog(): Promise<LogEntry[]> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLogEntry).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export async function writeLog(entries: LogEntry[]): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, encodeURIComponent(JSON.stringify(entries.slice(0, MAX_ENTRIES))), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

function isLogEntry(value: unknown): value is LogEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.author === "string" &&
    typeof entry.message === "string" &&
    typeof entry.at === "string"
  );
}
