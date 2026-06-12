export type ProgressBadgeVariant = 'active' | 'complete' | 'warning' | 'error'

export type ProgressLabelVariant = 'default' | 'complete' | 'warning' | 'error'

export type ProgressTone = 'remote' | 'onsite' | 'manual' | 'info' | 'neutral'

export type ProgressIndicatorProps = {
  step: number
  label: string
  badgeVariant?: ProgressBadgeVariant
  labelVariant?: ProgressLabelVariant
  showProgress?: boolean
  progressPercent?: number
  progressFillClass?: string
  stepText?: string
  tone?: ProgressTone
}

const activeBadgeByTone: Record<ProgressTone, string> = {
  remote:
    'border-2 border-[var(--color-fleet-positive-500)] bg-white text-[var(--color-fleet-text-green)]',
  onsite:
    'border-2 border-[var(--color-fleet-primary-600)] bg-white text-[var(--color-fleet-primary-600)]',
  manual:
    'border-2 border-[var(--color-fleet-secondary-border)] bg-white text-[var(--color-fleet-text-secondary)]',
  info:
    'border-2 border-[var(--color-fleet-info)] bg-white text-[var(--color-fleet-info)]',
  neutral:
    'border-2 border-[var(--color-fleet-primary-600)] bg-white text-[var(--color-fleet-primary-600)]',
}

const badgeStyles: Record<ProgressBadgeVariant, string> = {
  active: activeBadgeByTone.neutral,
  complete: 'bg-[var(--color-fleet-positive-500)] text-white',
  warning:
    'border-2 border-[var(--color-fleet-warning)] bg-white text-[var(--color-fleet-warning)]',
  error:
    'border-2 border-[var(--color-fleet-error-500)] bg-white text-[var(--color-fleet-error-500)]',
}

const labelStyles: Record<ProgressLabelVariant, string> = {
  default: 'font-semibold text-[var(--color-fleet-text)]',
  complete: 'font-semibold text-[var(--color-fleet-text-green)]',
  warning: 'font-semibold text-[var(--color-fleet-warning)]',
  error: 'font-semibold text-[var(--color-fleet-text-red)]',
}

export function ProgressIndicator({
  step,
  label,
  badgeVariant = 'active',
  labelVariant = 'default',
  showProgress = true,
  progressPercent = 0,
  progressFillClass = 'bg-[var(--color-fleet-positive-500)]',
  stepText,
  tone = 'neutral',
}: ProgressIndicatorProps) {
  const fill = Math.min(100, Math.max(0, progressPercent))
  const badgeClass =
    badgeVariant === 'active' ? activeBadgeByTone[tone] : badgeStyles[badgeVariant]
  const usesProgressGreen = tone === 'remote'
  const usesProgressInfo = tone === 'info'
  const trackClass =
    usesProgressGreen
      ? 'bg-[var(--color-fleet-positive-100)]'
      : usesProgressInfo
        ? 'bg-[var(--color-fleet-info-ring)]'
        : tone === 'onsite'
          ? 'bg-[var(--color-fleet-primary-200)]'
          : 'bg-[var(--color-fleet-primary-200)]'
  const fillClass =
    badgeVariant === 'complete' || badgeVariant === 'active'
      ? usesProgressGreen
        ? 'bg-[var(--color-fleet-positive-500)]'
        : usesProgressInfo
          ? 'bg-[var(--color-fleet-info)]'
          : tone === 'onsite'
            ? 'bg-[var(--color-fleet-primary-600)]'
            : progressFillClass
      : progressFillClass
  const labelClass =
    usesProgressGreen && labelVariant === 'default'
      ? 'font-semibold text-[var(--color-fleet-text-green)]'
      : usesProgressInfo && labelVariant === 'default'
        ? 'font-semibold text-[var(--color-fleet-text-blue-secondary)]'
        : labelStyles[labelVariant]

  return (
    <div
      data-accordion-scroll-anchor
      className="workflow-stack rounded-[4px]"
    >
      <div className="flex items-start gap-3 p-0.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tracking-wide ${badgeClass}`}
        >
          {step}
        </div>
        <p className={`pt-0.5 text-base leading-5 ${labelClass}`}>{label}</p>
      </div>

      {showProgress && (
        <>
          <div className={`h-2 w-full overflow-hidden rounded-full ${trackClass}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${fillClass}`}
              style={{ width: `${fill}%` }}
            />
          </div>
          {stepText && (
            <p className="text-sm text-[var(--color-fleet-text-secondary)]">{stepText}</p>
          )}
        </>
      )}
    </div>
  )
}
