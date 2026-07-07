import { Check, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  filterOperatorSites,
  getOperatorSiteEntry,
  sortOperatorSitesByRecency,
  type OperatorSiteEntry,
} from '../../utils/operatorSiteCatalog'
import { getRecentOperatorSites } from '../../utils/recentOperatorSites'
import { slugifyTrackValue, trackProps } from '../../utils/tracking'
import { TextField } from '../ui/TextField'

type ListView =
  | { kind: 'recent'; entries: OperatorSiteEntry[] }
  | { kind: 'browse'; entries: OperatorSiteEntry[] }
  | { kind: 'search'; entries: OperatorSiteEntry[] }
  | { kind: 'no-results'; query: string }

function SiteResultsList({
  entries,
  selectedSite,
  onSelect,
}: {
  entries: OperatorSiteEntry[]
  selectedSite: string
  onSelect: (site: string) => void
}) {
  return (
    <ul className="flex flex-col">
      {entries.map((entry) => {
        const active = entry.name === selectedSite
        return (
          <li key={entry.id}>
            <button
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelect(entry.name)}
              className={`field-target flex w-full items-center gap-3 border-b border-[var(--color-border-light)] px-4 text-left active:bg-[var(--color-surface-muted)]${
                active ? ' bg-[var(--color-surface-muted)]' : ''
              }`}
              aria-label={`${entry.name}, ${entry.code}`}
              {...trackProps('operator-site.select', {
                value: slugifyTrackValue(entry.name),
              })}
            >
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1 py-3">
                <span className="text-base font-semibold text-[var(--color-text-primary)]">
                  {entry.name}
                </span>
                <span className="operator-site-search__code">{entry.code}</span>
              </span>
              {active ? (
                <Check
                  className="h-5 w-5 shrink-0 text-[var(--color-fleet-info)]"
                  aria-hidden
                />
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

type OperatorSiteSearchPanelProps = {
  selectedSite: string
  onSelectSite: (site: string) => void
  compact?: boolean
  autoFocus?: boolean
  active?: boolean
}

export function OperatorSiteSearchPanel({
  selectedSite,
  onSelectSite,
  autoFocus = false,
  active = true,
}: OperatorSiteSearchPanelProps) {
  const listboxId = useId()
  const { messages } = useI18n()
  const copy = messages.home.location
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!active) {
      setQuery('')
    }
  }, [active])

  const listView = useMemo((): ListView => {
    const trimmed = query.trim().toLowerCase()
    const recentNames = getRecentOperatorSites().filter((name) => Boolean(getOperatorSiteEntry(name)))

    if (!trimmed) {
      const recentEntries = recentNames
        .map((name) => getOperatorSiteEntry(name))
        .filter((entry): entry is OperatorSiteEntry => Boolean(entry))

      if (recentEntries.length > 0) {
        return { kind: 'recent', entries: recentEntries }
      }

      return {
        kind: 'browse',
        entries: sortOperatorSitesByRecency(filterOperatorSites(''), []),
      }
    }

    const matches = filterOperatorSites(query)
    const sorted = sortOperatorSitesByRecency(matches, recentNames)

    if (sorted.length === 0) {
      return { kind: 'no-results', query: query.trim() }
    }

    return { kind: 'search', entries: sorted }
  }, [query])

  return (
    <div className="operator-site-search-panel min-h-0 flex-1">
      <div data-tutorial="location-search">
        <TextField
        value={query}
        onChange={setQuery}
        placeholder={copy.searchPlaceholder}
        startIcon={Search}
        onClear={() => setQuery('')}
        clearTrackTag="operator-site.search-clear"
        autoComplete="off"
        autoFocus={autoFocus && active}
        role="searchbox"
      />
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-label={copy.selectLabel}
        className="operator-site-search-panel__scroll bottom-sheet-scroll app-scroll min-h-0 flex-1"
      >
        {listView.kind === 'no-results' && (
          <div className="location-search-empty">
            <p className="location-search-empty__title">{copy.noResultsTitle}</p>
            <p className="location-search-empty__hint">
              {copy.noResultsHint.replace('{query}', listView.query)}
            </p>
          </div>
        )}

        {listView.kind === 'recent' && (
          <>
            <p className="location-search-section-label px-4">{copy.recentLabel}</p>
            <SiteResultsList
              entries={listView.entries}
              selectedSite={selectedSite}
              onSelect={onSelectSite}
            />
          </>
        )}

        {listView.kind === 'browse' && (
          <>
            <p className="location-search-section-label px-4">{copy.allLocationsLabel}</p>
            <SiteResultsList
              entries={listView.entries}
              selectedSite={selectedSite}
              onSelect={onSelectSite}
            />
          </>
        )}

        {listView.kind === 'search' && (
          <SiteResultsList
            entries={listView.entries}
            selectedSite={selectedSite}
            onSelect={onSelectSite}
          />
        )}
      </div>
    </div>
  )
}
