import { ChevronLeft, Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { FullScreenOverlay } from '../ui/FullScreenOverlay'
import { StatusBar } from '../ui/StatusBar'
import { TextField } from '../ui/TextField'
import {
  getRecentLocations,
  recordRecentLocation,
  sortLocationsByRecency,
} from '../../utils/recentLocations'
import { slugifyTrackValue, trackProps } from '../../utils/tracking'

const LOCATIONS = [
  'Albany AP QTA',
  'Boston Logan QTA',
  'Chicago O\'Hare QTA',
  'Dallas Fort Worth QTA',
  'Denver AP QTA',
  'Los Angeles AP QTA',
  'Miami AP QTA',
  'Newark AP QTA',
]

type LocationSearchOverlayProps = {
  open?: boolean
  onClose: () => void
  onSelect: (location: string) => void
}

type ListView =
  | { kind: 'recent'; locations: string[] }
  | { kind: 'idle' }
  | { kind: 'search'; locations: string[] }
  | { kind: 'no-results'; query: string }

function LocationResultsList({
  locations,
  onSelect,
}: {
  locations: string[]
  onSelect: (location: string) => void
}) {
  return (
    <ul className="flex flex-col">
      {locations.map((location) => (
        <li key={location}>
          <button
            type="button"
            onClick={() => onSelect(location)}
            className="field-target flex w-full items-center border-b border-[var(--color-border-light)] px-4 text-left active:bg-[var(--color-surface-muted)]"
            {...trackProps('movement.location.select', {
              location: slugifyTrackValue(location),
            })}
          >
            <span className="w-full text-base text-left text-[var(--color-text-primary)]">
              {location}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function LocationSearchOverlay({
  open = true,
  onClose,
  onSelect,
}: LocationSearchOverlayProps) {
  const titleId = useId()
  const [query, setQuery] = useState('')
  const { messages, t } = useI18n()
  const locationCopy = messages.home.location
  const searchCopy = messages.movement.locationSearch

  const listView = useMemo((): ListView => {
    const trimmed = query.trim().toLowerCase()
    const recent = getRecentLocations().filter((location) => LOCATIONS.includes(location))

    if (!trimmed) {
      if (recent.length > 0) {
        return { kind: 'recent', locations: recent }
      }
      return { kind: 'idle' }
    }

    const matches = LOCATIONS.filter((location) =>
      location.toLowerCase().includes(trimmed),
    )
    const sorted = sortLocationsByRecency(matches, recent)

    if (sorted.length === 0) {
      return { kind: 'no-results', query: query.trim() }
    }

    return { kind: 'search', locations: sorted }
  }, [query])

  const handleSelect = (location: string) => {
    recordRecentLocation(location)
    onSelect(location)
  }

  return (
    <FullScreenOverlay open={open} onDismiss={onClose} labelId={titleId}>
      <StatusBar />
      <div className="flex items-center gap-2 border-b border-[var(--color-border-light)] px-2 py-2">
        <button
          type="button"
          onClick={onClose}
          className="field-target flex shrink-0 items-center justify-center rounded"
          aria-label={searchCopy.closeSearch}
          {...trackProps('movement.location.search-close')}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 id={titleId} className="text-base font-semibold">
          {locationCopy.selectLabel}
        </h2>
      </div>

      <div className="px-4 py-4">
        <TextField
          value={query}
          onChange={setQuery}
          placeholder={locationCopy.searchPlaceholder}
          startIcon={Search}
          onClear={() => setQuery('')}
          clearTrackTag="movement.location.search-clear"
          autoComplete="off"
          autoFocus
          role="searchbox"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {listView.kind === 'no-results' && (
          <div className="location-search-empty">
            <p className="location-search-empty__title">{locationCopy.noResultsTitle}</p>
            <p className="location-search-empty__hint">
              {t('home.location.noResultsHint', { query: listView.query })}
            </p>
          </div>
        )}

        {listView.kind === 'recent' && (
          <>
            <p className="location-search-section-label">{locationCopy.recentLabel}</p>
            <LocationResultsList locations={listView.locations} onSelect={handleSelect} />
          </>
        )}

        {listView.kind === 'idle' && (
          <p className="location-search-empty__hint px-1" role="status">
            {searchCopy.idleHint}
          </p>
        )}

        {listView.kind === 'search' && (
          <LocationResultsList locations={listView.locations} onSelect={handleSelect} />
        )}
      </div>
    </FullScreenOverlay>
  )
}
