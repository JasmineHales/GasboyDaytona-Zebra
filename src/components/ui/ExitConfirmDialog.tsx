import { BottomSheetOverlay } from './BottomSheetOverlay'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'

type ExitConfirmMode = 'logout' | 'navigate' | 'complete-fuel' | 'fuel-in-progress'

type ExitConfirmDialogProps = {
  open: boolean
  mode?: ExitConfirmMode
  onContinue: () => void
  onLeave: () => void
  onCompleteFuel?: () => void
}

export function ExitConfirmDialog({
  open,
  mode = 'navigate',
  onContinue,
  onLeave,
  onCompleteFuel,
}: ExitConfirmDialogProps) {
  const { messages } = useI18n()
  const isCompleteFuel = mode === 'complete-fuel'
  const isFuelInProgress = mode === 'fuel-in-progress'
  const text = isCompleteFuel
    ? messages.exit.completeFuel
    : isFuelInProgress
      ? messages.exit.fuelInProgress
      : messages.exit[mode === 'logout' ? 'logout' : 'navigate']

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onContinue}
      dismissTrackTag="exit.dismiss-backdrop"
      labelId="exit-confirm-title"
    >
      <div className="bottom-sheet-body pt-2">
        <h2
          id="exit-confirm-title"
          className="text-left text-lg font-bold text-[var(--color-fleet-text)]"
        >
          {text.title}
        </h2>
        <p className="mt-2 text-left text-[length:var(--text-ui-sm)] leading-relaxed text-[var(--color-fleet-text-secondary)]">
          {text.body}
        </p>
        <div className="bottom-sheet-footer workflow-stack pt-5">
          {isCompleteFuel ? (
            <>
              <button
                type="button"
                onClick={onCompleteFuel}
                className="fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full"
                {...trackProps('exit.complete-fuel.confirm', { mode })}
              >
                {messages.exit.completeFuel.complete}
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
                {...trackProps('exit.complete-fuel.continue', { mode })}
              >
                {text.continue}
              </button>
            </>
          ) : isFuelInProgress ? (
            <button
              type="button"
              onClick={onContinue}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
              {...trackProps('exit.fuel-in-progress.continue', { mode })}
            >
              {text.continue}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onContinue}
                className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
                {...trackProps('exit.continue', { mode })}
              >
                {text.continue}
              </button>
              <button
                type="button"
                onClick={onLeave}
                className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
                {...trackProps(mode === 'logout' ? 'exit.logout' : 'exit.leave', { mode })}
              >
                {mode === 'logout' ? messages.exit.logout.leave : messages.exit.navigate.leave}
              </button>
            </>
          )}
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
