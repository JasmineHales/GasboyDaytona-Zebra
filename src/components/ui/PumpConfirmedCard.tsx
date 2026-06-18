import { CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { trackProps } from '../../utils/tracking'

type PumpConfirmedCardProps = {
  title: string
  subtitle: string
  actionLabel: string
  onAction: () => void
  actionIcon?: ReactNode
  trackAction?: string
}

export function PumpConfirmedCard({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  trackAction = 'pump.confirmed.action',
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
        {...trackProps(trackAction)}
      >
        {actionIcon}
        {actionLabel}
      </button>
    </div>
  )
}
