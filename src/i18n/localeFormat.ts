import type { AppLanguageId } from '../utils/languageSettings'

const LOCALE_OVERRIDES: Partial<Record<AppLanguageId, string>> = {
  en: 'en-US',
  es: 'es-US',
  fr: 'fr-FR',
}

export function localeForLanguage(language: AppLanguageId): string {
  if (LOCALE_OVERRIDES[language]) return LOCALE_OVERRIDES[language]!

  if (typeof Intl !== 'undefined' && 'Locale' in Intl) {
    try {
      return new Intl.Locale(language).maximize().toString()
    } catch {
      // fall through
    }
  }

  return 'en-US'
}
