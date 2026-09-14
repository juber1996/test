"use server";

import { revalidatePath } from "next/cache";
import { readLog, writeLog, type LogEntry } from "@/lib/log";
import type { LogFormState } from "@/lib/log-state";

/**
 * A Server Action. It runs only on the server, is invoked by a plain <form>,
 * and works even before client JavaScript has loaded (progressive enhancement).
 * The `useActionState` hook on the client expects this exact shape:
 * (previousState, formData) => nextState
 */
export async function addLogEntry(
  _prev: LogFormState,
  formData: FormData,
): Promise<LogFormState> {
  const author = String(formData.get("author") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (author.length < 2) {
    return { status: "error", message: "Call sign needs at least 2 characters." };
  }
  if (message.length < 4) {
    return { status: "error", message: "Log entry needs at least 4 characters." };
  }
  if (message.length > 160) {
    return { status: "error", message: "Log entry is capped at 160 characters." };
  }

  const entry: LogEntry = {
    id: crypto.randomUUID(),
    author: author.slice(0, 24),
    message,
    at: new Date().toISOString(),
  };

  const current = await readLog();
  await writeLog([entry, ...current]);

  // Tell Next.js the cached render of /control is stale.
  revalidatePath("/control");

  return { status: "success", message: "Entry recorded." };
}

export async function clearLog(): Promise<void> {
  await writeLog([]);
  revalidatePath("/control");
}
