import { BottomSheetOverlay } from './BottomSheetOverlay'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'

type ExitConfirmMode = 'logout' | 'navigate'

type ExitConfirmDialogProps = {
  open: boolean
  mode?: ExitConfirmMode
  onContinue: () => void
  onLeave: () => void
}

export function ExitConfirmDialog({
  open,
  mode = 'navigate',
  onContinue,
  onLeave,
}: ExitConfirmDialogProps) {
  const { messages } = useI18n()
  const text = messages.exit[mode]

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onContinue}
      dismissTrackTag="exit.dismiss-backdrop"
      labelId="exit-confirm-title"
    >
      <div className="px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <h2
          id="exit-confirm-title"
          className="text-left text-lg font-bold text-[var(--color-fleet-text)]"
        >
          {text.title}
        </h2>
        <p className="mt-2 text-left text-[length:var(--text-ui-sm)] leading-relaxed text-[var(--color-fleet-text-secondary)]">
          {text.body}
        </p>
        <div className="workflow-stack mt-5">
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
            {text.leave}
          </button>
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
