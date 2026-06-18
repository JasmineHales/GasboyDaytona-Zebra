import type { ReactNode } from 'react'
import { useOverlayFocus } from '../../hooks/useOverlayFocus'

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

  if (!open) return null

  return (
    <div
      ref={containerRef}
      className={`app-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      tabIndex={-1}
    >
      {children}
    </div>
  )
}
