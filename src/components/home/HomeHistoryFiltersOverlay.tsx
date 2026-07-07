import { useId } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  EMPTY_HISTORY_FILTERS,
  HISTORY_DATE_PRESETS,
  HISTORY_WORKFLOW_FILTERS,
  type HistoryDatePreset,
  type HistoryFilters,
  type HistoryWorkflowFilter,
} from '../../utils/homeHistoryFilters'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'

type HomeHistoryFiltersOverlayProps = {
  open: boolean
  filters: HistoryFilters
  onChange: (filters: HistoryFilters) => void
  onClose: () => void
  onApply: () => void
}

function FilterChip({
  label,
  selected,
  onClick,
  trackTag,
  trackValue,
}: {
  label: string
  selected: boolean
  onClick: () => void
  trackTag: string
  trackValue: string
}) {
  return (
    <button
      type="button"
      className={`home-history-filters__chip${selected ? ' home-history-filters__chip--active' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
      {...trackProps(trackTag, { value: trackValue, selected: !selected })}
    >
      {label}
    </button>
  )
}

export function HomeHistoryFiltersOverlay({
  open,
  filters,
  onChange,
  onClose,
  onApply,
}: HomeHistoryFiltersOverlayProps) {
  const titleId = useId()
  const { messages, t } = useI18n()
  const copy = messages.home.history.filters

  const patch = (patch: Partial<HistoryFilters>) => {
    onChange({ ...filters, ...patch })
  }

  const workflowLabel = (filter: HistoryWorkflowFilter) =>
    filter === 'all' ? messages.home.history.filterAll : messages.home.workflows[filter].title

  const dateLabel = (preset: HistoryDatePreset) => {
    switch (preset) {
      case 'all':
        return copy.dateAll
      case 'today':
        return messages.home.history.today
      case 'yesterday':
        return messages.home.history.yesterday
      case 'last7':
        return copy.dateLast7
      case 'last30':
        return copy.dateLast30
    }
  }

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="home.history.filters.dismiss"
      labelId={titleId}
      sheetClassName="bottom-sheet-panel--fill"
    >
      <div className="home-history-filters-overlay">
        <div className="shrink-0 pt-1">
          <div className="flex w-full items-center">
            <h2
              id={titleId}
              className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
            >
              {copy.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="field-target flex shrink-0 items-center justify-center rounded p-2"
              aria-label={t('common.close')}
              {...trackProps('home.history.filters.close')}
            >
              <X className="h-6 w-6 text-[var(--color-fleet-text)]" aria-hidden />
            </button>
          </div>
        </div>

        <div className="home-history-filters-overlay__scroll app-scroll min-h-0 flex-1">
          <div className="home-history-filters-overlay__sections">
            <section className="home-history-filters-overlay__section" aria-label={copy.typeHeading}>
              <h3 className="home-history-filters-overlay__heading">{copy.typeHeading}</h3>
              <div className="home-history-filters-overlay__chips" role="group">
                {HISTORY_WORKFLOW_FILTERS.map((filter) => (
                  <FilterChip
                    key={filter}
                    label={workflowLabel(filter)}
                    selected={filters.workflowType === filter}
                    onClick={() => patch({ workflowType: filter })}
                    trackTag="home.history.filters.type"
                    trackValue={filter}
                  />
                ))}
              </div>
            </section>

            <section className="home-history-filters-overlay__section" aria-label={copy.dateHeading}>
              <h3 className="home-history-filters-overlay__heading">{copy.dateHeading}</h3>
              <div className="home-history-filters-overlay__chips" role="group">
                {HISTORY_DATE_PRESETS.map((preset) => (
                  <FilterChip
                    key={preset}
                    label={dateLabel(preset)}
                    selected={filters.datePreset === preset}
                    onClick={() => patch({ datePreset: preset })}
                    trackTag="home.history.filters.date"
                    trackValue={preset}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="home-history-filters-overlay__footer bottom-sheet-footer workflow-stack shrink-0">
          <button
            type="button"
            onClick={onApply}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            {...trackProps('home.history.filters.apply')}
          >
            {copy.apply}
          </button>
          <button
            type="button"
            onClick={() => onChange(EMPTY_HISTORY_FILTERS)}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps('home.history.filters.clear-all')}
          >
            {copy.clearAll}
          </button>
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
