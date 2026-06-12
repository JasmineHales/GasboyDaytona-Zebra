export type ProgressBadgeVariant = 'active' | 'complete' | 'warning' | 'error'

export type ProgressLabelVariant = 'default' | 'complete' | 'warning' | 'error'

export type ProgressIndicatorProps = {
  step: number
  label: string
  badgeVariant?: ProgressBadgeVariant
  labelVariant?: ProgressLabelVariant
  showProgress?: boolean
  progressPercent?: number
  progressFillClass?: string
  stepText?: string
}

const badgeStyles: Record<ProgressBadgeVariant, string> = {
  active:
    'border-2 border-[var(--color-fleet-primary-600)] bg-white text-[var(--color-fleet-primary-600)]',
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
}: ProgressIndicatorProps) {
  const fill = Math.min(100, Math.max(0, progressPercent))

  return (
    <div
      data-accordion-scroll-anchor
      className="flex flex-col gap-2 rounded-[4px]"
    >
      <div className="flex items-start gap-3 p-0.5">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tracking-wide ${badgeStyles[badgeVariant]}`}
        >
          {step}
        </div>
        <p className={`pt-1 text-sm leading-5 ${labelStyles[labelVariant]}`}>{label}</p>
      </div>

      {showProgress && (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-fleet-primary-200)]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressFillClass}`}
              style={{ width: `${fill}%` }}
            />
          </div>
          {stepText && (
            <p className="text-xs text-[var(--color-fleet-text-secondary)]">{stepText}</p>
          )}
        </>
      )}
    </div>
  )
}
