export function hasNonEmptyStringValues(values: object): boolean {
  return Object.values(values).some(
    (value) => typeof value === "string" && value.trim() !== ""
  );
}

export function fieldsDiffer(
  form: object,
  saved: object,
  keys: readonly string[]
): boolean {
  const formValues = form as Record<string, string>;
  const savedValues = saved as Record<string, string | null | undefined>;
  return keys.some((key) => (formValues[key] ?? "") !== (savedValues[key] ?? ""));
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
