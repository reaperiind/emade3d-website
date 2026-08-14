import fr from "@/i18n/dictionaries/fr";
import en from "@/i18n/dictionaries/en";
import ar from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";

const dictionaries = { fr, en, ar } as const;

export type Dictionary = typeof fr;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}