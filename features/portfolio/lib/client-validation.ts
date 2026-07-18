"use client";

import {
  ContentValidationError,
  normalizeLongText,
  normalizeOptionalEmail,
  normalizeOptionalLabel,
  normalizeOptionalPhone,
  normalizeOptionalStoredUrl,
  normalizeRequiredLabel,
} from "@/lib/content-policy";

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function validationMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

export function validateField<T extends string>(
  errors: FieldErrors<T>,
  field: T,
  validator: () => unknown,
) {
  try {
    validator();
  } catch (error) {
    errors[field] = error instanceof ContentValidationError
      ? error.message
      : "Invalid value";
  }
}

export const clientValidators = {
  requiredLabel: normalizeRequiredLabel,
  optionalLabel: normalizeOptionalLabel,
  longText: normalizeLongText,
  email: normalizeOptionalEmail,
  phone: normalizeOptionalPhone,
  optionalUrl: normalizeOptionalStoredUrl,
};

export function firstValidationMessage(errors: FieldErrors<string>) {
  return Object.values(errors).find(Boolean);
}
