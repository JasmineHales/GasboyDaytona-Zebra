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
  persistAppLanguage,
  readAppLanguage,
  type AppLanguageId,
} from '../utils/languageSettings'
import { getNestedValue, interpolate } from './interpolate'
import { locales } from './locales'
import type { Messages, TranslateFn, TranslateParams } from './types'

type I18nContextValue = {
  language: AppLanguageId
  messages: Messages
  t: TranslateFn
  setLanguage: (language: AppLanguageId) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

function createTranslator(messages: Messages): TranslateFn {
  return (path, params) => {
    const value = getNestedValue(messages, path)
    if (typeof value === 'string') {
      return interpolate(value, params)
    }
    return path
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguageId>(() => readAppLanguage())

  const messages = locales[language] ?? locales.en

  const setLanguage = useCallback((next: AppLanguageId) => {
    setLanguageState(next)
    persistAppLanguage(next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = useMemo(() => createTranslator(messages), [messages])

  const value = useMemo(
    () => ({
      language,
      messages,
      t,
      setLanguage,
    }),
    [language, messages, t, setLanguage],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export function useTranslate(): TranslateFn {
  return useI18n().t
}

export type { Messages, TranslateFn, TranslateParams }
