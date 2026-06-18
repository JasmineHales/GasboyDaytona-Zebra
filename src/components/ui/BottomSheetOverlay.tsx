import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { useOverlayFocus } from '../../hooks/useOverlayFocus'
import { trackProps } from '../../utils/tracking'

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

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/50"
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
        className={`flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.18)] ${sheetClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="mx-auto mt-3 mb-1 h-1 w-10 shrink-0 rounded-full bg-[var(--color-fleet-secondary-border)]"
          aria-hidden
        />
        {children}
      </div>
    </div>,
    document.body,
  )
}
