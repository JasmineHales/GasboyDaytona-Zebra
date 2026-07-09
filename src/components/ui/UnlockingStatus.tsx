import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import { UnlockFlowStep, type UnlockStepState } from './UnlockOutcomePanel'

const CONFIRMATION_TIMEOUT_MS = 15_000

type UnlockStepProps = {
  label: string
  state: UnlockStepState
  isLast?: boolean
}

function UnlockStep({ label, state, isLast = false }: UnlockStepProps) {
  return <UnlockFlowStep label={label} state={state} isLast={isLast} />
}

function getStepStates(elapsedMs: number): [
  UnlockStepState,
  UnlockStepState,
  UnlockStepState,
] {
  if (elapsedMs < 700) {
    return ['active', 'pending', 'pending']
  }
  if (elapsedMs < 1_400) {
    return ['complete', 'active', 'pending']
  }
  return ['complete', 'complete', 'active']
}

type UnlockingStatusProps = {
  pumpNumber: string
  onCancelUnlock: () => void
}

export function UnlockingStatus({
  pumpNumber,
  onCancelUnlock,
}: UnlockingStatusProps) {
  const { messages, t } = useI18n()
  const copy = messages.fuel.unlockProgress
  const pump = pumpNumber.trim() || '5'
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt)
    }, 250)
    return () => window.clearInterval(id)
  }, [])

  const secondsRemaining = Math.max(
    0,
    Math.ceil((CONFIRMATION_TIMEOUT_MS - elapsedMs) / 1000),
  )
  const [connectedState, requestState, waitingState] = useMemo(
    () => getStepStates(elapsedMs),
    [elapsedMs],
  )

  return (
    <div
      className="fleet-unlock-stepper-panel"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t('fuel.unlockProgress.ariaUnlocking', { pump })}
    >
      <div className="fleet-unlock-flow__header">
        <span className="fleet-unlock-flow__icon-wrap fleet-unlock-flow__icon-wrap--active" aria-hidden>
          <Loader2 className="fleet-unlock-flow__icon fleet-unlock-flow__icon--spin" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="fleet-unlock-stepper-panel__title">
            {t('fuel.unlockProgress.title', { pump })}
          </p>
          {secondsRemaining > 0 && (
            <p className="fleet-unlock-stepper-panel__countdown">
              {t('fuel.unlockProgress.secondsRemaining', {
                seconds: String(secondsRemaining),
              })}
            </p>
          )}
        </div>
      </div>

      <ol className="fleet-unlock-stepper" aria-label={copy.stepsAriaLabel}>
        <UnlockStep label={copy.stepConnected} state={connectedState} />
        <UnlockStep label={copy.stepRequestSent} state={requestState} />
        <UnlockStep label={copy.stepWaiting} state={waitingState} isLast />
      </ol>

      <button
        type="button"
        onClick={onCancelUnlock}
        className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
        {...trackProps('fuel.cancel-unlock')}
      >
        {messages.fuel.cancelUnlock}
      </button>
    </div>
  )
}
