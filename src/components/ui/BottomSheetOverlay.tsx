import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { useOverlayFocus } from '../../hooks/useOverlayFocus'
import { useOverlayLayer } from '../../hooks/useOverlayLayer'
import { trackProps } from '../../utils/tracking'

function getPortalContainer() {
  return (
    document.getElementById('app-overlay-root') ??
    document.querySelector('.app-shell') ??
    document.body
  )
}

type BottomSheetOverlayProps = {
  open: boolean
  onDismiss?: () => void
  children: ReactNode
  sheetClassName?: string
  dismissTrackTag?: string
  labelId?: string
}

export function BottomSheetOverlay({
  open,
  onDismiss,
  children,
  sheetClassName = '',
  dismissTrackTag = 'overlay.dismiss-backdrop',
  labelId,
}: BottomSheetOverlayProps) {
  const dialogRef = useOverlayFocus(open, onDismiss)
  useOverlayLayer(open)

  if (!open) return null

  return createPortal(
    <div
      className="bottom-sheet-backdrop fixed inset-0 z-[100] flex flex-col justify-end bg-black/50"
      role="presentation"
      onClick={onDismiss}
      {...(onDismiss ? trackProps(dismissTrackTag) : {})}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={`bottom-sheet-panel bottom-sheet-panel--fill flex w-full min-h-0 max-h-[92dvh] flex-col rounded-t bg-[var(--color-fleet-surface)] shadow-[0_-4px_24px_rgba(0,0,0,0.18)] ${
          sheetClassName.includes('content-height') ? 'overflow-visible' : 'overflow-hidden'
        } ${sheetClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="mx-auto mt-3 mb-1 h-1 w-10 shrink-0 rounded bg-[var(--color-fleet-secondary-border)]"
          aria-hidden
        />
        <div className="bottom-sheet-content">{children}</div>
      </div>
    </div>,
    getPortalContainer(),
  )
}
