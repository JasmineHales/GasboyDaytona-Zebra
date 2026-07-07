import { ChevronRight, ChevronUp, TrendingUp } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  formatVehicleGroupDisplayName,
  type DemandTier,
  type HighDemandVehicleGroup,
} from '../../utils/homeHighDemandGroups'
import { trackProps } from '../../utils/tracking'

const EXPANDED_STORAGE_KEY = 'high-demand-card-expanded'

export type HighDemandCardProps = {
  groups: HighDemandVehicleGroup[]
  /** Persist expand/collapse between visits. */
  persistExpanded?: boolean
  className?: string
}

function readPersistedExpanded(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(EXPANDED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function DemandDot({
  tier,
  label,
}: {
  tier: DemandTier
  label: string
}) {
  return (
    <span
      className={`high-demand-card__dot high-demand-card__dot--${tier}`}
      role="img"
      aria-label={label}
    />
  )
}

function HighDemandChip({ group }: { group: HighDemandVehicleGroup }) {
  const { t } = useI18n()
  const tierLabel = t(`home.highDemand.tiers.${group.demandTier}`)
  const vehicleGroup = formatVehicleGroupDisplayName(group.vehicleGroup)

  return (
    <span
      className="high-demand-card__chip"
      aria-label={t('home.highDemand.chipTierLabel', {
        vehicleGroup,
        tier: tierLabel,
      })}
    >
      <DemandDot tier={group.demandTier} label={tierLabel} />
      <span className="high-demand-card__chip-name" aria-hidden>
        {vehicleGroup}
      </span>
    </span>
  )
}

function HighDemandRow({ group }: { group: HighDemandVehicleGroup }) {
  const { t } = useI18n()
  const vehicleGroup = formatVehicleGroupDisplayName(group.vehicleGroup)

  return (
    <li className="high-demand-card__row">
      <DemandDot
        tier={group.demandTier}
        label={t(`home.highDemand.tiers.${group.demandTier}`)}
      />
      <span className="high-demand-card__row-name">{vehicleGroup}</span>
      <span
        className={`high-demand-card__row-need high-demand-card__row-need--${group.demandTier}`}
      >
        {t('home.highDemand.needShort', { need: String(group.demandCount) })}
      </span>
    </li>
  )
}

export function HighDemandCard({
  groups,
  persistExpanded = true,
  className,
}: HighDemandCardProps) {
  const { messages } = useI18n()
  const copy = messages.home.highDemand
  const titleId = useId()
  const panelId = useId()

  const [expanded, setExpanded] = useState(() =>
    persistExpanded ? readPersistedExpanded() : false,
  )

  useEffect(() => {
    if (!persistExpanded) return
    try {
      window.localStorage.setItem(EXPANDED_STORAGE_KEY, expanded ? 'true' : 'false')
    } catch {
      /* ignore storage errors */
    }
  }, [expanded, persistExpanded])

  const toggle = () => setExpanded((open) => !open)

  const sectionClass = ['high-demand-card', expanded ? 'high-demand-card--expanded' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={sectionClass}
      aria-labelledby={titleId}
      data-tutorial="high-demand-groups"
      data-expanded={expanded ? 'true' : 'false'}
    >
      <button
        type="button"
        className="high-demand-card__header"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={toggle}
        {...trackProps('home.high-demand.toggle')}
      >
        <TrendingUp className="high-demand-card__trend-icon" aria-hidden />
        <span className="high-demand-card__heading">
          <span id={titleId} className="high-demand-card__title">
            {copy.cardTitle}
          </span>
        </span>
        <span className="high-demand-card__action">
          <span className="high-demand-card__action-label">
            {expanded ? copy.viewLess : copy.viewAll}
          </span>
          {expanded ? (
            <ChevronUp className="high-demand-card__chevron" aria-hidden />
          ) : (
            <ChevronRight className="high-demand-card__chevron" aria-hidden />
          )}
        </span>
      </button>

      <div id={panelId} className="high-demand-card__body">
        {!expanded ? (
          <ul className="high-demand-card__chips" aria-label={copy.collapsedListLabel}>
            {groups.map((group) => (
              <li key={group.id}>
                <HighDemandChip group={group} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="high-demand-card__rows" aria-label={copy.expandedListLabel}>
            {groups.map((group) => (
              <HighDemandRow key={group.id} group={group} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
