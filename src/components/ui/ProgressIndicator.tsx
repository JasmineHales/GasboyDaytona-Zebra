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

export function ProgressIndicator(_props: ProgressIndicatorProps) {
  return null
}
