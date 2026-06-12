import { CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'

type PumpConfirmedCardProps = {
  title: string
  subtitle: string
  actionLabel: string
  onAction: () => void
  actionIcon?: ReactNode
}

export function PumpConfirmedCard({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
}: PumpConfirmedCardProps) {
  return (
    <div className="pump-confirmed-card">
      <div className="pump-confirmed-card__row">
        <CheckCircle2 className="pump-confirmed-card__icon" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="pump-confirmed-card__title">{title}</p>
          <p className="pump-confirmed-card__subtitle">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
      >
        {actionIcon}
        {actionLabel}
      </button>
    </div>
  )
}
