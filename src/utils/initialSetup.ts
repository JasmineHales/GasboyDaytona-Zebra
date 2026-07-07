import type { AppLanguageId } from './languageSettings'
import type { AppThemeId } from './themeSettings'

const SETUP_KEY = 'remote-off.initial-setup-complete'

/** Prefilled choices on first-time setup (location remains unset). */
export const INITIAL_SETUP_DEFAULTS = {
  language: 'en' as AppLanguageId,
  theme: 'light' as AppThemeId,
  fieldMode: false,
} as const

export function readInitialSetupComplete(): boolean {
  try {
    return localStorage.getItem(SETUP_KEY) === '1'
  } catch {
    return false
  }
}

export function markInitialSetupComplete() {
  try {
    localStorage.setItem(SETUP_KEY, '1')
  } catch {
    // ignore
  }
}

export function clearInitialSetupComplete() {
  try {
    localStorage.removeItem(SETUP_KEY)
  } catch {
    // ignore
  }
}
