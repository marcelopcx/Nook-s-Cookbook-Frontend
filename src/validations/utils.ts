import type { ZodError } from "zod";

export function getFieldErrors<T extends string>(
  error: ZodError,
): Partial<Record<T, string>> {
  const fieldErrors: Partial<Record<T, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as T | undefined;
    if (!field) continue;
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}
