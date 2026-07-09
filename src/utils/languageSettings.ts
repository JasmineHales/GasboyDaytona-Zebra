import {
  getAppLanguageCatalog,
  getAppLanguageEntry,
  isAppLanguageId,
  type AppLanguage,
  type AppLanguageId,
} from './appLanguageCatalog'

export type { AppLanguage, AppLanguageId }

const STORAGE_KEY = 'remote-off.app-language'

/** Locales with full in-app message translations. Others fall back to English copy. */
export const TRANSLATED_LANGUAGE_IDS = ['en', 'es', 'fr'] as const
export type TranslatedLanguageId = (typeof TRANSLATED_LANGUAGE_IDS)[number]

export function resolveTranslatedLanguageId(language: AppLanguageId): TranslatedLanguageId {
  if (language === 'es' || language === 'fr') return language
  return 'en'
}

export const APP_LANGUAGES: AppLanguage[] = getAppLanguageCatalog()

export function readAppLanguage(): AppLanguageId {
  if (typeof window === 'undefined') return 'en'

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isAppLanguageId(stored)) return stored
  } catch {
    // ignore
  }

  return 'en'
}

export function persistAppLanguage(language: AppLanguageId): void {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // ignore
  }
}

export function appLanguageLabel(language: AppLanguageId): string {
  return getAppLanguageEntry(language)?.label ?? 'English'
}
