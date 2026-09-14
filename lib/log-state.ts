/**
 * A file marked "use server" may only export async functions, so the form's
 * state shape and its initial value live here instead of in app/actions.ts.
 */
export type LogFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialLogState: LogFormState = { status: "idle", message: "" };
