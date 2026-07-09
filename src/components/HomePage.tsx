import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useTutorial } from '../hooks/useTutorial'
import { useI18n } from '../i18n/I18nProvider'
import { readSsoUser, MOCK_SSO_USER } from '../utils/auth'
import { HOME_TUTORIAL_STORAGE_KEY } from '../utils/tutorialSteps'
import { getHomeTutorialSteps } from '../utils/tutorialCopy'
import { HomeBottomNav, type HomeTabId } from './home/HomeBottomNav'
import { HomeHistoryPanel } from './home/HomeHistoryPanel'
import { HomePerformancePanel } from './home/HomePerformancePanel'
import { HomeTeamPanel } from './home/HomeTeamPanel'
import { HomeWorkflowList } from './home/HomeWorkflowList'
import { Header } from './ui/Header'
import { WorkflowTutorial } from './ui/WorkflowTutorial'

type HomePageProps = {
  site: string
  onSiteChange: (site: string) => void
  forceTutorial?: boolean
  onSelectVsa: () => void
  onSelectTransport: () => void
  onSelectFuel: () => void
  onReportIssue?: () => void
  onSignOut?: () => void
}

export function HomePage({
  site,
  onSiteChange,
  forceTutorial = false,
  onSelectVsa,
  onSelectTransport,
  onSelectFuel,
  onReportIssue,
  onSignOut,
}: HomePageProps) {
  const { messages, t } = useI18n()
  const [activeTab, setActiveTab] = useState<HomeTabId>('work')
  const user = useMemo(() => readSsoUser() ?? MOCK_SSO_USER, [])
  const firstName = user.name.trim().split(/\s+/)[0] ?? user.name
  const tutorialSteps = useMemo(
    () => getHomeTutorialSteps(messages.tutorials.home),
    [messages],
  )
  const tutorial = useTutorial({
    storageKey: HOME_TUTORIAL_STORAGE_KEY,
    steps: tutorialSteps,
    forceStart: forceTutorial,
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)

  useLayoutEffect(() => {
    if (!tutorial.active || !tutorial.step) return

    setMenuOpen(Boolean(tutorial.step.openHeaderMenu))
    setLocationOpen(Boolean(tutorial.step.openLocationPicker))
  }, [tutorial.active, tutorial.step])

  useEffect(() => {
    if (!tutorial.active) {
      setMenuOpen(false)
      setLocationOpen(false)
    }
  }, [tutorial.active])

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col app-surface">
      <Header
        brandLayout
        title="Hertz"
        subtitle={t('home.headerContext', { name: firstName, site })}
        brandOperatorName={firstName}
        site={site}
        showLocationButton
        onSiteChange={onSiteChange}
        showBack={false}
        showSessionTimer={false}
        onReportIssue={onReportIssue}
        onSignOut={onSignOut}
        onReplayTutorial={tutorial.start}
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
        locationOpen={locationOpen}
        onLocationOpenChange={setLocationOpen}
        lockHeaderMenu={tutorial.active && Boolean(tutorial.step?.openHeaderMenu)}
        lockLocationPicker={tutorial.active && Boolean(tutorial.step?.openLocationPicker)}
      />

      <main
        id="main-content"
        className={`app-scroll app-workflow-main home-workflow-main home-workflow-main--with-nav home-workflow-main--tab-${activeTab} min-h-0 flex-1`}
      >
        <div className="app-workflow-scroll-body">
          <h1 className="fleet-sr-only">{t('home.srTitle')}</h1>

          {activeTab === 'work' && (
            <HomeWorkflowList
              site={site}
              onSelectVsa={onSelectVsa}
              onSelectTransport={onSelectTransport}
              onSelectFuel={onSelectFuel}
            />
          )}

          {activeTab === 'history' && <HomeHistoryPanel />}
          {activeTab === 'performance' && (
            <HomePerformancePanel
              operatorName={firstName === 'Jordan' ? 'Jordan Lee' : user.name}
              site={site}
            />
          )}
          {activeTab === 'team' && (
            <HomeTeamPanel
              operatorName={firstName === 'Jordan' ? 'Jordan Lee' : user.name}
              site={site}
            />
          )}
        </div>
      </main>

      <HomeBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <WorkflowTutorial
        open={tutorial.active}
        step={tutorial.step}
        stepIndex={tutorial.stepIndex}
        stepCount={tutorial.stepCount}
        isFirst={tutorial.isFirst}
        isLast={tutorial.isLast}
        onNext={tutorial.next}
        onBack={tutorial.back}
        onSkip={tutorial.skip}
        trackPrefix="home.tutorial"
        trackView="home"
      />
    </div>
  )
}
