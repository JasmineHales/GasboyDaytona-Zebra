import type { AppLanguageId } from '../utils/languageSettings'

export function localeForLanguage(language: AppLanguageId): string {
  if (language === 'es') return 'es-US'
  if (language === 'fr') return 'fr-FR'
  return 'en-US'
}
