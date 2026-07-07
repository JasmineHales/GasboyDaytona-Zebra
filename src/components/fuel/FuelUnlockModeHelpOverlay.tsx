import { useId } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'

type FuelUnlockModeHelpOverlayProps = {
  open: boolean
  onClose: () => void
  trackPrefix?: string
}

export function FuelUnlockModeHelpOverlay({
  open,
  onClose,
  trackPrefix = 'fuel.unlock-mode',
}: FuelUnlockModeHelpOverlayProps) {
  const titleId = useId()
  const { messages, t } = useI18n()
  const copy = messages.fuel.unlockMode

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag={`${trackPrefix}.info.dismiss`}
      labelId={titleId}
    >
      <div className="bottom-sheet-body pt-2">
        <h2
          id={titleId}
          className="text-left text-lg font-bold text-[var(--color-fleet-text)]"
        >
          {copy.overlayTitle}
        </h2>

        <div className="fuel-unlock-mode-help mt-4">
          <section className="fuel-unlock-mode-help__section">
            <h3 className="fuel-unlock-mode-help__heading">{copy.remote.label}</h3>
            <p className="fuel-unlock-mode-help__text">{copy.remote.text}</p>
          </section>
          <section className="fuel-unlock-mode-help__section">
            <h3 className="fuel-unlock-mode-help__heading">{copy.onSite.label}</h3>
            <p className="fuel-unlock-mode-help__text">{copy.onSite.text}</p>
          </section>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="bottom-sheet-footer fleet-btn fleet-btn-lg fleet-btn-contained-info mt-5 w-full"
          {...trackProps(`${trackPrefix}.info.done`)}
        >
          {t('common.done')}
        </button>
      </div>
    </BottomSheetOverlay>
  )
}
