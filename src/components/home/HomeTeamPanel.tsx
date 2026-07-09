import { BarChart3, MapPin, ShieldCheck, Target, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { challengeProgressPercent, getGamificationData } from '../../utils/gamificationMock'

type HomeTeamPanelProps = {
  operatorName?: string
  site?: string
}

export function HomeTeamPanel({
  operatorName = 'Jordan Lee',
  site = 'Daytona',
}: HomeTeamPanelProps) {
  const { messages, t } = useI18n()
  const copy = messages.home.gamification

  const data = useMemo(
    () => getGamificationData(operatorName, site),
    [operatorName, site],
  )

  const team = data.team
  const remaining = Math.max(0, team.weeklyGoal - team.vehiclesReady)
  const goalPercent = challengeProgressPercent(team.vehiclesReady, team.weeklyGoal)

  const cards = [
    {
      id: 'goal',
      icon: Users,
      label: copy.team.goalTitle,
      value: t('home.gamification.team.goalValue', {
        current: String(team.vehiclesReady),
        target: String(team.weeklyGoal),
      }),
      hint:
        remaining > 0
          ? t('home.gamification.team.remaining', { count: String(remaining) })
          : copy.team.goalMet,
      progress: goalPercent,
      progressLabel: copy.team.goalProgressAria,
    },
    {
      id: 'ranking',
      icon: MapPin,
      label: copy.team.rankingTitle,
      value: t('home.gamification.team.rankingValue', {
        rank: String(team.rankInRegion),
        region: team.region,
      }),
      hint: t('home.gamification.team.rankingHint', {
        total: String(team.totalLocations),
      }),
    },
    {
      id: 'quality',
      icon: BarChart3,
      label: copy.team.qualityTitle,
      value: `${team.qualityPercent}%`,
      hint: copy.stats.thisWeek,
    },
    {
      id: 'accuracy',
      icon: ShieldCheck,
      label: copy.team.accuracyTitle,
      value: `${team.accuracyPercent}%`,
      hint: copy.stats.thisWeek,
    },
  ] as const

  return (
    <section className="home-tab-panel home-tab-panel--team" aria-labelledby="home-team-heading">
      <div className="home-gamification-scroll app-scroll">
        <header className="home-gamification-toolbar">
          <h2 id="home-team-heading" className="home-gamification-toolbar__title">
            {t('home.gamification.teamPageTitle', { site: team.siteName })}
          </h2>
          <p className="home-gamification-toolbar__subtitle">{copy.teamPageIntro}</p>
        </header>

        <div className="home-gamification-stack">
          {cards.map((card) => {
            const { id, icon: Icon, label, value, hint } = card
            const progress = 'progress' in card ? card.progress : undefined
            const progressLabel = 'progressLabel' in card ? card.progressLabel : undefined

            return (
              <article key={id} className="home-gamification-card home-gamification-card--row">
                <span className="home-gamification-card__icon-wrap">
                  <Icon className="home-gamification-card__icon" aria-hidden />
                </span>
                <div className="home-gamification-card__body">
                  <p className="home-gamification-card__label">{label}</p>
                  <p className="home-gamification-card__value">{value}</p>
                  <p className="home-gamification-card__hint">{hint}</p>
                  {progress !== undefined && progressLabel && (
                    <div
                      className="home-gamification-progress home-gamification-progress--inline"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-label={progressLabel}
                    >
                      <span
                        className="home-gamification-progress__fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </article>
            )
          })}

          <article className="home-gamification-card home-gamification-card--muted">
            <Target className="home-gamification-card__icon home-gamification-card__icon--inline" aria-hidden />
            <p className="home-gamification-card__hint">{copy.team.collaborationNote}</p>
          </article>
        </div>
      </div>
    </section>
  )
}
