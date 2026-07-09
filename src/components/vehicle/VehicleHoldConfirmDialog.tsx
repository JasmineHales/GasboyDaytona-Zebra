import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { useI18n } from '../../i18n/I18nProvider'
import type { VehicleSearchHoldWarning } from '../../utils/vehicleSearchResultDisplay'
import { trackProps } from '../../utils/tracking'

type VehicleHoldConfirmDialogProps = {
  open: boolean
  holdWarning: VehicleSearchHoldWarning
  onContinue: () => void
  onCancel: () => void
}

export function VehicleHoldConfirmDialog({
  open,
  holdWarning,
  onContinue,
  onCancel,
}: VehicleHoldConfirmDialogProps) {
  const { messages, t } = useI18n()
  const copy = messages.vehicleSearch.holdConfirm
  const resultsCopy = messages.vehicleSearch.results

  const holdTitle =
    holdWarning.title ??
    (holdWarning.code
      ? t('vehicle.holdWarning', { code: holdWarning.code })
      : null)

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onCancel}
      dismissTrackTag="vehicle-search.hold-confirm.dismiss"
      labelId="vehicle-hold-confirm-title"
    >
      <div className="bottom-sheet-body pt-2">
        <h2
          id="vehicle-hold-confirm-title"
          className="text-left text-lg font-bold text-[var(--color-fleet-text)]"
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-left text-[length:var(--text-ui-sm)] leading-relaxed text-[var(--color-fleet-text-secondary)]">
          {copy.body}
        </p>
        <div className="vehicle-search-card__hold-panel mt-4" role="alert">
          <p className="vehicle-search-card__hold-heading">{resultsCopy.holdWarningHeading}</p>
          {holdTitle ? (
            <p className="vehicle-search-card__hold-title">{holdTitle}</p>
          ) : null}
          {holdWarning.message ? (
            <p className="vehicle-search-card__hold-message">{holdWarning.message}</p>
          ) : null}
        </div>
        <div className="bottom-sheet-footer workflow-stack pt-5">
          <button
            type="button"
            onClick={onContinue}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-brand fleet-btn-elevated w-full"
            {...trackProps('vehicle-search.hold-confirm.continue', {
              code: holdWarning.code || 'none',
            })}
          >
            {copy.continue}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps('vehicle-search.hold-confirm.cancel')}
          >
            {copy.cancel}
          </button>
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
