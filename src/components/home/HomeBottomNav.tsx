import { ClipboardList, History, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'

export type HomeTabId = 'work' | 'history' | 'performance' | 'team'

type HomeBottomNavProps = {
  activeTab: HomeTabId
  onTabChange: (tab: HomeTabId) => void
}

const TABS: Array<{
  id: HomeTabId
  icon: LucideIcon
  labelKey: 'home.nav.work' | 'home.nav.history' | 'home.nav.performance' | 'home.nav.team'
}> = [
  { id: 'work', icon: ClipboardList, labelKey: 'home.nav.work' },
  { id: 'history', icon: History, labelKey: 'home.nav.history' },
  { id: 'performance', icon: TrendingUp, labelKey: 'home.nav.performance' },
  { id: 'team', icon: Users, labelKey: 'home.nav.team' },
]

export function HomeBottomNav({ activeTab, onTabChange }: HomeBottomNavProps) {
  const { t } = useI18n()

  return (
    <nav className="home-bottom-nav home-bottom-nav--four" aria-label={t('home.nav.label')}>
      {TABS.map(({ id, icon: Icon, labelKey }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`home-bottom-nav__item${active ? ' home-bottom-nav__item--active' : ''}`}
            aria-current={active ? 'page' : undefined}
            {...trackProps(`home.nav.${id}`, { active })}
          >
            <Icon className="home-bottom-nav__icon" aria-hidden />
            <span className="home-bottom-nav__label">{t(labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
