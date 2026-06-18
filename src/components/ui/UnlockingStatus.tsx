import { Lock } from 'lucide-react'

type UnlockingStatusProps = {
  pumpNumber: string
}

export function UnlockingStatus({ pumpNumber }: UnlockingStatusProps) {
  const label = pumpNumber.trim() || '5'

  return (
    <div
      className="fleet-unlock-status"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Unlocking pump ${label}. This may take a few seconds.`}
    >
      <div className="fleet-unlock-status__visual" aria-hidden="true">
        <span className="fleet-unlock-status__ripple" />
        <span className="fleet-unlock-status__ripple fleet-unlock-status__ripple--delay" />
        <span className="fleet-unlock-status__ring" />
        <Lock className="fleet-unlock-status__icon" strokeWidth={2.25} />
      </div>

      <p className="fleet-unlock-status__title">Unlocking Pump {label}…</p>
      <p className="fleet-unlock-status__hint">This may take a few seconds</p>

      <div className="fleet-unlock-status__bar" aria-hidden="true">
        <span className="fleet-unlock-status__bar-fill" />
      </div>
    </div>
  )
}
