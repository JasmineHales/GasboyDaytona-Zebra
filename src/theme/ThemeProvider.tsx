import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyThemeSettings,
  persistAppTheme,
  persistFieldMode,
  readAppTheme,
  readFieldMode,
  type AppThemeId,
} from '../utils/themeSettings'

type ThemeContextValue = {
  theme: AppThemeId
  setTheme: (theme: AppThemeId) => void
  fieldMode: boolean
  setFieldMode: (enabled: boolean) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeId>(() => readAppTheme())
  const [fieldMode, setFieldModeState] = useState<boolean>(() => readFieldMode())

  const setTheme = useCallback((next: AppThemeId) => {
    setThemeState(next)
    persistAppTheme(next)
  }, [])

  const setFieldMode = useCallback((enabled: boolean) => {
    setFieldModeState(enabled)
    persistFieldMode(enabled)
  }, [])

  useEffect(() => {
    applyThemeSettings(theme, fieldMode)
  }, [theme, fieldMode])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      fieldMode,
      setFieldMode,
      isDark: theme === 'dark',
    }),
    [theme, setTheme, fieldMode, setFieldMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
