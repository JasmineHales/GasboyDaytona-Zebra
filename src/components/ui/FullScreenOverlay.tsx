import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { useOverlayFocus } from '../../hooks/useOverlayFocus'
import { useOverlayLayer } from '../../hooks/useOverlayLayer'

function getPortalContainer() {
  return (
    document.getElementById('app-overlay-root') ??
    document.querySelector('.app-shell') ??
    document.body
  )
}

type FullScreenOverlayProps = {
  open: boolean
  onDismiss: () => void
  labelId: string
  children: ReactNode
  className?: string
}

export function FullScreenOverlay({
  open,
  onDismiss,
  labelId,
  children,
  className = 'bg-white',
}: FullScreenOverlayProps) {
  const containerRef = useOverlayFocus(open, onDismiss)
  useOverlayLayer(open)

  if (!open) return null

  return createPortal(
    <div
      ref={containerRef}
      className={`app-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      tabIndex={-1}
    >
      {children}
    </div>,
    getPortalContainer(),
  )
}
