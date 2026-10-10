import type { TranslationKey } from "../context/translations";

export type TaskValidationError = Extract<
  TranslationKey,
  | "validateTaskEmpty"
  | "validateTaskMin5Characters"
  | "validateTaskMax50Characters"
>;

export type SubtaskValidationError = Extract<
  TranslationKey,
  "validateTaskMin5Characters" | "validateTaskMax50Characters"
>;

export function validateTask(
  value?: string | null,
): TaskValidationError | undefined {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "validateTaskEmpty";
  if (trimmed.length < 5) return "validateTaskMin5Characters";
  if (trimmed.length > 50) return "validateTaskMax50Characters";
  return undefined;
}

export function validateSubtask(
  value?: string | null,
): SubtaskValidationError | undefined {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return undefined;
  if (trimmed.length < 5) return "validateTaskMin5Characters";
  if (trimmed.length > 50) return "validateTaskMax50Characters";
  return undefined;
}
