export function hasNonEmptyStringValues(
  values: Record<string, unknown>
): boolean {
  return Object.values(values).some(
    (value) => typeof value === "string" && value.trim() !== ""
  );
}

export function fieldsDiffer(
  form: Record<string, string>,
  saved: Record<string, string | null | undefined>,
  keys: readonly string[]
): boolean {
  return keys.some((key) => (form[key] ?? "") !== (saved[key] ?? ""));
}

export function normalizeDate(value: string | null | undefined): string {
  return value ? value.substring(0, 10) : "";
}

export function fieldDiffers(
  formValue: string,
  savedValue: string | null | undefined
): boolean {
  return (formValue ?? "") !== (savedValue ?? "");
}

export function isFieldUnsaved(
  formValue: string,
  savedValue: string | null | undefined
): boolean {
  return fieldDiffers(formValue, savedValue);
}
