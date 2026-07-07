import { useMemo, useState } from 'react'
import { ChevronDown, Filter, Search } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import {
  formatHistoryItemTime,
  groupHistoryByDate,
} from '../../utils/homeHistoryFormat'
import {
  countActiveHistoryFilters,
  EMPTY_HISTORY_FILTERS,
  matchesHistoryDatePreset,
  type HistoryFilters,
} from '../../utils/homeHistoryFilters'
import { HOME_HISTORY_MOCK_ITEMS } from '../../utils/homeHistoryMock'
import { TextField } from '../ui/TextField'
import { HomeHistoryFiltersOverlay } from './HomeHistoryFiltersOverlay'

type HistoryDetail = {
  labelKey:
    | 'task'
    | 'unit'
    | 'status'
    | 'location'
    | 'odometer'
    | 'duration'
    | 'vin'
    | 'licensePlate'
  value: string
}

export type HistoryItem = {
  id: string
  workflowKey: 'transport' | 'vsa' | 'fuel'
  unitId: string
  vehicle: string
  vin: string
  licensePlate: string
  completedAt: string
  gamificationContext?: 'recognition' | 'challenge' | 'focusImproved' | 'fuelCorrection'
  details: HistoryDetail[]
}

function matchesHistoryQuery(
  item: HistoryItem,
  workflowTitle: string,
  status: string,
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [
    item.vehicle,
    item.unitId,
    item.vin,
    item.licensePlate,
    workflowTitle,
    status,
    ...item.details.map((detail) => detail.value),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalized)
}

export function HomeHistoryPanel() {
  const { language, messages, t } = useI18n()
  const copy = messages.home.history
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<HistoryFilters>(EMPTY_HISTORY_FILTERS)
  const [draftFilters, setDraftFilters] = useState<HistoryFilters>(EMPTY_HISTORY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const detailLabels: Record<HistoryDetail['labelKey'], string> = {
    task: copy.detailTask,
    unit: copy.detailUnit,
    status: copy.detailStatus,
    location: copy.detailLocation,
    odometer: copy.detailOdometer,
    duration: copy.detailDuration,
    vin: copy.detailVin,
    licensePlate: copy.detailLicensePlate,
  }

  const totalCount = HOME_HISTORY_MOCK_ITEMS.length
  const activeFilterCount = countActiveHistoryFilters(filters)

  const filteredItems = useMemo(() => {
    return HOME_HISTORY_MOCK_ITEMS.filter((item) => {
      if (filters.workflowType !== 'all' && item.workflowKey !== filters.workflowType) {
        return false
      }
      if (!matchesHistoryDatePreset(item.completedAt, filters.datePreset)) return false

      const workflow = messages.home.workflows[item.workflowKey]
      return matchesHistoryQuery(item, workflow.title, copy.statusComplete, query)
    })
  }, [copy.statusComplete, filters, messages.home.workflows, query])

  const groupedItems = useMemo(() => {
    return groupHistoryByDate(filteredItems, language, {
      today: copy.today,
      yesterday: copy.yesterday,
    })
  }, [copy.today, copy.yesterday, filteredItems, language])

  const countLabel =
    filteredItems.length === totalCount &&
    !query.trim() &&
    activeFilterCount === 0
      ? t('home.history.totalWorkCount', { count: String(totalCount) })
      : t('home.history.filteredWorkCount', {
          shown: String(filteredItems.length),
          total: String(totalCount),
        })

  const openFilters = () => {
    setDraftFilters(filters)
    setFiltersOpen(true)
  }

  const applyFilters = () => {
    setFilters(draftFilters)
    setFiltersOpen(false)
  }

  return (
    <section className="home-tab-panel home-tab-panel--history" aria-labelledby="home-history-title">
      <div className="home-history-toolbar">
        <div className="home-history-toolbar__heading">
          <div>
            <h2 id="home-history-title" className="home-history-toolbar__title">
              {copy.title}
            </h2>
            <p className="home-tab-panel__subtitle">{copy.subtitle}</p>
          </div>
          <p className="home-history-toolbar__count">{countLabel}</p>
        </div>
        <div className="home-history-toolbar__search-row">
          <TextField
            className="home-history-toolbar__search"
            value={query}
            onChange={setQuery}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchAria}
            startIcon={Search}
            onClear={() => setQuery('')}
            clearTrackTag="home.history.search.clear"
            autoComplete="off"
          />
          <button
            type="button"
            className="home-history-filter-btn"
            onClick={openFilters}
            aria-label={
              activeFilterCount > 0
                ? t('home.history.filters.openWithCount', { count: String(activeFilterCount) })
                : copy.filters.open
            }
            {...trackProps('home.history.filters.open')}
          >
            <Filter className="home-history-filter-btn__icon" aria-hidden />
            {activeFilterCount > 0 ? (
              <span className="home-history-filter-btn__count">{activeFilterCount}</span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="home-history-scroll app-scroll">
        {filteredItems.length === 0 ? (
          <p className="home-history-empty" role="status">
            {copy.noResults}
          </p>
        ) : (
          <div className="home-history-groups">
            {groupedItems.map((group) => (
            <section key={group.key} className="home-history-group" aria-label={group.label}>
              <h3 className="home-history-group__label">{group.label}</h3>
              <ul className="home-history-list">
                {group.items.map((item) => {
                  const workflow = messages.home.workflows[item.workflowKey]
                  const when = formatHistoryItemTime(item.completedAt, language, {
                    today: copy.today,
                    yesterday: copy.yesterday,
                    hoursAgo: (hours) => t('home.history.hoursAgo', { hours: String(hours) }),
                    minutesAgo: (minutes) =>
                      t('home.history.minutesAgo', { minutes: String(minutes) }),
                  })
                  const expanded = expandedId === item.id
                  const details: HistoryDetail[] = [
                    { labelKey: 'licensePlate', value: item.licensePlate },
                    { labelKey: 'vin', value: item.vin },
                    ...item.details.map((detail) => ({
                      ...detail,
                      value:
                        detail.labelKey === 'task'
                          ? workflow.title
                          : detail.labelKey === 'status'
                            ? copy.statusComplete
                            : detail.value,
                    })),
                  ]

                  return (
                    <li
                      key={item.id}
                      className={`home-history-list__item${expanded ? ' home-history-list__item--expanded' : ''}`}
                    >
                      <button
                        type="button"
                        className="home-history-list__summary"
                        aria-expanded={expanded}
                        aria-controls={`home-history-details-${item.id}`}
                        onClick={() => setExpandedId(expanded ? null : item.id)}
                        {...trackProps('home.history.expand', { id: item.id, expanded: !expanded })}
                      >
                        <div className="home-history-list__body">
                          <span
                            className={`home-history-list__workflow-chip home-history-list__workflow-chip--${item.workflowKey}`}
                          >
                            {workflow.title}
                          </span>
                          <p className="home-history-list__vehicle-id">
                            <span className="home-history-list__plate">{item.licensePlate}</span>
                            <span className="home-history-list__separator" aria-hidden>
                              ·
                            </span>
                            <span className="home-history-list__vin">{item.vin}</span>
                          </p>
                          <p className="home-history-list__vehicle">
                            {item.vehicle}
                            <span className="home-history-list__unit"> · {item.unitId}</span>
                          </p>
                          {item.gamificationContext && (
                            <p className="home-history-list__context">
                              {copy.gamificationContext[item.gamificationContext]}
                            </p>
                          )}
                        </div>
                        <div className="home-history-list__aside">
                          <span className="home-history-list__time">{when}</span>
                          <ChevronDown
                            className={`home-history-list__chevron${expanded ? ' home-history-list__chevron--open' : ''}`}
                            aria-hidden
                          />
                        </div>
                      </button>

                      {expanded && (
                        <div
                          id={`home-history-details-${item.id}`}
                          className="home-history-list__details"
                        >
                          <dl className="home-history-list__detail-grid">
                            {details.map((detail) => (
                              <div
                                key={detail.labelKey}
                                className="home-history-list__detail-row"
                              >
                                <dt>{detailLabels[detail.labelKey]}</dt>
                                <dd>{detail.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
        )}
      </div>

      <HomeHistoryFiltersOverlay
        open={filtersOpen}
        filters={draftFilters}
        onChange={setDraftFilters}
        onClose={() => setFiltersOpen(false)}
        onApply={applyFilters}
      />
    </section>
  )
}
