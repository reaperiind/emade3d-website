import type { Locale } from "@/i18n/config";

/**
 * Localized data helper.
 *
 * Any piece of content that lives in a data file (services, projects, FAQ,
 * process steps...) stores its text per-locale. This helper picks the right
 * variant, falling back to the default locale when a value is missing.
 */
export type LocalizedText = Partial<Record<Locale, string>>;

export function localized(
  value: LocalizedText,
  locale: Locale,
  fallback: Locale = "fr"
): string {
  if (value[locale]) return value[locale];
  if (value[fallback]) return value[fallback];
  return "";
}

export function localizeObject<T extends Record<string, LocalizedText>>(
  obj: T,
  locale: Locale
): Record<keyof T, string> {
  const out = {} as Record<keyof T, string>;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    out[key] = localized(obj[key], locale);
  }
  return out;
}