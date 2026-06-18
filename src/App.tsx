import { useState, useEffect } from 'react'
import { FlowNavigator } from './components/FlowNavigator'
import { BrowserHomePage } from './components/BrowserHomePage'
import { BrowserLoginScreen } from './components/BrowserLoginScreen'
import { LoginScreen } from './components/LoginScreen'
import {
  clearAllTutorialCompletions,
  clearPendingTutorialForceParam,
  consumeTutorialForceParam,
  shouldForceTutorial,
  type TutorialForceTarget,
} from './utils/tutorialSteps'
import { HomePage } from './components/HomePage'
import { TransportScreen } from './components/TransportScreen'
import { TrackingPage } from './components/TrackingPage'
import { VsaScreen } from './components/VsaScreen'
import { IssueOverlay } from './components/fuel/IssueOverlay'
import { TRANSPORT_VEHICLE, VSA_VEHICLE } from './utils/vehicleSummary'
import {
  clearAuth,
  MOCK_SSO_USER,
  persistAuth,
  readAuthenticated,
  readSsoUser,
  type SsoUser,
} from './utils/auth'
import { useClickTracking } from './hooks/useClickTracking'
import { useFlow } from './hooks/useFlow'
import { getRuntimeMode } from './utils/runtime'
import {
  clearPersistedWorkflow,
  loadPersistedWorkflow,
  savePersistedWorkflow,
} from './utils/workflowPersistence'
import {
  resolveActivePageKey,
  resolveActiveWidgetKey,
  type AppView,
  type PageNavItem,
  type WidgetStateItem,
  type WorkflowView,
} from './utils/flowNavigation'

type LoginPreview = 'device' | 'browser' | null

function shouldForceLoginScreen() {
  return new URLSearchParams(window.location.search).has('login')
}

function initialView(force: TutorialForceTarget | null): AppView {
  if (force === 'transport') return 'transport'
  if (force === 'vsa') return 'vsa'
  if (force === 'tracking') return 'tracking'
  const saved = loadPersistedWorkflow()
  if (saved?.activeView) return saved.activeView
  return 'home'
}

export default function App() {
  const [runtimeMode] = useState(() => getRuntimeMode())
  const isHertzDevice = runtimeMode === 'hertz-device'
  const [tutorialForce] = useState(() => {
    const force = consumeTutorialForceParam()
    if (force === 'all') {
      clearAllTutorialCompletions()
    }
    return force
  })
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !shouldForceLoginScreen() && readAuthenticated(),
  )
  const [loginPreview, setLoginPreview] = useState<LoginPreview>(null)
  const [ssoUser, setSsoUser] = useState<SsoUser | null>(() => readSsoUser())
  const [view, setView] = useState<AppView>(() => initialView(tutorialForce))
  const [activeWidgetKey, setActiveWidgetKey] = useState<string | null>(null)
  useClickTracking()
  const {
    context,
    goToScreen,
    applyWidgetState,
    handleAction,
    handleMovementAction,
    handleStallAction,
    handleCleaningAction,
  } = useFlow()

  const showLogin = !isAuthenticated || loginPreview != null
  const loginVariant =
    loginPreview ?? (isHertzDevice ? 'device' : 'browser')
  const workflowView: WorkflowView | null =
    !showLogin && view === 'transport'
      ? 'transport'
      : !showLogin && view === 'vsa'
        ? 'vsa'
        : null

  useEffect(() => {
    if (tutorialForce === 'transport') {
      applyWidgetState('transport-default')
      setActiveWidgetKey('transport:default')
      setView('transport')
    }
    if (tutorialForce === 'vsa') {
      applyWidgetState('stall-default')
      setActiveWidgetKey('vsa:default')
      setView('vsa')
    }
  }, [tutorialForce, applyWidgetState])

  useEffect(() => {
    if (!tutorialForce) return
    clearPendingTutorialForceParam()
  }, [tutorialForce])

  useEffect(() => {
    if (view === 'transport' || view === 'vsa') {
      savePersistedWorkflow({ activeView: view })
      return
    }
    if (view === 'home') {
      savePersistedWorkflow({ activeView: null })
    }
  }, [view])

  useEffect(() => {
    if (!isAuthenticated || isHertzDevice) return
    if (!readSsoUser()) {
      clearAuth()
      setIsAuthenticated(false)
      setSsoUser(null)
    }
  }, [isAuthenticated, isHertzDevice])

  const ensureDevAuth = (variant: 'device' | 'browser' = isHertzDevice ? 'device' : 'browser') => {
    if (isAuthenticated) return
    if (variant === 'device') {
      persistAuth('device')
      setIsAuthenticated(true)
      return
    }
    persistAuth('browser-sso', MOCK_SSO_USER)
    setSsoUser(MOCK_SSO_USER)
    setIsAuthenticated(true)
  }

  const handleDeviceSignIn = () => {
    persistAuth('device')
    setIsAuthenticated(true)
    setLoginPreview(null)
  }

  const handleBrowserSignIn = (user: SsoUser) => {
    persistAuth('browser-sso', user)
    setSsoUser(user)
    setIsAuthenticated(true)
    setLoginPreview(null)
  }

  const handleSignOut = () => {
    clearAuth()
    clearPersistedWorkflow()
    setIsAuthenticated(false)
    setSsoUser(null)
    setLoginPreview(null)
    setView('home')
    setActiveWidgetKey(null)
  }

  const enterWorkflow = (workflow: WorkflowView) => {
    if (workflow === 'transport') {
      goToScreen('transport-default')
      setActiveWidgetKey('transport:default')
    } else if (workflow === 'vsa') {
      goToScreen('stall-default')
      setActiveWidgetKey('vsa:default')
    }
    setView(workflow)
  }

  const handlePageSelect = (item: PageNavItem) => {
    if (item.view === 'login') {
      setIsAuthenticated(false)
      setLoginPreview(item.loginVariant ?? 'device')
      return
    }

    setLoginPreview(null)
    ensureDevAuth(item.loginVariant ?? (isHertzDevice ? 'device' : 'browser'))

    if (item.view === 'home' || item.view === 'tracking' || item.view === 'transport' || item.view === 'vsa') {
      if (item.view === 'transport') {
        goToScreen('transport-default')
        setActiveWidgetKey('transport:default')
      } else if (item.view === 'vsa') {
        goToScreen('stall-default')
        setActiveWidgetKey('vsa:default')
      }
      setView(item.view)
    }
  }

  const handleWidgetSelect = (item: WidgetStateItem) => {
    setActiveWidgetKey(item.key)
    applyWidgetState(item.screen)
  }

  const handleFlowAction = (action: string, payload?: string) => {
    if (action === 'workflow-finish') {
      handleAction('complete', payload)
      clearPersistedWorkflow()
      goToScreen(payload === 'vsa' ? 'stall-default' : 'transport-default')
      setActiveWidgetKey(payload === 'vsa' ? 'vsa:default' : 'transport:default')
      setView('home')
      return
    }
    if (action === 'back') {
      clearPersistedWorkflow()
      setView('home')
      setActiveWidgetKey(null)
      return
    }
    if (action === 'complete') {
      handleAction(action, payload)
      return
    }
    handleAction(action, payload)
  }

  const activePageKey = resolveActivePageKey({
    view,
    showLogin,
    loginPreview,
    runtimeMode,
  })

  const resolvedWidgetKey =
    activeWidgetKey ??
    (workflowView ? resolveActiveWidgetKey(workflowView, context.screen) : null)

  const browserUser = ssoUser ?? readSsoUser()

  return (
    <div className="app-viewport flex h-dvh min-h-0" data-runtime={runtimeMode}>
      <a href="#main-content" className="fleet-sr-only">
        Skip to main content
      </a>
      <FlowNavigator
        activePageKey={activePageKey}
        activeWidgetKey={resolvedWidgetKey}
        workflowView={workflowView}
        onSelectPage={handlePageSelect}
        onSelectWidget={handleWidgetSelect}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-hertz-page)] p-0 sm:p-3 md:p-4 lg:p-6">
        <div
          className="app-shell relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white sm:max-w-xl sm:rounded-xl sm:shadow-lg md:max-w-2xl md:rounded-2xl lg:max-w-3xl xl:max-w-4xl"
          data-current-view={showLogin ? 'login' : view}
          data-current-screen={context.screen}
        >
          {showLogin && (
            <>
              {loginVariant === 'device' ? (
                <LoginScreen onSignIn={handleDeviceSignIn} />
              ) : (
                <BrowserLoginScreen onSignIn={handleBrowserSignIn} />
              )}
            </>
          )}
          {!showLogin && view === 'home' && isHertzDevice && (
            <HomePage
              forceTutorial={shouldForceTutorial(tutorialForce, 'home')}
              onSelectVsa={() => enterWorkflow('vsa')}
              onSelectTransport={() => enterWorkflow('transport')}
              onReportIssue={() => handleAction('report-issue')}
              onSignOut={handleSignOut}
              onOpenTracking={() => setView('tracking')}
            />
          )}
          {!showLogin && view === 'home' && !isHertzDevice && browserUser && (
            <BrowserHomePage
              user={browserUser}
              forceTutorial={shouldForceTutorial(tutorialForce, 'home')}
              onSelectVsa={() => enterWorkflow('vsa')}
              onSelectTransport={() => enterWorkflow('transport')}
              onReportIssue={() => handleAction('report-issue')}
              onSignOut={handleSignOut}
              onOpenTracking={() => setView('tracking')}
            />
          )}
          {!showLogin && view === 'tracking' && (
            <TrackingPage
              forceTutorial={shouldForceTutorial(tutorialForce, 'tracking')}
              onBack={() => setView('home')}
            />
          )}
          {!showLogin && view === 'vsa' && (
            <VsaScreen
              key="vsa"
              forceTutorial={shouldForceTutorial(tutorialForce, 'vsa')}
              context={context}
              onAction={handleFlowAction}
              onMovementAction={handleMovementAction}
              onStallAction={handleStallAction}
              onCleaningAction={handleCleaningAction}
              onSignOut={handleSignOut}
            />
          )}
          {!showLogin && view === 'transport' && (
            <TransportScreen
              key="transport"
              forceTutorial={shouldForceTutorial(tutorialForce, 'transport')}
              sections={['movement', 'fuel']}
              defaultExpanded={null}
              context={context}
              onAction={handleFlowAction}
              onMovementAction={handleMovementAction}
              onStallAction={handleStallAction}
              onCleaningAction={handleCleaningAction}
              onSignOut={handleSignOut}
            />
          )}
          {!showLogin && context.showIssueOverlay && (
            <IssueOverlay
              defaultPumpNumber={context.pumpNumber}
              source={context.issueReportSource === 'fuel' ? 'fuel' : 'header'}
              vehicle={
                view === 'vsa'
                  ? { unitId: VSA_VEHICLE.unitId, name: VSA_VEHICLE.name }
                  : view === 'transport'
                    ? { unitId: TRANSPORT_VEHICLE.unitId, name: TRANSPORT_VEHICLE.name }
                    : undefined
              }
              onClose={() => handleAction('close-issue')}
              onComplete={() => {
                if (context.issueReportSource === 'fuel') {
                  handleAction('submit-issue')
                } else {
                  handleAction('close-issue')
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
