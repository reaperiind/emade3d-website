export const locales = ["fr", "en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const rtlLocales: Locale[] = ["ar"];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const localeShortNames: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
};

/**
 * Takes an already localized pathname (e.g. "/realisations/verin") and returns
 * the same path prefixed with the target locale, dropping the previous prefix.
 */
export function localizePath(
  pathname: string,
  target: Locale
): string {
  const cleaned = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return cleaned === "/" ? `/${target}` : `/${target}${cleaned}`;
}