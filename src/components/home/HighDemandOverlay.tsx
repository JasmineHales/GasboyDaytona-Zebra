import { useId } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import type { HighDemandVehicleGroup } from '../../utils/homeHighDemandGroups'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { HighDemandRow } from './HighDemandCardParts'

type HighDemandOverlayProps = {
  open: boolean
  onClose: () => void
  groups: HighDemandVehicleGroup[]
}

export function HighDemandOverlay({ open, onClose, groups }: HighDemandOverlayProps) {
  const { messages, t } = useI18n()
  const copy = messages.home.highDemand
  const titleId = useId()

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="home.high-demand.overlay.dismiss"
      labelId={titleId}
      sheetClassName="bottom-sheet-panel--content-height"
    >
      <div className="bottom-sheet-body high-demand-overlay pt-2">
        <div className="high-demand-overlay__header">
          <h2 id={titleId} className="high-demand-overlay__title">
            {copy.cardTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="field-target flex shrink-0 items-center justify-center rounded p-2"
            aria-label={t('common.close')}
            {...trackProps('home.high-demand.overlay.close')}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="high-demand-overlay__subtitle">
          {t('home.highDemand.expandedSubtitle', { count: String(groups.length) })}
        </p>
        <ul className="high-demand-card__rows" aria-label={copy.expandedListLabel}>
          {groups.map((group) => (
            <HighDemandRow key={group.id} group={group} />
          ))}
        </ul>
      </div>
    </BottomSheetOverlay>
  )
}
