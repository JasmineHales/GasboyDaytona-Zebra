export type ProgressBadgeVariant = 'active' | 'complete' | 'warning' | 'error'

export type ProgressLabelVariant = 'default' | 'complete' | 'warning' | 'error'

/** @deprecated Tones are unified to Hertz black/yellow — kept for call-site compatibility */
export type ProgressTone = 'remote' | 'onsite' | 'manual' | 'info' | 'neutral'

export type ProgressIndicatorProps = {
  step: number
  label: string
  description?: string
  badgeVariant?: ProgressBadgeVariant
  labelVariant?: ProgressLabelVariant
  showProgress?: boolean
  progressPercent?: number
  /** @deprecated Fill color comes from fleet-progress CSS */
  progressFillClass?: string
  totalSteps?: number
  /** @deprecated Use totalSteps — shown in header as (step/total) */
  stepText?: string
  /** @deprecated Visual tone is unified — no longer changes colors */
  tone?: ProgressTone
}

export function ProgressIndicator({
  step,
  label,
  description,
  badgeVariant = 'active',
  labelVariant = 'default',
  showProgress = true,
  progressPercent = 0,
  totalSteps,
}: ProgressIndicatorProps) {
  const fill = Math.min(100, Math.max(0, progressPercent))
  const showStepCount = totalSteps != null

  return (
    <div
      data-accordion-scroll-anchor
      className="fleet-progress"
      role="group"
      aria-label={`Step ${step}${totalSteps ? ` of ${totalSteps}` : ''}: ${label}, ${fill}% complete`}
    >
      <div className="fleet-progress__header">
        <p className={`fleet-progress__label fleet-progress__label--${labelVariant}`}>
          <span>{label}</span>
          {showStepCount && (
            <span className="fleet-progress__step-count">
              ({step}/{totalSteps})
            </span>
          )}
        </p>
        {description && <p className="fleet-progress__description">{description}</p>}
      </div>

      {showProgress && (
        <div
          className="fleet-progress__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={fill}
          aria-label={`${label} progress`}
        >
          <div
            className={`fleet-progress__fill fleet-progress__fill--${badgeVariant}`}
            style={{ width: `${fill}%` }}
          />
        </div>
      )}
    </div>
  )
}
