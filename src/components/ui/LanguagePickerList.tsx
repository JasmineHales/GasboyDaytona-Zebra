import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import {
  getAppLanguageEntry,
  languagesForPicker,
  type AppLanguageId,
} from '../../utils/appLanguageCatalog'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import { TextField } from './TextField'

type LanguagePickerListProps = {
  value: AppLanguageId
  onChange: (languageId: AppLanguageId) => void
  trackTag: string
  labelledBy: string
  autoFocusSearch?: boolean
}

export function LanguagePickerList({
  value,
  onChange,
  trackTag,
  labelledBy,
  autoFocusSearch = false,
}: LanguagePickerListProps) {
  const listboxId = useId()
  const { messages } = useI18n()
  const copy = messages.language
  const [query, setQuery] = useState('')
  const selectedRef = useRef<HTMLButtonElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const filteredLanguages = useMemo(
    () => languagesForPicker(query, value),
    [query, value],
  )

  useEffect(() => {
    if (!scrollRef.current || !selectedRef.current) return
    selectedRef.current.scrollIntoView({ block: 'nearest' })
  }, [value, filteredLanguages.length])

  const selectedEntry = getAppLanguageEntry(value)

  return (
    <div className="language-picker-list" aria-labelledby={labelledBy}>
      <TextField
        value={query}
        onChange={setQuery}
        placeholder={copy.searchPlaceholder}
        startIcon={Search}
        onClear={() => setQuery('')}
        clearTrackTag={`${trackTag}.search-clear`}
        autoComplete="off"
        autoFocus={autoFocusSearch}
        role="searchbox"
        aria-controls={listboxId}
      />

      <div
        id={listboxId}
        ref={scrollRef}
        role="listbox"
        aria-label={copy.languageHeading}
        className="language-picker-list__scroll bottom-sheet-scroll app-scroll"
      >
        {filteredLanguages.length === 0 ? (
          <p className="language-picker-list__empty" role="status">
            {copy.searchNoResults.replace('{query}', query.trim())}
          </p>
        ) : (
          filteredLanguages.map((entry) => {
            const active = entry.id === value
            const showSecondary = entry.nativeLabel !== entry.label
            return (
              <button
                key={entry.id}
                ref={active ? selectedRef : undefined}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onChange(entry.id)}
                className={`language-picker-list__row${
                  active ? ' language-picker-list__row--selected' : ''
                }`}
                {...trackProps(trackTag, { value: entry.id })}
              >
                <span className="language-picker-list__row-text">
                  <span className="language-picker-list__row-label">{entry.nativeLabel}</span>
                  {showSecondary ? (
                    <span className="language-picker-list__row-secondary">{entry.label}</span>
                  ) : null}
                </span>
                {active ? (
                  <span className="language-picker-list__row-check" aria-hidden>
                    ✓
                  </span>
                ) : null}
              </button>
            )
          })
        )}
      </div>

      {selectedEntry && query.trim().length === 0 ? (
        <p className="language-picker-list__current fleet-sr-only">
          {copy.selectedLanguage.replace('{language}', selectedEntry.nativeLabel)}
        </p>
      ) : null}
    </div>
  )
}
