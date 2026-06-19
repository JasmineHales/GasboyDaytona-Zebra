import { useEffect, useRef, useState } from 'react'
import type { FlowContext, SectionStatus, WorkflowSection } from '../types/flow'
import { useTutorial } from '../hooks/useTutorial'
import { TRANSPORT_TUTORIAL, type TutorialConfig } from '../utils/tutorialSteps'
import {
  loadPersistedWorkflow,
  savePersistedWorkflow,
} from '../utils/workflowPersistence'
import {
  getCompleteDisabledReason,
  getCompletableSection,
  hasBlockingSectionInProgress,
  hasWorkflowProgress,
  isSectionOptional,
  isStallSectionUnlocked,
  isWorkflowReadyToFinish,
} from '../utils/workflowProgress'
import { getMileageIssueLabel } from '../utils/mileageScenarios'
import {
  getMileageReliabilityIssues,
  getTelematicsOdometerFloor,
  getTrustedMileageMiles,
  hasOdometerReading,
  hasResolvedOdometer,
  requiresManualMileageEntry,
} from '../utils/mileageResolution'
import { CleaningContent } from './cleaning/CleaningContent'
import { AccordionGroup, AccordionSection } from './ui/AccordionSection'
import { CompleteButton } from './ui/CompleteButton'
import { Header } from './ui/Header'
import { VehicleCard } from './ui/VehicleCard'
import { FuelStepContent } from './fuel/FuelStepContent'
import { ScannerScreen } from './fuel/ScannerScreen'
import { LocationSearchOverlay } from './movement/LocationSearchOverlay'
import { MovementContent } from './movement/MovementContent'
import { StallContent } from './stall/StallContent'
import {
  getVehicleSummary,
  TRANSPORT_VEHICLE,
  type VehicleProfile,
} from '../utils/vehicleSummary'
import { applyWorkflowScroll } from '../utils/scrollWorkflow'
import { WorkflowTutorial } from './ui/WorkflowTutorial'
import {
  getCleaningQuickSelectSource,
  getFuelQuickSelectSource,
} from '../utils/pumpQuickSelect'

const DEFAULT_SECTIONS: WorkflowSection[] = ['movement', 'fuel']

const SECTION_TITLES: Record<WorkflowSection, string> = {
  movement: 'Movement',
  fuel: 'Fuel',
  stall: 'Stall',
  cleaning: 'Cleaning',
}

function initialExpanded(
  sections: WorkflowSection[],
  defaultExpanded: WorkflowSection | null | undefined,
): WorkflowSection | null {
  if (defaultExpanded === null) return null
  if (defaultExpanded) return defaultExpanded
  return sections.length > 0 ? sections[0] : null
}

type TransportScreenProps = {
  title?: string
  subtitle?: string
  sections?: WorkflowSection[]
  defaultExpanded?: WorkflowSection | null
  vehicleProfile?: VehicleProfile
  workflowFinishId?: 'transport' | 'vsa' | 'fuel'
  context: FlowContext
  onAction: (action: string, payload?: string) => void
  onMovementAction: (action: string, payload?: string) => void
  onStallAction: (action: string, payload?: string) => void
  onCleaningAction: (action: string, payload?: string) => void
  onSignOut?: () => void
  tutorial?: TutorialConfig
  forceTutorial?: boolean
}

export function TransportScreen({
  title = 'Transport',
  subtitle = 'Fuel Island',
  sections = DEFAULT_SECTIONS,
  defaultExpanded,
  vehicleProfile = TRANSPORT_VEHICLE,
  workflowFinishId,
  context,
  onAction,
  onMovementAction,
  onStallAction,
  onCleaningAction,
  onSignOut,
  tutorial: tutorialConfig = TRANSPORT_TUTORIAL,
  forceTutorial = false,
}: TransportScreenProps) {
  const finishWorkflowId =
    workflowFinishId ?? (title.toLowerCase() === 'vsa' ? 'vsa' : 'transport')
  const [expandedSection, setExpandedSection] = useState<WorkflowSection | null>(() =>
    initialExpanded(sections, defaultExpanded),
  )
  const [acknowledgedSections, setAcknowledgedSections] = useState<WorkflowSection[]>(
    () => loadPersistedWorkflow()?.acknowledgedSections ?? [],
  )
  const [showScanner, setShowScanner] = useState(false)
  const [scannerTarget, setScannerTarget] = useState<'fuel' | 'cleaning'>('fuel')
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const odometerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Partial<Record<WorkflowSection, HTMLDivElement | null>>>({})
  const tutorial = useTutorial({
    storageKey: tutorialConfig.storageKey,
    steps: tutorialConfig.steps,
    forceStart: forceTutorial,
  })

  useEffect(() => {
    if (!tutorial.active || !tutorial.step?.expandSection) return
    setExpandedSection(tutorial.step.expandSection)
  }, [tutorial.active, tutorial.step])

  const openScanner = (target: 'fuel' | 'cleaning') => {
    setScannerTarget(target)
    setShowScanner(true)
  }

  const closeScanner = () => {
    setShowScanner(false)
  }
  const movementStatus: SectionStatus = context.movementComplete
    ? 'complete'
    : context.movementPhase === 'stall-verify'
      ? 'missing'
      : context.movementPhase === 'select-location' ||
          context.movementPhase === 'select-stall'
        ? 'not-started'
        : 'in-progress'
  const fuelStatus: SectionStatus =
    context.fuelStep === 'fueling-complete-missing'
      ? 'missing'
      : context.fuelComplete
        ? 'complete'
        : context.fuelStep === 'fueling-complete' ||
            context.fuelStep === 'additional-fueling-complete'
          ? 'complete'
          : context.fuelStep === 'verify-pump' ||
              context.fuelStep === 'additional-fueling'
            ? 'not-started'
            : 'in-progress'
  const stallUnlocked = isStallSectionUnlocked(context)
  const stallStatus: SectionStatus = !stallUnlocked
    ? 'not-started'
    : context.stallComplete
      ? 'complete'
      : context.stallPhase === 'stall-verify'
        ? 'missing'
        : context.stallPhase === 'select-stall'
          ? 'not-started'
          : 'in-progress'
  const cleaningStatus: SectionStatus = context.cleaningComplete
    ? 'complete'
    : context.cleaningStep === 'verify-pump'
      ? 'not-started'
      : 'in-progress'

  const sectionStatus: Record<WorkflowSection, SectionStatus> = {
    movement: movementStatus,
    fuel: fuelStatus,
    stall: stallStatus,
    cleaning: cleaningStatus,
  }

  const isSectionDisabled = (section: WorkflowSection) =>
    section === 'stall' && !stallUnlocked

  const toggleSection = (section: WorkflowSection) => {
    if (isSectionDisabled(section)) return
    setExpandedSection((current) => (current === section ? null : section))
  }

  const fuelWorkflowContext = {
    fuelStep: context.fuelStep,
    unlockMode: context.unlockMode,
    locationType: context.locationType,
    fuelStartedAt: context.fuelStartedAt,
  }

  const completableSection = getCompletableSection(
    sections,
    sectionStatus,
    acknowledgedSections,
  )

  const workflowReady = isWorkflowReadyToFinish(
    sections,
    sectionStatus,
    acknowledgedSections,
    fuelWorkflowContext,
  )

  const scrollToOdometer = () => {
    odometerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const input = odometerRef.current?.querySelector('input')
    if (input instanceof HTMLInputElement) {
      window.setTimeout(() => input.focus(), 300)
    }
  }

  const handleComplete = () => {
    if (workflowReady && !completableSection) {
      setExpandedSection(null)
      onAction('workflow-finish', finishWorkflowId)
      return
    }

    if (!completableSection) return

    onAction('complete', completableSection)
    const nextAcknowledged = [...acknowledgedSections, completableSection]
    setAcknowledgedSections(nextAcknowledged)
    savePersistedWorkflow({ acknowledgedSections: nextAcknowledged })

    const allAcknowledged = isWorkflowReadyToFinish(
      sections,
      sectionStatus,
      nextAcknowledged,
      fuelWorkflowContext,
    )

    if (allAcknowledged) {
      setExpandedSection(null)
      onAction('workflow-finish', finishWorkflowId)
      return
    }

    setExpandedSection(null)
  }

  useEffect(() => {
    savePersistedWorkflow({ acknowledgedSections })
  }, [acknowledgedSections])

  useEffect(() => {
    setAcknowledgedSections((prev) =>
      prev.filter((section) => sectionStatus[section] === 'complete'),
    )
  }, [movementStatus, fuelStatus, stallStatus, cleaningStatus])

  useEffect(() => {
    if (expandedSection && isSectionDisabled(expandedSection)) {
      setExpandedSection(null)
    }
  }, [expandedSection, stallUnlocked])

  useEffect(() => {
    if (tutorial.active) return

    const mainEl = mainRef.current
    if (!mainEl) return

    const scrollWorkflow = () => {
      applyWorkflowScroll(mainEl, {
        expandedSection,
        expandedSectionEl: expandedSection
          ? sectionRefs.current[expandedSection]
          : null,
      })
    }

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(scrollWorkflow)
    })

    return () => cancelAnimationFrame(raf)
  }, [
    expandedSection,
    showScanner,
    context.fuelStep,
    context.isAdditionalFueling,
    context.fuelTransactions.length,
    context.cleaningStep,
    context.movementPhase,
    context.stallPhase,
    tutorial.active,
  ])

  const handleFuelAction = (action: string, payload?: string) => {
    switch (action) {
      case 'scan':
        openScanner('fuel')
        break
      case 'scan-complete':
        closeScanner()
        onAction('scan-complete')
        break
      case 'manual-entry':
        onAction('manual-entry')
        break
      case 'back-to-scan':
        onAction('back-to-scan')
        break
      case 'pump-change':
        onAction('pump-change', payload)
        break
      case 'quick-select-pump':
        onAction('quick-select-pump', payload)
        break
      case 'clear-pump':
        onAction('clear-pump')
        break
      case 'on-site-unlock':
        onAction('on-site-unlock')
        break
      case 'unlock-pump':
        onAction('unlock-pump')
        break
      case 'cancel-unlock':
        onAction('cancel-unlock')
        break
      case 'start-fueling':
        onAction('start-fueling')
        break
      case 'finish-fueling':
        onAction('finish-fueling')
        break
      case 'complete-remote-fueling':
        onAction('complete-remote-fueling')
        break
      case 'submit-missing-gallons':
        onAction('submit-missing-gallons')
        break
      case 'gallons-change':
        onAction('gallons-change', payload)
        break
      case 'report-issue':
        onAction('report-issue', 'fuel')
        break
      case 'retry':
        onAction('retry')
        break
      default:
        break
    }
  }

  const getSectionTimerStartedAt = (section: WorkflowSection): number | null => {
    switch (section) {
      case 'cleaning':
        return context.cleaningStep === 'cleaning-in-progress'
          ? context.cleaningStartedAt
          : null
      case 'fuel':
        return context.fuelStep === 'fueling-in-progress'
          ? context.fuelStartedAt
          : null
      default:
        return null
    }
  }

  const mileageState = context.mileageState ?? vehicleProfile.mileageState
  const mileageOptions = {
    gasboyMileageExpected: context.locationType === 'gasboy',
  }
  const manualMileageRequired = requiresManualMileageEntry(
    mileageState,
    mileageOptions,
  )
  const trustedMileageMiles = getTrustedMileageMiles(mileageState, mileageOptions)
  const mileageIssues = getMileageReliabilityIssues(mileageState, mileageOptions)
  const odometerHint = manualMileageRequired
    ? getMileageIssueLabel(mileageIssues[0])
    : undefined
  const odometerMinimumMiles = manualMileageRequired
    ? getTelematicsOdometerFloor(mileageState)
    : null
  const odometerDisplayValue = manualMileageRequired
    ? context.odometerReading
    : trustedMileageMiles != null
      ? String(trustedMileageMiles)
      : ''

  const canComplete =
    hasResolvedOdometer(
      context.odometerReading,
      mileageState,
      mileageOptions,
    ) &&
    !hasBlockingSectionInProgress(
      sections,
      sectionStatus,
      completableSection,
      fuelWorkflowContext,
    ) &&
    (completableSection !== undefined || workflowReady)
  const completeDisabledReason = getCompleteDisabledReason(
    completableSection,
    SECTION_TITLES,
    sections,
    sectionStatus,
    context.odometerReading,
    fuelWorkflowContext,
    workflowReady,
    mileageState,
    mileageOptions,
  )
  const confirmOnExit = hasWorkflowProgress(
    context,
    sections,
    sectionStatus,
    mileageState,
    mileageOptions,
  )
  const vehicleSummary = getVehicleSummary(sections, sectionStatus, context, vehicleProfile)

  const handleStallAction = (action: string, payload?: string) => {
    if (!isStallSectionUnlocked(context)) return
    onStallAction(action, payload)
  }

  const handleCompletePress = () => {
    if (manualMileageRequired && !hasOdometerReading(context.odometerReading)) {
      scrollToOdometer()
      return
    }
    if (!canComplete) return
    handleComplete()
  }

  const renderSectionContent = (section: WorkflowSection) => {
    const cleaningQuickSelect = getCleaningQuickSelectSource(context)
    const fuelQuickSelect = getFuelQuickSelectSource(context)

    switch (section) {
      case 'cleaning':
        return (
          <CleaningContent
            step={context.cleaningStep}
            pumpNumber={context.cleaningPumpNumber}
            finalTime={context.cleaningFinalTime}
            startedAt={context.cleaningStartedAt}
            fuelActivePump={fuelQuickSelect?.pump ?? null}
            fuelQuickSelectInProgress={fuelQuickSelect?.inProgress ?? false}
            unavailablePumps={context.unavailablePumps}
            onScanPump={() => openScanner('cleaning')}
            onManualEntry={() => onCleaningAction('manual-entry')}
            onBackToScan={() => onCleaningAction('back-to-scan')}
            onPumpChange={(value) => onCleaningAction('pump-change', value)}
            onQuickSelectPump={(pump) => onCleaningAction('quick-select-pump', pump)}
            onClearPump={() => onCleaningAction('clear-pump')}
            onVerifyPump={() => onCleaningAction('verify-pump')}
            onWrongPump={() => onCleaningAction('wrong-pump')}
            onStartCleaning={() => onCleaningAction('start-cleaning')}
            onFinishCleaning={() => onCleaningAction('finish-cleaning')}
            onContinueCleaning={() => onCleaningAction('continue-cleaning')}
          />
        )
      case 'movement':
        return (
          <MovementContent
            mode={context.movementMode}
            phase={context.movementPhase}
            location={context.location}
            stallNumber={context.stallNumber}
            onModeChange={(mode) => onMovementAction('mode-change', mode)}
            onOpenLocationSearch={() => setShowLocationSearch(true)}
            onLocationClear={() => onMovementAction('location-clear')}
            onStallSelect={(stall) => onMovementAction('stall-select', stall)}
            onStallClear={() => onMovementAction('stall-clear')}
            onTakePhoto={() => onMovementAction('take-photo')}
            onRetakePhoto={() => onMovementAction('retake-photo')}
          />
        )
      case 'fuel':
        return (
          <FuelStepContent
            step={context.fuelStep}
            pumpNumber={context.pumpNumber}
            unlockMode={context.unlockMode}
            locationType={context.locationType}
            fuelGallons={context.fuelGallons}
            fuelGallonsDispensed={context.fuelGallonsDispensed}
            fuelFinalTime={context.fuelFinalTime}
            fuelStartedAt={context.fuelStartedAt}
            onSubmitMissingGallons={() => handleFuelAction('submit-missing-gallons')}
            isAdditionalFueling={context.isAdditionalFueling}
            fuelTransactions={context.fuelTransactions}
            fuelGallonsPending={context.fuelGallonsPending}
            fuelPumpStatusReceived={context.fuelPumpStatusReceived}
            unavailablePumps={context.unavailablePumps}
            cleaningActivePump={cleaningQuickSelect?.pump ?? null}
            cleaningQuickSelectInProgress={cleaningQuickSelect?.inProgress ?? false}
            onScanPump={() => handleFuelAction('scan')}
            onManualEntry={() => handleFuelAction('manual-entry')}
            onBackToScan={() => handleFuelAction('back-to-scan')}
            onPumpChange={(value) => handleFuelAction('pump-change', value)}
            onQuickSelectPump={(pump) => handleFuelAction('quick-select-pump', pump)}
            onClearPump={() => handleFuelAction('clear-pump')}
            onOnSiteUnlock={() => handleFuelAction('on-site-unlock')}
            onStartFueling={() => handleFuelAction('start-fueling')}
            onUnlockPump={() => handleFuelAction('unlock-pump')}
            onCancelUnlock={() => handleFuelAction('cancel-unlock')}
            onReportIssue={() => handleFuelAction('report-issue')}
            onFinishFueling={() => handleFuelAction('finish-fueling')}
            onCompleteRemoteFueling={() => handleFuelAction('complete-remote-fueling')}
            onGallonsChange={(value) => handleFuelAction('gallons-change', value)}
            onRetry={() => handleFuelAction('retry')}
          />
        )
      case 'stall':
        return (
          <StallContent
            phase={context.stallPhase}
            stallNumber={context.stallSectionNumber}
            onStallSelect={(stall) => handleStallAction('stall-select', stall)}
            onStallClear={() => handleStallAction('stall-clear')}
            onTakePhoto={() => handleStallAction('take-photo')}
            onRetakePhoto={() => handleStallAction('retake-photo')}
          />
        )
    }
  }

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col bg-white">
      <Header
        title={title}
        subtitle={subtitle}
        onBack={() => onAction('back')}
        onReportIssue={() => onAction('report-issue')}
        onSignOut={onSignOut}
        onReplayTutorial={tutorial.start}
        confirmOnExit={confirmOnExit}
      />

      <main
        id="main-content"
        ref={mainRef}
        className="app-scroll app-workflow-main flex min-h-0 flex-1 flex-col py-2 md:py-3"
      >
        <div className="app-main-bottom" data-workflow-widget="stack">
          <VehicleCard
            summary={vehicleSummary}
            odometer={{
              odometerReading: odometerDisplayValue,
              onOdometerChange: (value) => onAction('odometer-change', value),
              verified: !manualMileageRequired,
              hint: odometerHint,
              minimumMiles: odometerMinimumMiles,
              odometerRef,
            }}
          />
          {sections.length === 1 ? (
            <div
              data-workflow-widget="section"
              data-tutorial={sections[0]}
              ref={(el) => {
                sectionRefs.current[sections[0]] = el
              }}
            >
              {renderSectionContent(sections[0])}
            </div>
          ) : (
            <AccordionGroup>
              {sections.map((section, index) => {
                const sectionOptional = isSectionOptional(
                  section,
                  sections,
                  sectionStatus,
                  fuelWorkflowContext,
                )
                const sectionAwaiting =
                  expandedSection !== section &&
                  !isSectionDisabled(section) &&
                  !sectionOptional &&
                  (sectionStatus[section] === 'not-started' ||
                    sectionStatus[section] === 'in-progress' ||
                    sectionStatus[section] === 'missing')

                return (
                  <AccordionSection
                    key={section}
                    title={SECTION_TITLES[section]}
                    status={sectionStatus[section]}
                    statusLabel={sectionOptional ? 'Optional' : undefined}
                    chipVariant={sectionOptional ? 'optional' : 'default'}
                    highlighted={sectionAwaiting}
                    expanded={expandedSection === section}
                    disabled={isSectionDisabled(section)}
                    onToggle={() => toggleSection(section)}
                    isLast={index === sections.length - 1}
                    trackTag={`workflow.accordion.${section}`}
                    headerTimerStartedAt={getSectionTimerStartedAt(section)}
                    dataTutorial={section}
                    sectionRef={(el) => {
                      sectionRefs.current[section] = el
                    }}
                  >
                    {renderSectionContent(section)}
                  </AccordionSection>
                )
              })}
            </AccordionGroup>
          )}
        </div>
      </main>

      <footer
        className="app-workflow-footer shrink-0 border-t border-[var(--color-fleet-secondary-border)] pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
        data-tutorial="complete"
      >
        <CompleteButton
          disabled={!canComplete}
          disabledReason={completeDisabledReason}
          onClick={handleCompletePress}
          onDisabledPress={handleCompletePress}
        />
      </footer>

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
        trackPrefix={tutorialConfig.trackPrefix}
        trackView={finishWorkflowId}
        trackScreen={context.screen}
      />

      {sections.includes('movement') && (
        <LocationSearchOverlay
          open={showLocationSearch}
          onClose={() => setShowLocationSearch(false)}
          onSelect={(location) => {
            setShowLocationSearch(false)
            onMovementAction('location-select', location)
          }}
        />
      )}

      <ScannerScreen
          open={showScanner}
          onBack={closeScanner}
          trackPrefix={scannerTarget === 'cleaning' ? 'cleaning.scanner' : 'fuel.scanner'}
          onManualEntry={() => {
            setShowScanner(false)
            if (scannerTarget === 'cleaning') {
              onCleaningAction('manual-entry')
            } else {
              onAction('manual-entry')
            }
          }}
          onScanComplete={() => {
            if (scannerTarget === 'cleaning') {
              closeScanner()
              onCleaningAction('scan-complete')
            } else {
              handleFuelAction('scan-complete')
            }
          }}
        />
    </div>
  )
}
