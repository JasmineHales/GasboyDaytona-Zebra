import type { AppLanguageId } from '../../utils/languageSettings'
import type { Messages } from '../types'
import { en } from './en'
import { es, fr } from './es'

export const locales: Record<AppLanguageId, Messages> = {
  en,
  es,
  fr,
}

export { en, es, fr }
