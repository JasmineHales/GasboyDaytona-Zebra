import { useSessionElapsed } from '../../hooks/useSessionElapsed'

const SESSION_START_KEY = 'remote-off-session-start'

export function resetSessionTimer() {
  sessionStorage.removeItem(SESSION_START_KEY)
}

type SessionTimerProps = {
  /** Inline in header — demoted supporting info. */
  compact?: boolean
  /** Prominent timer in workflow status banner. */
  variant?: 'default' | 'compact' | 'banner'
  /** Override default "Session Timer" label. */
  label?: string
  className?: string
}

export function SessionTimer({
  compact = false,
  variant = compact ? 'compact' : 'default',
  label,
  className,
}: SessionTimerProps) {
  const display = useSessionElapsed()
  const timerLabel = label ?? 'Session Timer'

  if (variant === 'banner') {
    return (
      <div className="session-timer--banner" aria-label={`Session timer ${display}`}>
        <span className="session-timer--banner__label">Session timer</span>
        <span className="session-timer--banner__value" aria-hidden="true">
          {display}
        </span>
      </div>
    )
  }

  if (variant === 'compact' || compact) {
    return (
      <div className="session-timer session-timer--inline" aria-label={`Elapsed ${display}`}>
        <span className="session-timer__label">Elapsed</span>
        <span className="session-timer__value" aria-hidden="true">
          {display}
        </span>
      </div>
    )
  }

  const [hours, minutes, seconds] = display.split(':')

  return (
    <div
      className={`session-timer session-timer--workflow${className ? ` ${className}` : ''}`}
      aria-label={`${timerLabel} ${display}`}
    >
      <span className="session-timer__label">{timerLabel}</span>
      <span className="session-timer__value" aria-hidden="true">
        <span>{hours}</span>
        <span>:</span>
        <span>{minutes}</span>
        <span>:</span>
        <span>{seconds}</span>
      </span>
    </div>
  )
}
