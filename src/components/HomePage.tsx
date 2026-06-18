import { useEffect, useState } from 'react'
import { useTutorial } from '../hooks/useTutorial'
import {
  HOME_TUTORIAL_STEPS,
  HOME_TUTORIAL_STORAGE_KEY,
} from '../utils/tutorialSteps'
import { HomeWorkflowList } from './home/HomeWorkflowList'
import { Header } from './ui/Header'
import { WorkflowTutorial } from './ui/WorkflowTutorial'

type HomePageProps = {
  forceTutorial?: boolean
  onSelectVsa: () => void
  onSelectTransport: () => void
  onOpenTracking: () => void
  onReportIssue?: () => void
  onSignOut?: () => void
}

export function HomePage({
  forceTutorial = false,
  onSelectVsa,
  onSelectTransport,
  onOpenTracking,
  onReportIssue,
  onSignOut,
}: HomePageProps) {
  const tutorial = useTutorial({
    storageKey: HOME_TUTORIAL_STORAGE_KEY,
    steps: HOME_TUTORIAL_STEPS,
    forceStart: forceTutorial,
  })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!tutorial.active || !tutorial.step) return

    if (tutorial.step.openHeaderMenu) {
      setMenuOpen(true)
      return
    }

    if (tutorial.step.id === 'header-menu') {
      setMenuOpen(false)
    }
  }, [tutorial.active, tutorial.step])

  useEffect(() => {
    if (!tutorial.active) {
      setMenuOpen(false)
    }
  }, [tutorial.active])

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white">
      <Header
        brandLayout
        title="Hertz"
        subtitle="Daytona"
        showBack={false}
        showSessionTimer={false}
        onReportIssue={onReportIssue}
        onSignOut={onSignOut}
        onReplayTutorial={tutorial.start}
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
        elevateHeaderMenu={tutorial.active && Boolean(tutorial.step?.openHeaderMenu)}
        lockHeaderMenu={tutorial.active && Boolean(tutorial.step?.openHeaderMenu)}
      />

      <main
        id="main-content"
        className="app-scroll app-workflow-main flex min-h-0 flex-1 flex-col pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4"
      >
        <h1 className="fleet-sr-only">Hertz workflows</h1>
        <HomeWorkflowList
          onSelectVsa={onSelectVsa}
          onSelectTransport={onSelectTransport}
          onOpenTracking={onOpenTracking}
        />
      </main>

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
