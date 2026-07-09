import { ChevronRight, TrendingUp } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import type { HighDemandVehicleGroup } from '../../utils/homeHighDemandGroups'
import { trackProps } from '../../utils/tracking'
import { HighDemandChip } from './HighDemandCardParts'
import { HighDemandOverlay } from './HighDemandOverlay'

export type HighDemandCardProps = {
  groups: HighDemandVehicleGroup[]
  className?: string
}

export function HighDemandCard({ groups, className }: HighDemandCardProps) {
  const { messages } = useI18n()
  const copy = messages.home.highDemand
  const titleId = useId()
  const marqueeId = useId()
  const [overlayOpen, setOverlayOpen] = useState(false)

  const marqueeGroups = useMemo(
    () => (groups.length > 1 ? [...groups, ...groups] : groups),
    [groups],
  )
  const shouldAnimate = groups.length > 1

  const sectionClass = ['high-demand-card', 'high-demand-card--banner', className]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <section
        className={sectionClass}
        aria-labelledby={titleId}
        data-tutorial="high-demand-groups"
      >
        <div className="high-demand-card__header">
          <TrendingUp className="high-demand-card__trend-icon" aria-hidden />
          <h2 id={titleId} className="high-demand-card__title">
            {copy.cardTitle}
          </h2>
          <button
            type="button"
            className="high-demand-card__view-all"
            onClick={() => setOverlayOpen(true)}
            aria-haspopup="dialog"
            {...trackProps('home.high-demand.view-all')}
          >
            <span className="high-demand-card__action-label">{copy.viewAll}</span>
            <ChevronRight className="high-demand-card__chevron" aria-hidden />
          </button>
        </div>

        <div
          id={marqueeId}
          className={`high-demand-card__marquee${shouldAnimate ? ' high-demand-card__marquee--animated' : ''}`}
          aria-label={copy.collapsedListLabel}
        >
          <div className="high-demand-card__marquee-track">
            {marqueeGroups.map((group, index) => (
              <HighDemandChip key={`${group.id}-${index}`} group={group} />
            ))}
          </div>
        </div>
      </section>

      <HighDemandOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        groups={groups}
      />
    </>
  )
}
