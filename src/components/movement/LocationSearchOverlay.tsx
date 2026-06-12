import { ChevronLeft, MapPin, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBar } from '../ui/StatusBar'

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
  onClose: () => void
  onSelect: (location: string) => void
}

export function LocationSearchOverlay({ onClose, onSelect }: LocationSearchOverlayProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return LOCATIONS
    return LOCATIONS.filter((location) => location.toLowerCase().includes(trimmed))
  }, [query])

  return (
    <div className="app-overlay bg-white">
      <StatusBar />
      <div className="flex items-center gap-2 border-b border-[var(--color-border-light)] px-2 py-2">
        <button
          type="button"
          onClick={onClose}
          className="flex h-14 w-14 items-center justify-center rounded-full"
          aria-label="Close search"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <p className="text-base font-semibold">Select Location</p>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-2 rounded border border-[var(--color-border)] px-3 py-3 focus-within:border-[var(--color-brand-primary)]">
          <Search className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            role="searchbox"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search locations..."
            autoComplete="off"
            autoFocus
            className="flex-1 bg-transparent text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="field-target flex shrink-0 items-center justify-center"
              aria-label="Clear search"
            >
              <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {results.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
            No locations found
          </p>
        ) : (
          <ul className="flex flex-col">
            {results.map((location) => (
              <li key={location}>
                <button
                  type="button"
                  onClick={() => onSelect(location)}
                  className="flex w-full items-center gap-3 border-b border-[var(--color-border-light)] py-4 text-left hover:bg-[var(--color-surface-muted)]"
                >
                  <MapPin className="h-6 w-6 shrink-0 text-[var(--color-text-secondary)]" />
                  <span className="text-base text-[var(--color-text-primary)]">{location}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
