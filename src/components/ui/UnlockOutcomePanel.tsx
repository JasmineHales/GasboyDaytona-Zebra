import type { ReactNode } from 'react'
import { AlertTriangle, Check, Circle, Loader2, X } from 'lucide-react'
import { trackProps } from '../../utils/tracking'
import { useI18n } from '../../i18n/I18nProvider'

export type UnlockStepState =
  | 'pending'
  | 'active'
  | 'complete'
  | 'warning'
  | 'error'

type UnlockFlowStepProps = {
  label: string
  state: UnlockStepState
  isLast?: boolean
}

export function UnlockFlowStep({ label, state, isLast = false }: UnlockFlowStepProps) {
  const { t } = useI18n()

  const icon =
    state === 'complete' ? (
      <Check className="fleet-unlock-stepper__glyph" aria-hidden />
    ) : state === 'active' ? (
      <Loader2 className="fleet-unlock-stepper__glyph fleet-unlock-stepper__glyph--spin" aria-hidden />
    ) : state === 'warning' ? (
      <AlertTriangle className="fleet-unlock-stepper__glyph" aria-hidden />
    ) : state === 'error' ? (
      <X className="fleet-unlock-stepper__glyph" aria-hidden />
    ) : (
      <Circle className="fleet-unlock-stepper__glyph fleet-unlock-stepper__glyph--pending" aria-hidden />
    )

  const srLabel =
    state === 'complete'
      ? t('common.unlockStepCompleted', { label })
      : state === 'active'
        ? t('common.unlockStepInProgress', { label })
        : state === 'error'
          ? t('common.unlockStepFailed', { label })
          : state === 'warning'
            ? `${label}, warning.`
            : t('common.unlockStepPending', { label })

  return (
    <li className="fleet-unlock-stepper__step">
      <div className="fleet-unlock-stepper__track" aria-hidden={!isLast}>
        <span className={`fleet-unlock-stepper__icon fleet-unlock-stepper__icon--${state}`}>
          {icon}
        </span>
        {!isLast && <span className="fleet-unlock-stepper__connector" />}
      </div>
      <p className="fleet-unlock-stepper__label">
        <span className="fleet-sr-only">{srLabel}</span>
        <span aria-hidden>{label}</span>
      </p>
    </li>
  )
}

export type UnlockOutcomeAction = {
  label: string
  onClick: () => void
  trackTag: string
  icon?: ReactNode
  disabled?: boolean
}

type UnlockOutcomePanelProps = {
  title: string
  message?: string
  steps: { label: string; state: UnlockStepState }[]
  primaryAction: UnlockOutcomeAction
  secondaryAction?: UnlockOutcomeAction
  ariaLabel?: string
  headerTone?: 'warning' | 'error'
  children?: ReactNode
  footer?: ReactNode
}

export function UnlockOutcomePanel({
  title,
  message,
  steps,
  primaryAction,
  secondaryAction,
  ariaLabel,
  headerTone,
  children,
  footer,
}: UnlockOutcomePanelProps) {
  const { messages } = useI18n()
  const stepsLabel = messages.fuel.unlockProgress.stepsAriaLabel
  const HeaderIcon = headerTone === 'error' ? X : AlertTriangle

  return (
    <div
      className="fleet-unlock-outcome"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? (message ? `${title}. ${message}` : title)}
    >
      {headerTone ? (
        <div className="fleet-unlock-flow__header">
          <span
            className={`fleet-unlock-flow__icon-wrap fleet-unlock-flow__icon-wrap--${headerTone}`}
            aria-hidden
          >
            <HeaderIcon className="fleet-unlock-flow__icon" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="fleet-unlock-stepper-panel__title">{title}</p>
            {message ? (
              <p className="fleet-unlock-stepper-panel__hint">{message}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <p className="fleet-unlock-stepper-panel__title">{title}</p>
          {message ? (
            <p className="fleet-unlock-stepper-panel__hint">{message}</p>
          ) : null}
        </>
      )}

      <ol className="fleet-unlock-stepper" aria-label={stepsLabel}>
        {steps.map((step, index) => (
          <UnlockFlowStep
            key={step.label}
            label={step.label}
            state={step.state}
            isLast={index === steps.length - 1}
          />
        ))}
      </ol>

      {children}

      <div className="workflow-stack">
        <button
          type="button"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
          {...trackProps(primaryAction.trackTag)}
        >
          {primaryAction.icon}
          {primaryAction.label}
        </button>
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps(secondaryAction.trackTag)}
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </button>
        )}
      </div>

      {footer}
    </div>
  )
}
