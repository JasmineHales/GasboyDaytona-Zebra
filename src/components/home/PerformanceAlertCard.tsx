import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n/I18nProvider'

export type PerformanceAlertSeverity = 'warning' | 'info'

export type PerformanceAlertTheme = 'light' | 'dark'

export type PerformanceAlertCardProps = {
  title: string
  severity: PerformanceAlertSeverity
  incidents: { count: number; description: string }
  pointsLost: number
  explanation: string
  recommendation: string | string[]
  actionLabel?: string
  action?: () => void
  theme?: PerformanceAlertTheme
  className?: string
}

export type PerformanceAlertSummaryRowProps = {
  title: string
  severity: PerformanceAlertSeverity
  incidents: { count: number; description: string }
  pointsLost: number
  onSelect: () => void
  ariaLabel: string
}

export type PerformanceAlertSuccessProps = {
  theme?: PerformanceAlertTheme
  className?: string
}

function SeverityIcon({
  severity,
  className,
}: {
  severity: PerformanceAlertSeverity
  className?: string
}) {
  if (severity === 'warning') {
    return <AlertTriangle className={className} aria-hidden />
  }
  return <AlertTriangle className={className} aria-hidden />
}

function formatPoints(pointsLost: number, pointsLabel: string): string {
  return pointsLabel.replace('{points}', String(pointsLost))
}

export function PerformanceAlertCard({
  title,
  severity,
  incidents,
  pointsLost,
  explanation,
  recommendation,
  actionLabel,
  action,
  theme,
  className,
}: PerformanceAlertCardProps) {
  const { messages } = useI18n()
  const copy = messages.home.gamification.alerts
  const recommendations = Array.isArray(recommendation) ? recommendation : [recommendation]
  const pointsText = formatPoints(pointsLost, copy.pointsLost)

  const rootClass = ['performance-alert-card', className].filter(Boolean).join(' ')

  return (
    <article
      className={rootClass}
      {...(theme ? { 'data-theme': theme } : {})}
      role="article"
      aria-label={`${title}. ${incidents.description}. ${pointsText}`}
    >
      <header className="performance-alert-card__header">
        <div className="performance-alert-card__title-row">
          <SeverityIcon severity={severity} className="performance-alert-card__icon" />
          <h4 className="performance-alert-card__title">{title}</h4>
        </div>
        <p className="performance-alert-card__points" aria-label={pointsText}>
          {pointsText}
        </p>
      </header>

      <p className="performance-alert-card__incidents">{incidents.description}</p>

      <div className="performance-alert-card__section">
        <p className="performance-alert-card__section-label">{copy.whyThisMatters}</p>
        <p className="performance-alert-card__section-body">{explanation}</p>
      </div>

      <div className="performance-alert-card__section">
        <p className="performance-alert-card__section-label">{copy.whatToDo}</p>
        <ul className="performance-alert-card__recommendations">
          {recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {actionLabel && action && (
        <button type="button" className="performance-alert-card__action" onClick={action}>
          {actionLabel}
          <ArrowRight className="performance-alert-card__action-icon" aria-hidden />
        </button>
      )}
    </article>
  )
}

export function PerformanceAlertSummaryRow({
  title,
  severity,
  incidents,
  pointsLost,
  onSelect,
  ariaLabel,
}: PerformanceAlertSummaryRowProps) {
  const { messages } = useI18n()
  const copy = messages.home.gamification.alerts
  const pointsText = formatPoints(pointsLost, copy.pointsLost)

  return (
    <button
      type="button"
      className="performance-alert-stack__row"
      onClick={onSelect}
      aria-label={ariaLabel}
    >
      <SeverityIcon severity={severity} className="performance-alert-stack__row-icon" />
      <span className="performance-alert-stack__row-copy">
        <span className="performance-alert-stack__row-title">
          {title}
          <span className="performance-alert-stack__row-meta">
            {copy.incidentCount.replace('{count}', String(incidents.count))}
          </span>
        </span>
      </span>
      <span className="performance-alert-stack__row-points" aria-hidden>
        {pointsText}
      </span>
      <ChevronRight className="performance-alert-stack__row-chevron" aria-hidden />
    </button>
  )
}

export function PerformanceAlertStack({
  children,
  footerLabel,
  onViewAll,
  theme,
  className,
  ariaLabel,
}: {
  children: ReactNode
  footerLabel: string
  onViewAll: () => void
  theme?: PerformanceAlertTheme
  className?: string
  ariaLabel: string
}) {
  const rootClass = ['performance-alert-stack', className].filter(Boolean).join(' ')

  return (
    <div
      className={rootClass}
      {...(theme ? { 'data-theme': theme } : {})}
      role="group"
      aria-label={ariaLabel}
    >
      {children}
      <button type="button" className="performance-alert-stack__footer" onClick={onViewAll}>
        {footerLabel}
      </button>
    </div>
  )
}

export function PerformanceAlertSuccessCard({ theme, className }: PerformanceAlertSuccessProps) {
  const { messages } = useI18n()
  const copy = messages.home.gamification.alerts.empty
  const rootClass = ['performance-alert-success', className].filter(Boolean).join(' ')

  return (
    <article
      className={rootClass}
      {...(theme ? { 'data-theme': theme } : {})}
      role="status"
      aria-live="polite"
      aria-label={`${copy.title}. ${copy.message}`}
    >
      <div className="performance-alert-success__header">
        <CheckCircle2 className="performance-alert-success__icon" aria-hidden />
        <h4 className="performance-alert-success__title">{copy.title}</h4>
      </div>
      <p className="performance-alert-success__message">{copy.message}</p>
      <p className="performance-alert-success__encouragement">{copy.encouragement}</p>
    </article>
  )
}
