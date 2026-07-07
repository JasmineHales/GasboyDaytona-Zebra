export type AppThemeId = 'light' | 'dark'

const STORAGE_KEY = 'remote-off.app-theme'
const FIELD_MODE_KEY = 'remote-off.field-mode'

export function readAppTheme(): AppThemeId {
  if (typeof window === 'undefined') return 'light'

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore
  }

  return 'light'
}

export function persistAppTheme(theme: AppThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export function readFieldMode(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return localStorage.getItem(FIELD_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

export function persistFieldMode(enabled: boolean): void {
  try {
    localStorage.setItem(FIELD_MODE_KEY, enabled ? 'true' : 'false')
  } catch {
    // ignore
  }
}

export function applyAppTheme(theme: AppThemeId): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function applyFieldMode(enabled: boolean): void {
  document.documentElement.dataset.fieldMode = enabled ? 'true' : 'false'
}

export function applyThemeSettings(theme: AppThemeId, fieldMode: boolean): void {
  applyAppTheme(theme)
  applyFieldMode(fieldMode)
}
