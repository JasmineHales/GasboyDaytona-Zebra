import type { TranslatedLanguageId } from '../../utils/languageSettings'
import type { Messages } from '../types'
import { en } from './en'
import { es, fr } from './es'

const translatedLocales: Record<TranslatedLanguageId, Messages> = {
  en,
  es,
  fr,
}

export function messagesForLanguage(language: TranslatedLanguageId): Messages {
  return translatedLocales[language] ?? en
}

export { en, es, fr }
