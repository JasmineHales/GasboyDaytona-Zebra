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
import { resolveDesignVersion, readDesignVersionFromUrl, writeDesignVersionDevOverride, type DesignVersion } from './utils/designVersion'
import { DesignVersionProvider } from './context/DesignVersionContext'
import { DesignVersionSwitcher } from './components/dev/DesignVersionSwitcher'
import { DevDevicePreviewFrame, devAppShellClassName, useDevEm45Preview } from './components/dev/DevDevicePreviewFrame'
import { HomePage } from './components/HomePage'
import { InitialSetupScreen } from './components/InitialSetupScreen'
import { TransportScreen } from './components/TransportScreen'
import { TrackingPage } from './components/TrackingPage'
import { VsaScreen } from './components/VsaScreen'
import { IssueOverlay } from './components/fuel/IssueOverlay'
import { VehicleSearch } from './components/vehicle/VehicleSearch'
import type { FlowContext } from './types/flow'
import type { SelectedVehicle } from './types/vehicleSearch'
import {
  TRANSPORT_VEHICLE,
  VSA_VEHICLE,
  type FuelSimulationConfig,
  type VehicleProfile,
} from './utils/vehicleSummary'
import {
  clearAuth,
  MOCK_SSO_USER,
  persistAuth,
  readAuthenticated,
  readAuthMethod,
  readSsoUser,
  type SsoUser,
} from './utils/auth'
import {
  persistOperatorSite,
  resolveOperatorSite,
  type OperatorSiteId,
} from './utils/operatorSites'
import { recordRecentOperatorSite } from './utils/recentOperatorSites'
import {
  markInitialSetupComplete,
  readInitialSetupComplete,
} from './utils/initialSetup'
import { useTranslate } from './i18n/I18nProvider'
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
import {
  findVehicleCatalogEntry,
  selectedVehicleToProfile,
} from './utils/vehicleSearchCatalog'
import { workflowToActivityType } from './utils/vehicleSearchActivity'
import { isVehicleSearchDevStateId } from './utils/vehicleSearchDevStates'
import { consumeCaptureSeed } from './utils/captureSeed'
import { resetSessionTimer } from './components/ui/SessionTimer'

type LoginPreview = 'device' | 'browser' | null

function shouldForceLoginScreen() {
  return new URLSearchParams(window.location.search).has('login')
}

function initialView(force: TutorialForceTarget | null): AppView {
  if (readDesignVersionFromUrl()) return 'home'
  const seed = import.meta.env.DEV ? consumeCaptureSeed() : null
  if (seed?.page === 'tracking') return 'tracking'
  if (seed?.page === 'workflow' && seed.activeView) return seed.activeView
  if (seed?.page === 'home') return 'home'
  if (force === 'transport') return 'transport'
  if (force === 'vsa') return 'vsa'
  if (force === 'tracking') return 'tracking'
  const saved = loadPersistedWorkflow()
  if (saved?.activeView) return saved.activeView
  return 'home'
}

function initialCaptureAuth() {
  const seed = import.meta.env.DEV ? consumeCaptureSeed() : null
  if (seed?.page === 'login') return { authenticated: false, setup: false }
  if (seed?.page === 'setup') return { authenticated: true, setup: true }
  return null
}

export default function App() {
  const [designVersion, setDesignVersion] = useState<DesignVersion>(() => resolveDesignVersion())

  const handleDesignVersionChange = (version: DesignVersion) => {
    writeDesignVersionDevOverride(version)
    setDesignVersion(version)
  }

  return (
    <MainApp
      designVersion={designVersion}
      onDesignVersionChange={handleDesignVersionChange}
    />
  )
}

type MainAppProps = {
  designVersion: DesignVersion
  onDesignVersionChange: (version: DesignVersion) => void
}

function MainApp({ designVersion, onDesignVersionChange }: MainAppProps) {
  const t = useTranslate()
  const [runtimeMode] = useState(() => getRuntimeMode())
  const isHertzDevice = runtimeMode === 'hertz-device'
  const [tutorialForce] = useState(() => {
    const force = consumeTutorialForceParam()
    if (force === 'all') {
      clearAllTutorialCompletions()
    }
    return force
  })
  const captureAuth = import.meta.env.DEV ? initialCaptureAuth() : null
  const [isAuthenticated, setIsAuthenticated] = useState(
    () =>
      captureAuth?.authenticated ??
      (!shouldForceLoginScreen() && readAuthenticated()),
  )
  const [loginPreview, setLoginPreview] = useState<LoginPreview>(null)
  const [devExperience, setDevExperience] = useState<'device' | 'browser'>(() =>
    isHertzDevice ? 'device' : import.meta.env.DEV ? 'device' : 'browser',
  )
  const useEm45Preview = useDevEm45Preview(devExperience)
  const [ssoUser, setSsoUser] = useState<SsoUser | null>(() => readSsoUser())
  const [operatorSite, setOperatorSite] = useState(() =>
    resolveOperatorSite(readSsoUser()?.site ?? MOCK_SSO_USER.site),
  )
  const [showInitialSetup, setShowInitialSetup] = useState(
    () =>
      captureAuth?.setup ??
      (readAuthenticated() && !readInitialSetupComplete()),
  )
  const [view, setView] = useState<AppView>(() => initialView(tutorialForce))
  const [activeWidgetKey, setActiveWidgetKey] = useState<string | null>(null)
  const captureSeed = import.meta.env.DEV ? consumeCaptureSeed() : null
  const [vehicleSearchWorkflow, setVehicleSearchWorkflow] = useState<WorkflowView | null>(
    () => captureSeed?.vehicleSearch?.workflow ?? null,
  )
  const [vehicleSearchDevState, setVehicleSearchDevState] = useState<string | null>(
    () => captureSeed?.vehicleSearch?.devState ?? 'vehicle-search:idle',
  )
  const [workflowVehicleProfile, setWorkflowVehicleProfile] = useState<VehicleProfile | null>(
    null,
  )
  useClickTracking()
  const {
    context,
    goToScreen,
    applyWidgetState,
    patchDevContext,
    handleAction,
    recordGallonsCapture,
    handleMovementAction,
    handleStallAction,
    handleCleaningAction,
  } = useFlow()

  const showLogin = !isAuthenticated || loginPreview != null
  const loginVariant = loginPreview ?? devExperience
  const showInitialSetupForVersion = showInitialSetup
  const showAppContent = !showLogin && !showInitialSetupForVersion
  const authMethod = readAuthMethod()
  const useDeviceHome = isHertzDevice || authMethod === 'device'
  const workflowView: WorkflowView | null =
    !showLogin && view === 'transport'
      ? 'transport'
      : !showLogin && view === 'vsa'
        ? 'vsa'
        : !showLogin && view === 'fuel'
          ? 'fuel'
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
    if (view === 'transport' || view === 'vsa' || view === 'fuel') {
      savePersistedWorkflow({ activeView: view })
      return
    }
    if (view === 'home') {
      savePersistedWorkflow({ activeView: null })
    }
  }, [view])

  useEffect(() => {
    if (!isAuthenticated || isHertzDevice) return
    if (readAuthMethod() === 'device') return
    if (!readSsoUser()) {
      clearAuth()
      setIsAuthenticated(false)
      setSsoUser(null)
    }
  }, [isAuthenticated, isHertzDevice])

  const applyDevExperience = (variant: 'device' | 'browser') => {
    if (variant === 'device') {
      persistAuth('device')
      setIsAuthenticated(true)
      setSsoUser(null)
      return
    }
    persistAuth('browser-sso', MOCK_SSO_USER)
    setSsoUser(MOCK_SSO_USER)
    setOperatorSite(MOCK_SSO_USER.site)
    persistOperatorSite(MOCK_SSO_USER.site)
    setIsAuthenticated(true)
  }

  const ensureDevAuth = (variant: 'device' | 'browser' = devExperience) => {
    if (isAuthenticated) return
    applyDevExperience(variant)
  }

  const handleExperienceChange = (variant: 'device' | 'browser') => {
    setDevExperience(variant)
    if (showLogin) {
      setIsAuthenticated(false)
      setLoginPreview(variant)
      return
    }
    if (view === 'home') {
      setLoginPreview(null)
      applyDevExperience(variant)
    }
  }

  const handleDeviceSignIn = () => {
    persistAuth('device')
    setIsAuthenticated(true)
    setLoginPreview(null)
    if (!readInitialSetupComplete()) {
      if (import.meta.env.DEV) {
        markInitialSetupComplete()
        setOperatorSite(resolveOperatorSite())
      } else {
        setShowInitialSetup(true)
        return
      }
    } else {
      setOperatorSite(resolveOperatorSite())
    }
  }

  const handleBrowserSignIn = (user: SsoUser) => {
    persistAuth('browser-sso', user)
    setSsoUser(user)
    setIsAuthenticated(true)
    setLoginPreview(null)
    if (!readInitialSetupComplete()) {
      setShowInitialSetup(true)
      return
    }
    persistOperatorSite(user.site)
    recordRecentOperatorSite(user.site)
    setOperatorSite(resolveOperatorSite(user.site))
  }

  const handleInitialSetupComplete = (site: OperatorSiteId) => {
    persistOperatorSite(site)
    recordRecentOperatorSite(site)
    setOperatorSite(site)
    markInitialSetupComplete()
    setShowInitialSetup(false)
    if (ssoUser) {
      const updated = { ...ssoUser, site }
      setSsoUser(updated)
      persistAuth('browser-sso', updated)
    }
  }

  const handleOperatorSiteChange = (site: string) => {
    persistOperatorSite(site)
    recordRecentOperatorSite(site)
    setOperatorSite(site)
    if (ssoUser) {
      const updated = { ...ssoUser, site }
      setSsoUser(updated)
      persistAuth('browser-sso', updated)
    }
  }

  const handleSignOut = () => {
    clearAuth()
    clearPersistedWorkflow()
    setIsAuthenticated(false)
    setSsoUser(null)
    setLoginPreview(null)
    setShowInitialSetup(false)
    setView('home')
    setActiveWidgetKey(null)
    setVehicleSearchWorkflow(null)
    setWorkflowVehicleProfile(null)
  }

  const enterWorkflow = (workflow: WorkflowView) => {
    resetSessionTimer()
    if (workflow === 'transport') {
      goToScreen('transport-default')
      setActiveWidgetKey('transport:default')
    } else if (workflow === 'vsa') {
      goToScreen('stall-default')
      setActiveWidgetKey('vsa:default')
    } else if (workflow === 'fuel') {
      goToScreen('fueling-default')
      setActiveWidgetKey('fuel-remote:fueling-default')
    }
    setView(workflow)
  }

  const browserUser = ssoUser ?? readSsoUser()

  const requestWorkflow = (workflow: WorkflowView) => {
    setVehicleSearchWorkflow(workflow)
    setVehicleSearchDevState('vehicle-search:idle')
  }

  const startWorkflow = (workflow: WorkflowView) => {
    if (useDeviceHome) {
      setWorkflowVehicleProfile(null)
      enterWorkflow(workflow)
      return
    }
    requestWorkflow(workflow)
  }

  const handleVehicleSearchCancel = () => {
    setVehicleSearchWorkflow(null)
    setVehicleSearchDevState('vehicle-search:idle')
  }

  const fuelSimulationContextPatch = (
    fuelSimulation?: FuelSimulationConfig,
  ): Partial<FlowContext> => {
    if (!fuelSimulation) {
      return {
        fuelSimAutoCompleteMs: undefined,
        fuelSimPumpStatusDelayMs: undefined,
        fuelSimGallons: undefined,
        fuelSimPumpStopDelayMs: undefined,
        fuelSimPumpStopGallons: undefined,
        fuelSimUnlockOutcome: undefined,
        fuelSimManualCompleteOnly: undefined,
      }
    }

    return {
      fuelSimAutoCompleteMs: fuelSimulation.autoCompleteMs,
      fuelSimPumpStatusDelayMs: fuelSimulation.pumpStatusDelayMs ?? 4_000,
      fuelSimGallons: fuelSimulation.gallons,
      fuelSimPumpStopDelayMs: fuelSimulation.pumpStopDelayMs,
      fuelSimPumpStopGallons: fuelSimulation.pumpStopGallons,
      fuelSimUnlockOutcome: fuelSimulation.unlockOutcome,
      fuelSimManualCompleteOnly: fuelSimulation.manualCompleteOnly,
    }
  }

  const handleVehicleSelected = (vehicle: SelectedVehicle) => {
    const catalogEntry =
      findVehicleCatalogEntry((entry) => entry.vehicleId === vehicle.vehicleId) ??
      findVehicleCatalogEntry((entry) => entry.unitNumber === vehicle.unitNumber)

    const profile: VehicleProfile = catalogEntry
      ? selectedVehicleToProfile(catalogEntry)
      : {
          unitId: vehicle.unitNumber,
          name: `${vehicle.make} ${vehicle.model}`,
          vehicleClass: '',
          licensePlate: vehicle.licensePlate,
          make: vehicle.make,
          model: vehicle.model,
          vehicleType: '—',
          vin: vehicle.vin,
          color: vehicle.color,
          state: vehicle.state,
          odometerMiles: 0,
          mileageState: TRANSPORT_VEHICLE.mileageState,
        }

    setWorkflowVehicleProfile(profile)

    const workflow = vehicleSearchWorkflow
    setVehicleSearchWorkflow(null)
    if (workflow) {
      enterWorkflow(workflow)
      patchDevContext({
        mileageState: profile.mileageState,
        odometerReading: '',
        ...fuelSimulationContextPatch(profile.fuelSimulation),
      })
    }
  }

  const resolveWorkflowVehicleProfile = (workflow: WorkflowView): VehicleProfile => {
    if (workflowVehicleProfile) return workflowVehicleProfile
    if (workflow === 'vsa') return VSA_VEHICLE
    return TRANSPORT_VEHICLE
  }

  const handlePageSelect = (item: PageNavItem) => {
    if (item.view === 'login') {
      setIsAuthenticated(false)
      setLoginPreview(devExperience)
      setShowInitialSetup(false)
      return
    }

    setLoginPreview(null)
    ensureDevAuth(devExperience)

    if (item.view === 'setup') {
      setShowInitialSetup(true)
      setView('home')
      return
    }

    setShowInitialSetup(false)

    if (item.view === 'transport') {
      resetSessionTimer()
      goToScreen('transport-default')
      setActiveWidgetKey('transport:default')
    } else if (item.view === 'vsa') {
      resetSessionTimer()
      goToScreen('stall-default')
      setActiveWidgetKey('vsa:default')
    } else if (item.view === 'fuel') {
      resetSessionTimer()
      goToScreen('fueling-default')
      setActiveWidgetKey('fuel-remote:fueling-default')
    }

    setView(item.view)
  }

  const handleWidgetSelect = (item: WidgetStateItem) => {
    setActiveWidgetKey(item.key)
    if (item.patch) {
      patchDevContext(item.patch)
      return
    }
    applyWidgetState(item.screen)
  }

  const handleFlowAction = (action: string, payload?: string) => {
    if (action === 'workflow-finish') {
      handleAction('complete', payload)
      clearPersistedWorkflow()
      goToScreen(
        payload === 'vsa'
          ? 'stall-default'
          : payload === 'fuel'
            ? 'fueling-default'
            : 'transport-default',
      )
      setActiveWidgetKey(
        payload === 'vsa'
          ? 'vsa:default'
          : payload === 'fuel'
            ? 'fuel-remote:fueling-default'
            : 'transport:default',
      )
      setView('home')
      return
    }
    if (action === 'back') {
      clearPersistedWorkflow()
      setWorkflowVehicleProfile(null)
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

  const handlePatchContext = (patch: Partial<FlowContext>) => {
    if ('mileageState' in patch || 'odometerReading' in patch) {
      setActiveWidgetKey(null)
    }
    if ('vsaStallEnabled' in patch) {
      if (patch.vsaStallEnabled === false) {
        applyWidgetState('vsa-no-stall-default')
        setActiveWidgetKey('vsa:no-stall')
      } else if (patch.vsaStallEnabled === true && view === 'vsa') {
        applyWidgetState('stall-default')
        setActiveWidgetKey('vsa:default')
      }
    }
    patchDevContext(patch)
  }

  const activePageKey = resolveActivePageKey({
    view,
    showLogin,
    showSetup: showInitialSetupForVersion,
  })

  const resolvedWidgetKey =
    activeWidgetKey ??
    (workflowView
      ? resolveActiveWidgetKey(workflowView, context.screen, context)
      : null)

  const handleDesignVersionChange = (version: DesignVersion) => {
    onDesignVersionChange(version)
    setView('home')
    setActiveWidgetKey(null)
    setVehicleSearchWorkflow(null)
    setVehicleSearchDevState('vehicle-search:idle')
    setWorkflowVehicleProfile(null)
    savePersistedWorkflow({ activeView: null })
  }

  return (
    <DesignVersionProvider version={designVersion}>
    <div className="app-viewport flex h-dvh min-h-0" data-runtime={runtimeMode} data-design-version={designVersion}>
      <a href="#main-content" className="fleet-skip-link">
        {t('common.skipToMainContent')}
      </a>
      <FlowNavigator
        activePageKey={activePageKey}
        activeWidgetKey={resolvedWidgetKey}
        workflowView={workflowView}
        context={context}
        view={view}
        showLogin={showLogin}
        showSetup={showInitialSetupForVersion}
        loginVariant={loginVariant}
        onSelectPage={handlePageSelect}
        onSelectWidget={handleWidgetSelect}
        onLoginVariantChange={handleExperienceChange}
        onPatchContext={handlePatchContext}
        vehicleSearchActive={Boolean(vehicleSearchWorkflow)}
        vehicleSearchDevState={vehicleSearchDevState}
        onVehicleSearchDevStateSelect={setVehicleSearchDevState}
        designVersion={designVersion}
        onDesignVersionChange={handleDesignVersionChange}
      />
      <DevDevicePreviewFrame
        devExperience={devExperience}
        mobileSwitcher={
          <div className="dev-design-switcher-mobile md:hidden">
            <DesignVersionSwitcher
              designVersion={designVersion}
              onDesignVersionChange={handleDesignVersionChange}
              compact
            />
          </div>
        }
      >
        <div
          key={`design-${designVersion}`}
          className={devAppShellClassName(useEm45Preview, 'app-surface')}
          data-current-view={showLogin ? 'login' : showInitialSetupForVersion ? 'setup' : view}
          data-current-screen={context.screen}
        >
          <div id="app-main-shell" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {showLogin && (
            <>
              {loginVariant === 'device' ? (
                <LoginScreen onSignIn={handleDeviceSignIn} />
              ) : (
                <BrowserLoginScreen onSignIn={handleBrowserSignIn} />
              )}
            </>
          )}
          {!showLogin && showInitialSetupForVersion && (
            <InitialSetupScreen
              onComplete={handleInitialSetupComplete}
              applyDefaults={!readInitialSetupComplete()}
            />
          )}
          {showAppContent && view === 'home' && vehicleSearchWorkflow && (
            <VehicleSearch
              activityType={workflowToActivityType(vehicleSearchWorkflow)}
              site={operatorSite}
              onVehicleSelected={handleVehicleSelected}
              onCancel={handleVehicleSearchCancel}
              devPreviewState={
                vehicleSearchDevState && isVehicleSearchDevStateId(vehicleSearchDevState)
                  ? vehicleSearchDevState
                  : null
              }
            />
          )}
          {showAppContent && view === 'home' && useDeviceHome && !vehicleSearchWorkflow && (
            <HomePage
              key={`design-${designVersion}`}
              site={operatorSite}
              onSiteChange={handleOperatorSiteChange}
              forceTutorial={shouldForceTutorial(tutorialForce, 'home')}
              onSelectVsa={() => startWorkflow('vsa')}
              onSelectTransport={() => startWorkflow('transport')}
              onSelectFuel={() => startWorkflow('fuel')}
              onReportIssue={() => handleAction('report-issue')}
              onSignOut={handleSignOut}
            />
          )}
          {showAppContent && view === 'home' && !useDeviceHome && browserUser && !vehicleSearchWorkflow && (
            <BrowserHomePage
              key={`design-${designVersion}`}
              user={browserUser}
              site={operatorSite}
              onSiteChange={handleOperatorSiteChange}
              forceTutorial={shouldForceTutorial(tutorialForce, 'home')}
              onSelectVsa={() => startWorkflow('vsa')}
              onSelectTransport={() => startWorkflow('transport')}
              onSelectFuel={() => startWorkflow('fuel')}
              onReportIssue={() => handleAction('report-issue')}
              onSignOut={handleSignOut}
            />
          )}
          {showAppContent && view === 'tracking' && (
            <TrackingPage
              forceTutorial={shouldForceTutorial(tutorialForce, 'tracking')}
              onBack={() => setView('home')}
            />
          )}
          {showAppContent && view === 'vsa' && (
            <VsaScreen
              key="vsa"
              forceTutorial={shouldForceTutorial(tutorialForce, 'vsa')}
              context={context}
              vehicleProfile={resolveWorkflowVehicleProfile('vsa')}
              site={operatorSite}
              onAction={handleFlowAction}
              onMovementAction={handleMovementAction}
              onStallAction={handleStallAction}
              onCleaningAction={handleCleaningAction}
              onSignOut={handleSignOut}
            />
          )}
          {showAppContent && view === 'transport' && (
            <TransportScreen
              key="transport"
              forceTutorial={shouldForceTutorial(tutorialForce, 'transport')}
              sections={['movement', 'fuel']}
              defaultExpanded="movement"
              vehicleProfile={resolveWorkflowVehicleProfile('transport')}
              site={operatorSite}
              context={context}
              onAction={handleFlowAction}
              onGallonsCaptureRecord={recordGallonsCapture}
              onMovementAction={handleMovementAction}
              onStallAction={handleStallAction}
              onCleaningAction={handleCleaningAction}
              onSignOut={handleSignOut}
            />
          )}
          {showAppContent && view === 'fuel' && (
            <TransportScreen
              key="fuel"
              sections={['fuel']}
              defaultExpanded="fuel"
              workflowFinishId="fuel"
              vehicleProfile={resolveWorkflowVehicleProfile('fuel')}
              site={operatorSite}
              context={context}
              onAction={handleFlowAction}
              onGallonsCaptureRecord={recordGallonsCapture}
              onMovementAction={handleMovementAction}
              onStallAction={handleStallAction}
              onCleaningAction={handleCleaningAction}
              onSignOut={handleSignOut}
            />
          )}
          {showAppContent && context.showIssueOverlay && (
            <IssueOverlay
              defaultPumpNumber={context.pumpNumber}
              source={
                context.issueReportSource === 'fuel'
                  ? 'fuel'
                  : context.issueReportSource === 'vehicle'
                    ? 'vehicle'
                    : 'header'
              }
              vehicle={
                view === 'vsa'
                  ? { unitId: VSA_VEHICLE.unitId, name: VSA_VEHICLE.name }
                  : view === 'transport' || view === 'fuel'
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
          <div id="app-overlay-root" className="app-overlay-root" />
        </div>
      </DevDevicePreviewFrame>
    </div>
    </DesignVersionProvider>
  )
}
