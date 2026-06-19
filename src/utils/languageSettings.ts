export type AppLanguageId = 'en' | 'es' | 'fr'

export type AppLanguage = {
  id: AppLanguageId
  label: string
  nativeLabel: string
}

const STORAGE_KEY = 'remote-off.app-language'

export const APP_LANGUAGES: AppLanguage[] = [
  { id: 'en', label: 'English', nativeLabel: 'English' },
  { id: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { id: 'fr', label: 'French', nativeLabel: 'Français' },
]

export function readAppLanguage(): AppLanguageId {
  if (typeof window === 'undefined') return 'en'

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'es' || stored === 'fr') return stored
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
  return APP_LANGUAGES.find((entry) => entry.id === language)?.label ?? 'English'
}
