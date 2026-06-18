import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, Trash2 } from 'lucide-react'
import { useTutorial } from '../hooks/useTutorial'
import {
  TRACKING_TUTORIAL,
} from '../utils/tutorialSteps'
import { Header } from './ui/Header'
import { WorkflowTutorial } from './ui/WorkflowTutorial'
import {
  clearClickLog,
  getClickLog,
  subscribeClickLog,
  trackProps,
  type TrackEvent,
} from '../utils/tracking'

type TrackingPageProps = {
  forceTutorial?: boolean
  onBack: () => void
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatMetadata(metadata?: Record<string, string>) {
  if (!metadata) return ''
  return Object.entries(metadata)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')
}

function useClickLog() {
  const [events, setEvents] = useState(getClickLog)

  useEffect(() => {
    setEvents(getClickLog())
    return subscribeClickLog(() => setEvents(getClickLog()))
  }, [])

  return events
}

function TagSummary({ events }: { events: TrackEvent[] }) {
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const event of events) {
      map.set(event.tag, (map.get(event.tag) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [events])

  if (counts.length === 0) return null

  return (
    <section className="tracking-panel shrink-0">
      <h2 className="tracking-panel__title">Top tags</h2>
      <ul className="tracking-tag-list">
        {counts.slice(0, 8).map(([tag, count]) => (
          <li key={tag} className="tracking-tag-list__item">
            <span className="tracking-tag-list__tag">{tag}</span>
            <span className="tracking-tag-list__count">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function TrackingPage({ forceTutorial = false, onBack }: TrackingPageProps) {
  const events = useClickLog()
  const [query, setQuery] = useState('')
  const tutorial = useTutorial({
    storageKey: TRACKING_TUTORIAL.storageKey,
    steps: TRACKING_TUTORIAL.steps,
    forceStart: forceTutorial,
  })

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    const list = [...events].reverse()
    if (!trimmed) return list
    return list.filter((event) => {
      const haystack = [
        event.tag,
        event.view,
        event.screen,
        formatMetadata(event.metadata),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(trimmed)
    })
  }, [events, query])

  const handleClear = () => {
    clearClickLog()
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `click-log-${Date.now()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white">
      <Header
        title="Click Tracking"
        subtitle={`${events.length} event${events.length === 1 ? '' : 's'} this session`}
        onBack={onBack}
        showSessionTimer={false}
        onReplayTutorial={tutorial.start}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-4 sm:px-6">
        <div className="tracking-toolbar shrink-0" data-tutorial="tracking-filter">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by tag, view, or screen…"
            className="tracking-search"
            aria-label="Filter click events"
          />
          <div className="tracking-toolbar__actions" data-tutorial="tracking-actions">
            <button
              type="button"
              onClick={handleExport}
              disabled={events.length === 0}
              className="fleet-btn fleet-btn-outlined tracking-toolbar__btn"
              {...trackProps('tracking.export')}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={events.length === 0}
              className="fleet-btn fleet-btn-outlined tracking-toolbar__btn"
              {...trackProps('tracking.clear')}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <div data-tutorial="tracking-tags">
          <TagSummary events={events} />
        </div>

        <section
          className="tracking-panel tracking-panel--grow"
          data-tutorial="tracking-log"
        >
          <div className="tracking-panel__header">
            <h2 className="tracking-panel__title">
              <BarChart3 className="h-4 w-4" aria-hidden />
              Event log
            </h2>
            <span className="tracking-panel__meta">
              {filtered.length} shown
            </span>
          </div>

          <div className="tracking-panel__body app-scroll">
            {filtered.length === 0 ? (
              <div className="tracking-empty">
                <p className="tracking-empty__title">No clicks recorded yet</p>
                <p className="tracking-empty__text">
                  Go back, tap buttons in the app, then return here — events update
                  live.
                </p>
              </div>
            ) : (
              <ul className="tracking-event-list">
                {filtered.map((event, index) => (
                  <li
                    key={`${event.timestamp}-${event.tag}-${index}`}
                    className="tracking-event"
                  >
                    <div className="tracking-event__row">
                      <time className="tracking-event__time">
                        {formatTime(event.timestamp)}
                      </time>
                      <span className="tracking-event__tag">{event.tag}</span>
                    </div>
                    {(event.view || event.screen || event.metadata) && (
                      <p className="tracking-event__meta">
                        {[
                          event.view,
                          event.screen,
                          formatMetadata(event.metadata),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <WorkflowTutorial
        open={tutorial.active}
        step={tutorial.step}
        stepIndex={tutorial.stepIndex}
        stepCount={tutorial.stepCount}
        isFirst={tutorial.isFirst}
        isLast={tutorial.isLast}
        onNext={tutorial.next}
        onBack={tutorial.back}
        onSkip={tutorial.skip}
        trackPrefix={TRACKING_TUTORIAL.trackPrefix}
        trackView="tracking"
      />
    </div>
  )
}
