import { useId } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import type { VehicleSummary } from '../../utils/vehicleSummary'
import { trackProps } from '../../utils/tracking'
import { buildVehicleDetailPropsFromSummary } from '../../utils/vehicleDetailDisplay'
import {
  VehicleSearchListCardExpanded,
  VehicleSearchListCardHeader,
} from '../vehicle/VehicleDetailSections'
import { BottomSheetOverlay } from './BottomSheetOverlay'

type VehicleCardDetailsOverlayProps = {
  open: boolean
  summary: VehicleSummary
  holdMessage?: string
  onClose: () => void
}

export function VehicleCardDetailsOverlay({
  open,
  summary,
  holdMessage,
  onClose,
}: VehicleCardDetailsOverlayProps) {
  const titleId = useId()
  const { t } = useI18n()
  const detailProps = buildVehicleDetailPropsFromSummary(summary, {
    holdMessage,
    holdTitle:
      summary.holdWarning?.title ??
      (summary.holdWarning?.code
        ? t('vehicle.holdWarning', { code: summary.holdWarning.code })
        : undefined),
  })

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="vehicle-card.details.dismiss"
      labelId={titleId}
      sheetClassName="bottom-sheet-panel--content-height"
    >
      <div className="vehicle-card-details-overlay vehicle-card-details-overlay--content-height">
        <div className="vehicle-card-details-overlay__header shrink-0 pt-1">
          <div className="flex w-full items-center">
            <h2
              id={titleId}
              className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
            >
              {t('vehicle.detailsOverlayTitle')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="field-target flex shrink-0 items-center justify-center rounded p-2"
              aria-label={t('common.close')}
              {...trackProps('vehicle-card.details.close')}
            >
              <X className="h-6 w-6 text-[var(--color-fleet-text)]" aria-hidden />
            </button>
          </div>
        </div>

        <div className="vehicle-card-details-overlay__scroll app-scroll">
          <article className="vehicle-search-card vehicle-search-card--expanded">
            <div className="vehicle-search-card__header vehicle-search-card__header--static">
              <VehicleSearchListCardHeader {...detailProps} />
              {detailProps.holdWarning ? (
                <span className="vehicle-search-card__hold-badge">
                  {t('vehicleSearch.results.onHoldBadge')}
                </span>
              ) : null}
            </div>
            <VehicleSearchListCardExpanded {...detailProps} />
          </article>
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
