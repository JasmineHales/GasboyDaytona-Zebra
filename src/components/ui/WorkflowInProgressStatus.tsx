import { useEffect, useId, useState } from 'react'
import { ElapsedTimer } from './ElapsedTimer'

export const NOZZLE_PICKUP_WINDOW_SECONDS = 60

export type WorkflowInProgressTone = 'remote' | 'default'

export type WorkflowInProgressStatusProps = {
  pumpNumber: string
  startedAt: number | null
  tone?: WorkflowInProgressTone
  elapsedLabel?: string
  pumpLabel?: string
  showElapsed?: boolean
  nozzlePickupWindowSeconds?: number
}

function useElapsedSeconds(startedAt: number | null): number {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0)
      return
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  return elapsed
}

function NozzlePickupIndicator({
  startedAt,
  windowSeconds,
}: {
  startedAt: number | null
  windowSeconds: number
}) {
  const labelId = useId()
  const elapsed = useElapsedSeconds(startedAt)

  if (!startedAt) return null

  const remaining = Math.max(0, windowSeconds - elapsed)
  const progress = Math.min(100, (elapsed / windowSeconds) * 100)
  const pickupActive = remaining > 0

  return (
    <div
      className={`workflow-in-progress__pickup${pickupActive ? ' workflow-in-progress__pickup--active' : ' workflow-in-progress__pickup--waiting'}`}
      role="status"
      aria-live="polite"
      aria-labelledby={labelId}
    >
      <p className="workflow-in-progress__pickup-label" id={labelId}>
        {pickupActive ? 'Pick up the nozzle' : 'Fueling at pump'}
      </p>
      {pickupActive ? (
        <p className="workflow-in-progress__pickup-time" aria-hidden="true">
          {remaining}s
        </p>
      ) : null}
      <div
        className="workflow-in-progress__pickup-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={windowSeconds}
        aria-valuenow={pickupActive ? elapsed : windowSeconds}
        aria-valuetext={
          pickupActive
            ? `${remaining} seconds remaining to pick up the nozzle`
            : 'Nozzle pickup window complete, waiting for pump data'
        }
      >
        <span
          className={`workflow-in-progress__pickup-bar-fill${pickupActive ? '' : ' workflow-in-progress__pickup-bar-fill--waiting'}`}
          style={pickupActive ? { width: `${progress}%` } : undefined}
        />
      </div>
      <p className="workflow-in-progress__pickup-hint">
        {pickupActive
          ? 'You have 60 seconds to start fueling. Pump data may take a moment to update.'
          : 'Pump data can take a moment to sync.'}
      </p>
    </div>
  )
}

export function WorkflowInProgressStatus({
  pumpNumber,
  startedAt,
  tone = 'default',
  elapsedLabel = 'Elapsed',
  pumpLabel = 'Pump',
  showElapsed = true,
  nozzlePickupWindowSeconds,
}: WorkflowInProgressStatusProps) {
  const pumpLabelId = useId()
  const pumpValueId = useId()
  const elapsedLabelId = useId()

  return (
    <section
      className={`workflow-in-progress workflow-in-progress--${tone}`}
      aria-label={`${pumpLabel} ${pumpNumber}`}
    >
      <div className="workflow-in-progress__metrics">
        <div className="workflow-in-progress__metric">
          <p className="workflow-in-progress__metric-label" id={pumpLabelId}>
            {pumpLabel}
          </p>
          <p
            className="workflow-in-progress__metric-value"
            id={pumpValueId}
            aria-labelledby={pumpLabelId}
          >
            {pumpNumber}
          </p>
        </div>
        {showElapsed && (
          <div className="workflow-in-progress__metric workflow-in-progress__metric--time">
            <p className="workflow-in-progress__metric-label" id={elapsedLabelId}>
              {elapsedLabel}
            </p>
            <ElapsedTimer
              startedAt={startedAt}
              compact
              labelId={elapsedLabelId}
            />
          </div>
        )}
      </div>
      {nozzlePickupWindowSeconds != null && nozzlePickupWindowSeconds > 0 && (
        <NozzlePickupIndicator
          startedAt={startedAt}
          windowSeconds={nozzlePickupWindowSeconds}
        />
      )}
    </section>
  )
}
