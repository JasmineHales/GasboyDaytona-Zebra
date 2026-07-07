/** ISO 639-1 language codes supported for user preference selection. */
export const ISO639_1_LANGUAGE_CODES = [
  'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az',
  'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs',
  'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy',
  'da', 'de', 'dv', 'dz',
  'ee', 'el', 'en', 'eo', 'es', 'et', 'eu',
  'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy',
  'ga', 'gd', 'gl', 'gn', 'gu', 'gv',
  'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz',
  'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu',
  'ja', 'jv',
  'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky',
  'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv',
  'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my',
  'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny',
  'oc', 'oj', 'om', 'or', 'os',
  'pa', 'pi', 'pl', 'ps', 'pt',
  'qu',
  'rm', 'rn', 'ro', 'ru', 'rw',
  'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw',
  'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty',
  'ug', 'uk', 'ur', 'uz',
  've', 'vi', 'vo',
  'wa', 'wo',
  'xh',
  'yi', 'yo',
  'za', 'zh', 'zu',
] as const

export type AppLanguageId = (typeof ISO639_1_LANGUAGE_CODES)[number]

export type AppLanguage = {
  id: AppLanguageId
  label: string
  nativeLabel: string
}

/** Most common languages shown before the user searches. Order reflects global use. */
export const COMMON_LANGUAGE_IDS = [
  'en',
  'zh',
  'hi',
  'es',
  'fr',
  'ar',
  'bn',
  'pt',
  'ru',
  'ur',
  'id',
  'de',
  'ja',
  'sw',
  'mr',
  'te',
  'tr',
  'ta',
  'vi',
  'it',
] as const satisfies readonly AppLanguageId[]

const englishDisplayNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'language' })
    : null

function nativeLabelFor(code: AppLanguageId, fallback: string): string {
  if (typeof Intl === 'undefined' || !('DisplayNames' in Intl)) return fallback
  try {
    return new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? fallback
  } catch {
    return fallback
  }
}

function buildCatalog(): AppLanguage[] {
  const entries: AppLanguage[] = []

  for (const id of ISO639_1_LANGUAGE_CODES) {
    const label = englishDisplayNames?.of(id)
    if (!label) continue
    entries.push({
      id,
      label,
      nativeLabel: nativeLabelFor(id, label),
    })
  }

  return entries.sort((left, right) => left.label.localeCompare(right.label, 'en'))
}

let cachedCatalog: AppLanguage[] | null = null
let cachedCommonLanguages: AppLanguage[] | null = null

export function getAppLanguageCatalog(): AppLanguage[] {
  if (!cachedCatalog) {
    cachedCatalog = buildCatalog()
  }
  return cachedCatalog
}

export function getCommonAppLanguages(): AppLanguage[] {
  if (!cachedCommonLanguages) {
    const catalogById = new Map(getAppLanguageCatalog().map((entry) => [entry.id, entry]))
    cachedCommonLanguages = COMMON_LANGUAGE_IDS.flatMap((id) => {
      const entry = catalogById.get(id)
      return entry ? [entry] : []
    })
  }
  return cachedCommonLanguages
}

export function isAppLanguageId(value: string): value is AppLanguageId {
  return ISO639_1_LANGUAGE_CODES.includes(value as AppLanguageId)
}

export function getAppLanguageEntry(id: AppLanguageId): AppLanguage | undefined {
  return getAppLanguageCatalog().find((entry) => entry.id === id)
}

export function filterAppLanguages(catalog: AppLanguage[], query: string): AppLanguage[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return catalog

  return catalog.filter(
    (entry) =>
      entry.id.includes(trimmed) ||
      entry.label.toLowerCase().includes(trimmed) ||
      entry.nativeLabel.toLowerCase().includes(trimmed),
  )
}

export function languagesForPicker(
  query: string,
  selectedId: AppLanguageId,
): AppLanguage[] {
  const trimmed = query.trim()
  if (trimmed) {
    return filterAppLanguages(getAppLanguageCatalog(), query)
  }

  const common = getCommonAppLanguages()
  if (common.some((entry) => entry.id === selectedId)) {
    return common
  }

  const selected = getAppLanguageEntry(selectedId)
  return selected ? [selected, ...common] : common
}
