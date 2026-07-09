import {
  ArrowUp,
  Car,
  Fuel,
  Search,
  ShieldCheck,
  Star,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCallback, useId, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import type { Messages, TranslateFn } from '../../i18n/types'
import { useTheme } from '../../theme/ThemeProvider'
import {
  challengeProgressPercent,
  getGamificationData,
  sortPerformanceAlerts,
  type GamificationChallenge,
  type PerformanceAlert,
  type PerformanceAlertKind,
  type PerformanceStatus,
  type RecognitionBadgeVariant,
} from '../../utils/gamificationMock'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { trackProps } from '../../utils/tracking'
import {
  PerformanceAlertCard,
  PerformanceAlertStack,
  PerformanceAlertSuccessCard,
  PerformanceAlertSummaryRow,
  type PerformanceAlertTheme,
} from './PerformanceAlertCard'

type HomePerformancePanelProps = {
  operatorName?: string
  site?: string
}

type PerformanceView = 'performance' | 'challenges' | 'recognition'

const RECOGNITION_BADGE_ICONS: Record<RecognitionBadgeVariant, LucideIcon> = {
  fuel: Fuel,
  vehicle: Car,
  quality: ShieldCheck,
  damage: Search,
}

const CHALLENGE_BADGE_ICONS: Record<GamificationChallenge['kind'], LucideIcon> = {
  weekly: Fuel,
  streak: ShieldCheck,
  team: Users,
}

function ChallengeGoalBadge({ kind }: { kind: GamificationChallenge['kind'] }) {
  const Icon = CHALLENGE_BADGE_ICONS[kind]

  return (
    <span
      className={`home-gamification-challenge-badge home-gamification-challenge-badge--${kind}`}
      aria-hidden
    >
      <Icon className="home-gamification-challenge-badge__icon" />
    </span>
  )
}

function RecognitionShield({ variant }: { variant: RecognitionBadgeVariant }) {
  const Icon = RECOGNITION_BADGE_ICONS[variant]

  return (
    <span
      className={`home-gamification-badge__shield home-gamification-badge__shield--${variant}`}
      aria-hidden
    >
      <svg
        className="home-gamification-badge__shield-shape"
        viewBox="0 0 40 44"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <path d="M20 2 L36 8 V22 C36 32 20 42 20 42 C20 42 4 32 4 22 V8 Z" />
      </svg>
      <Icon className="home-gamification-badge__shield-icon" />
    </span>
  )
}

function ProgressBar({
  value,
  max,
  label,
  tone,
}: {
  value: number
  max: number
  label: string
  tone?: GamificationChallenge['kind']
}) {
  const percent = challengeProgressPercent(value, max)
  const fillClass = tone
    ? `home-gamification-progress__fill home-gamification-progress__fill--${tone}`
    : 'home-gamification-progress__fill'

  return (
    <div
      className="home-gamification-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <span className={fillClass} style={{ width: `${percent}%` }} />
    </div>
  )
}

function resolveAlertCopy(
  kind: PerformanceAlertKind,
  count: number,
  alerts: Messages['home']['gamification']['alerts'],
  t: TranslateFn,
): {
  title: string
  incidentsDescription: string
  explanation: string
  recommendation: string[]
} {
  const countStr = String(count)

  switch (kind) {
    case 'fuel_entry_review':
      return {
        title: alerts.fuel_entry_review.title,
        incidentsDescription: t('home.gamification.alerts.fuel_entry_review.incidents', {
          count: countStr,
        }),
        explanation: alerts.fuel_entry_review.explanation,
        recommendation: [...alerts.fuel_entry_review.recommendations],
      }
    case 'missed_inspection':
      return {
        title: alerts.missed_inspection.title,
        incidentsDescription: t('home.gamification.alerts.missed_inspection.incidents', {
          count: countStr,
        }),
        explanation: alerts.missed_inspection.explanation,
        recommendation: [...alerts.missed_inspection.recommendations],
      }
    case 'late_return':
      return {
        title: alerts.late_return.title,
        incidentsDescription: t('home.gamification.alerts.late_return.incidents', {
          count: countStr,
        }),
        explanation: alerts.late_return.explanation,
        recommendation: [...alerts.late_return.recommendations],
      }
  }
}

function NeedsAttentionSection({
  alerts,
  theme,
}: {
  alerts: PerformanceAlert[]
  theme: PerformanceAlertTheme
}) {
  const { messages, t } = useI18n()
  const copy = messages.home.gamification.alerts
  const detailSheetTitleId = useId()
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [showAllAlerts, setShowAllAlerts] = useState(false)

  const handleViewTransactions = useCallback(() => {
    /* Placeholder — routes to affected transactions when wired */
  }, [])

  const buildCardProps = (alert: PerformanceAlert) => {
    const resolved = resolveAlertCopy(alert.kind, alert.count, copy, t)
    return {
      title: resolved.title,
      severity: alert.severity,
      incidents: { count: alert.count, description: resolved.incidentsDescription },
      pointsLost: alert.pointsDeducted,
      explanation: resolved.explanation,
      recommendation: resolved.recommendation,
      actionLabel: copy.viewAffectedTransactions,
      action: handleViewTransactions,
      theme,
    }
  }

  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) ?? null
  const detailOpen = selectedAlertId !== null || showAllAlerts

  const dismissDetail = () => {
    setSelectedAlertId(null)
    setShowAllAlerts(false)
  }

  return (
    <section
      className="home-needs-attention-section"
      aria-labelledby="home-needs-attention-heading"
    >
      <h3 id="home-needs-attention-heading" className="home-needs-attention-section__title">
        {copy.sectionTitle}
      </h3>

      {alerts.length === 0 && <PerformanceAlertSuccessCard theme={theme} />}

      {alerts.length === 1 && (
        <PerformanceAlertCard {...buildCardProps(alerts[0])} />
      )}

      {alerts.length >= 2 && (
        <PerformanceAlertStack
          theme={theme}
          ariaLabel={copy.listLabel}
          footerLabel={copy.viewAll}
          onViewAll={() => setShowAllAlerts(true)}
        >
          {alerts.map((alert) => {
            const resolved = resolveAlertCopy(alert.kind, alert.count, copy, t)
            const pointsLabel = copy.pointsLost.replace('{points}', String(alert.pointsDeducted))

            return (
              <PerformanceAlertSummaryRow
                key={alert.id}
                title={resolved.title}
                severity={alert.severity}
                incidents={{ count: alert.count, description: resolved.incidentsDescription }}
                pointsLost={alert.pointsDeducted}
                onSelect={() => setSelectedAlertId(alert.id)}
                ariaLabel={t('home.gamification.alerts.rowAria', {
                  title: resolved.title,
                  count: String(alert.count),
                  points: pointsLabel,
                })}
              />
            )
          })}
        </PerformanceAlertStack>
      )}

      <BottomSheetOverlay
        open={detailOpen}
        onDismiss={dismissDetail}
        labelId={detailSheetTitleId}
        sheetClassName="content-height"
      >
        <div className="performance-alert-sheet">
          <div className="performance-alert-sheet__header">
            <h3 id={detailSheetTitleId} className="performance-alert-sheet__heading">
              {showAllAlerts && !selectedAlert ? copy.detailSheetTitle : selectedAlert ? resolveAlertCopy(selectedAlert.kind, selectedAlert.count, copy, t).title : copy.detailSheetTitle}
            </h3>
            <button
              type="button"
              onClick={dismissDetail}
              className="performance-alert-sheet__close field-target"
              aria-label={t('common.close')}
              {...trackProps('home.performance.alerts.close')}
            >
              <X className="performance-alert-sheet__close-icon" aria-hidden />
            </button>
          </div>
          {showAllAlerts && !selectedAlert ? (
            <ul className="performance-alert-sheet__list">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <PerformanceAlertCard {...buildCardProps(alert)} />
                </li>
              ))}
            </ul>
          ) : selectedAlert ? (
            <PerformanceAlertCard {...buildCardProps(selectedAlert)} />
          ) : null}
        </div>
      </BottomSheetOverlay>
    </section>
  )
}

export function HomePerformancePanel({
  operatorName = 'Jordan Lee',
  site = 'Daytona',
}: HomePerformancePanelProps) {
  const { messages, t } = useI18n()
  const { isDark } = useTheme()
  const copy = messages.home.gamification
  const alertTheme: PerformanceAlertTheme = isDark ? 'dark' : 'light'
  const [view, setView] = useState<PerformanceView>('performance')

  const data = useMemo(
    () => getGamificationData(operatorName, site),
    [operatorName, site],
  )

  const performanceAlerts = useMemo(
    () => sortPerformanceAlerts(data.alerts),
    [data.alerts],
  )

  const firstName = data.operatorName.trim().split(/\s+/)[0] ?? data.operatorName

  const statusKey: Record<PerformanceStatus, keyof typeof copy.status> = {
    excellent: 'excellent',
    strong: 'strong',
    needs_attention: 'needsAttention',
  }

  const subnavItems: Array<{ id: PerformanceView; label: string }> = [
    { id: 'performance', label: copy.subnav.performance },
    { id: 'challenges', label: copy.subnav.challenges },
    { id: 'recognition', label: copy.subnav.recognition },
  ]

  const statItems = [
    {
      id: 'vehicles',
      label: copy.stats.vehiclesReady,
      value: String(data.metrics.vehiclesReady),
      hint: copy.stats.thisWeek,
    },
    {
      id: 'fuel',
      label: copy.stats.fuelCorrections,
      value: String(data.metrics.fuelCorrections),
      hint: copy.stats.thisWeek,
    },
    {
      id: 'pump',
      label: copy.stats.pumpVerification,
      value: `${data.metrics.pumpVerificationPercent}%`,
      hint: copy.stats.thisWeek,
    },
  ] as const

  return (
    <section
      className="home-tab-panel home-tab-panel--performance"
      aria-labelledby="home-performance-heading"
    >
      <div className="home-gamification-scroll app-scroll">
        <header className="home-gamification-toolbar">
          <h2 id="home-performance-heading" className="home-gamification-toolbar__title">
            {copy.performanceTitle}
          </h2>
          <div
            className="home-gamification-tabs"
            role="tablist"
            aria-label={copy.subnav.label}
          >
            {subnavItems.map((item) => {
              const selected = view === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`home-performance-tab-${item.id}`}
                  className={`home-gamification-tabs__tab${selected ? ' home-gamification-tabs__tab--active' : ''}`}
                  aria-selected={selected}
                  aria-controls={`home-performance-panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setView(item.id)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </header>

        {view === 'performance' && (
          <NeedsAttentionSection alerts={performanceAlerts} theme={alertTheme} />
        )}

        {view === 'performance' && (
          <div
            id="home-performance-panel-performance"
            role="tabpanel"
            aria-labelledby="home-performance-tab-performance"
            className="home-gamification-stack"
          >
            <article className="home-gamification-hero" aria-label={copy.performanceTitle}>
              <div className="home-gamification-hero__badge" aria-hidden>
                <Star className="home-gamification-hero__badge-icon" />
              </div>
              <div className="home-gamification-hero__copy">
                <p className="home-gamification-hero__label">{copy.yourPerformance}</p>
                <p className="home-gamification-hero__status">{copy.status[statusKey[data.status]]}</p>
                <p className="home-gamification-hero__message">
                  {t('home.gamification.greatWork', { name: firstName })}
                </p>
                {data.rankChange > 0 && (
                  <p className="home-gamification-hero__movement">
                    <ArrowUp className="home-gamification-hero__movement-icon" aria-hidden />
                    {t('home.gamification.rankChange', { count: String(data.rankChange) })}
                  </p>
                )}
              </div>
            </article>

            <section className="home-gamification-card" aria-labelledby="home-gamification-stats">
              <h3 id="home-gamification-stats" className="home-gamification-card__label">
                {copy.keyStats}
              </h3>
              <dl className="home-gamification-stats">
                {statItems.map((item) => (
                  <div key={item.id} className="home-gamification-stats__row">
                    <dt className="home-gamification-stats__label">{item.label}</dt>
                    <dd className="home-gamification-stats__value">
                      <span>{item.value}</span>
                      <span className="home-gamification-stats__hint">{item.hint}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <article className="home-gamification-card home-gamification-card--accent">
              <p className="home-gamification-card__label">{copy.nextGoal.title}</p>
              <p className="home-gamification-card__value">
                {t('home.gamification.nextGoal.jobs', {
                  count: String(data.nextGoal.accurateJobsNeeded),
                })}
              </p>
              <p className="home-gamification-card__hint">
                {t('home.gamification.nextGoal.toRank', {
                  rank: String(data.nextGoal.targetRank),
                })}
              </p>
            </article>

          </div>
        )}

        {view === 'challenges' && (
          <div
            id="home-performance-panel-challenges"
            role="tabpanel"
            aria-labelledby="home-performance-tab-challenges"
            className="home-gamification-stack"
          >
            <p className="home-gamification-intro">{copy.challengesIntro}</p>
            {data.challenges.map((challenge) => {
              const remaining = Math.max(0, challenge.target - challenge.current)

              return (
                <article
                  key={challenge.id}
                  className="home-gamification-card home-gamification-card--challenge"
                  aria-label={t('home.gamification.challengeProgressAria', {
                    title: challenge.title,
                    current: String(challenge.current),
                    target: String(challenge.target),
                  })}
                >
                  <ChallengeGoalBadge kind={challenge.kind} />
                  <div className="home-gamification-card__body">
                    <p className="home-gamification-card__label">
                      {copy.challengeKinds[challenge.kind]}
                    </p>
                    <p className="home-gamification-card__value">{challenge.title}</p>
                    <p className="home-gamification-card__hint">{challenge.description}</p>
                    <p className="home-gamification-card__progress-text">
                      {t('home.gamification.challengeProgress', {
                        current: String(challenge.current),
                        target: String(challenge.target),
                      })}
                    </p>
                    <ProgressBar
                      value={challenge.current}
                      max={challenge.target}
                      tone={challenge.kind}
                      label={t('home.gamification.challengeProgressAria', {
                        title: challenge.title,
                        current: String(challenge.current),
                        target: String(challenge.target),
                      })}
                    />
                    {challenge.kind === 'team' && remaining > 0 && (
                      <p className="home-gamification-card__remaining">
                        {t('home.gamification.team.remaining', { count: String(remaining) })}
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {view === 'recognition' && (
          <div
            id="home-performance-panel-recognition"
            role="tabpanel"
            aria-labelledby="home-performance-tab-recognition"
            className="home-gamification-stack"
          >
            <p className="home-gamification-intro">{copy.recognitionIntro}</p>
            <ul className="home-gamification-badges" aria-label={copy.recognitionListLabel}>
              {data.recognition.map((item) => (
                <li key={item.id}>
                  <article
                    className="home-gamification-badge"
                    aria-label={t('home.gamification.recognitionItemAria', {
                      title: item.title,
                      description: item.description,
                      when: item.earnedLabel,
                    })}
                  >
                    <RecognitionShield variant={item.variant} />
                    <div className="home-gamification-badge__body">
                      <p className="home-gamification-badge__title">{item.title}</p>
                      <p className="home-gamification-badge__detail">{item.description}</p>
                      <p className="home-gamification-badge__when">
                        {t('home.gamification.recognitionEarned', { when: item.earnedLabel })}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
