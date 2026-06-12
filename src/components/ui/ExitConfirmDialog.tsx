import { BottomSheetOverlay } from './BottomSheetOverlay'

type ExitConfirmDialogProps = {
  open: boolean
  onContinue: () => void
  onLeave: () => void
}

export function ExitConfirmDialog({
  open,
  onContinue,
  onLeave,
}: ExitConfirmDialogProps) {
  return (
    <BottomSheetOverlay open={open} onDismiss={onContinue}>
      <div
        className="px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        aria-labelledby="exit-confirm-title"
      >
        <p
          id="exit-confirm-title"
          className="text-left text-lg font-bold text-[var(--color-fleet-text)]"
        >
          Leave this session?
        </p>
        <p className="mt-2 text-left text-sm leading-relaxed text-[var(--color-fleet-text-secondary)]">
          If you leave now, the session timer will restart when you return.
        </p>
        <div className="workflow-stack mt-5">
          <button
            type="button"
            onClick={onContinue}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
          >
            Continue Session
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
          >
            Leave
          </button>
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
