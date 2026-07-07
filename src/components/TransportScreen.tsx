import { useEffect, useMemo, useRef, useState, useId } from 'react'
import type { FlowContext, SectionStatus, WorkflowSection } from '../types/flow'
import { useTutorial } from '../hooks/useTutorial'
import { useI18n } from '../i18n/I18nProvider'
import {
  TRANSPORT_TUTORIAL_STORAGE_KEY,
  VSA_TUTORIAL_STORAGE_KEY,
  type TutorialConfig,
} from '../utils/tutorialSteps'
import {
  getTransportTutorialSteps,
  getVsaTutorialSteps,
} from '../utils/tutorialCopy'
import {
  loadPersistedWorkflow,
  savePersistedWorkflow,
} from '../utils/workflowPersistence'
import { readCaptureUiFlags } from '../utils/captureSeed'
import { onTutorialWorkflowRestore } from '../utils/tutorialMode'
import {
  getCompletableSection,
  getCompleteDisabledReason,
  getSectionDisabledReason,
  getSectionNeedingAttention,
  hasBlockingSectionInProgress,
  hasFuelPumpReportCompletionEligibility,
  isSectionOptional,
  isStallSectionUnlocked,
  isWorkflowReadyToFinish,
} from '../utils/workflowProgress'
import { getMileageIssueLabel } from '../utils/mileageScenarios'
import {
  getMileageReliabilityIssues,
  getTelematicsOdometerFloor,
  getTrustedMileageMiles,
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
import type { GallonsCaptureRecord } from '../types/gallonsCapture'
import { applyWorkflowScroll, scrollElementIntoWorkflowView } from '../utils/scrollWorkflow'
import { WorkflowTutorial } from './ui/WorkflowTutorial'
import {
  getCleaningQuickSelectSource,
  getFuelQuickSelectSource,
} from '../utils/pumpQuickSelect'

const DEFAULT_SECTIONS: WorkflowSection[] = ['movement', 'fuel']

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
  site?: string
  vehicleProfile?: VehicleProfile
  workflowFinishId?: 'transport' | 'vsa' | 'fuel'
  context: FlowContext
  onAction: (action: string, payload?: string) => void
  onGallonsCaptureRecord?: (record: GallonsCaptureRecord) => void
  onMovementAction: (action: string, payload?: string) => void
  onStallAction: (action: string, payload?: string) => void
  onCleaningAction: (action: string, payload?: string) => void
  onSignOut?: () => void
  tutorial?: TutorialConfig
  forceTutorial?: boolean
}

export function TransportScreen({
  title,
  subtitle,
  sections = DEFAULT_SECTIONS,
  defaultExpanded,
  vehicleProfile = TRANSPORT_VEHICLE,
  site: _site,
  workflowFinishId,
  context,
  onAction,
  onGallonsCaptureRecord,
  onMovementAction,
  onStallAction,
  onCleaningAction,
  onSignOut,
  tutorial: tutorialConfig,
  forceTutorial = false,
}: TransportScreenProps) {
  const { messages, t, language } = useI18n()
  const sectionTitles = messages.workflow.sections
  const resolvedTitle =
    title ??
    (workflowFinishId === 'fuel'
      ? messages.workflow.fuelOnly.title
      : workflowFinishId === 'vsa'
        ? messages.workflow.vsa.title
        : messages.workflow.transport.title)
  const resolvedSubtitle =
    subtitle ??
    (workflowFinishId === 'fuel'
      ? messages.workflow.fuelOnly.subtitle
      : workflowFinishId === 'vsa'
        ? messages.workflow.vsa.subtitle
        : messages.workflow.transport.subtitle)

  const tutorialSteps = useMemo(() => {
    if (tutorialConfig?.storageKey === VSA_TUTORIAL_STORAGE_KEY) {
      return getVsaTutorialSteps(messages.tutorials.vsa)
    }
    return getTransportTutorialSteps(messages.tutorials.transport)
  }, [messages, tutorialConfig?.storageKey])

  const tutorialStorageKey =
    tutorialConfig?.storageKey ?? TRANSPORT_TUTORIAL_STORAGE_KEY

  const finishWorkflowId =
    workflowFinishId ??
    (resolvedTitle.toLowerCase() === messages.workflow.vsa.title.toLowerCase()
      ? 'vsa'
      : 'transport')
  const captureUi = import.meta.env.DEV ? readCaptureUiFlags() : null
  const [expandedSection, setExpandedSection] = useState<WorkflowSection | null>(() =>
    captureUi?.expandedSection ?? initialExpanded(sections, defaultExpanded),
  )
  const [acknowledgedSections, setAcknowledgedSections] = useState<WorkflowSection[]>(
    () => loadPersistedWorkflow()?.acknowledgedSections ?? [],
  )
  const [showScanner, setShowScanner] = useState(() => captureUi?.showScanner ?? false)
  const [scannerTarget, setScannerTarget] = useState<'fuel' | 'cleaning'>(() =>
    captureUi?.scannerTarget ?? 'fuel',
  )
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const odometerRef = useRef<HTMLDivElement>(null)
  const completeHintId = useId()
  const [showCompleteHint, setShowCompleteHint] = useState(false)
  const sectionRefs = useRef<Partial<Record<WorkflowSection, HTMLDivElement | null>>>({})
  const tutorial = useTutorial({
    storageKey: tutorialStorageKey,
    steps: tutorialSteps,
    forceStart: forceTutorial,
  })

  useEffect(() => {
    if (!tutorial.active || !tutorial.step?.expandSection) return
    setExpandedSection(tutorial.step.expandSection)
  }, [tutorial.active, tutorial.step])

  useEffect(() => {
    return onTutorialWorkflowRestore((snapshot) => {
      setAcknowledgedSections(snapshot?.acknowledgedSections ?? [])
    })
  }, [])

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
  const fuelPumpReportCompletionEligible = hasFuelPumpReportCompletionEligibility(context)
  const fuelStatus: SectionStatus =
    context.fuelStep === 'fueling-complete-missing'
      ? 'missing'
      : context.fuelComplete
        ? 'complete'
        : context.fuelStep === 'fueling-complete' ||
            context.fuelStep === 'additional-fueling-complete' ||
            fuelPumpReportCompletionEligible
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

  const isSectionExpanded = (section: WorkflowSection) => {
    if (expandedSection !== section) return false
    return !(
      sectionStatus[section] === 'complete' &&
      acknowledgedSections.includes(section)
    )
  }

  const toggleSection = (section: WorkflowSection) => {
    if (isSectionDisabled(section)) return
    if (expandedSection === section) {
      setExpandedSection(null)
      return
    }
    setExpandedSection(section)
  }

  const fuelWorkflowContext = {
    fuelStep: context.fuelStep,
    unlockMode: context.unlockMode,
    locationType: context.locationType,
    fuelStartedAt: context.fuelStartedAt,
    fuelComplete: context.fuelComplete,
    isAdditionalFueling: context.isAdditionalFueling,
    fuelTransactions: context.fuelTransactions,
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
    const mainEl = mainRef.current
    const odometerEl = odometerRef.current
    if (mainEl && odometerEl) {
      requestAnimationFrame(() => {
        scrollElementIntoWorkflowView(mainEl, odometerEl)
      })
    }
    const input = odometerEl?.querySelector('input')
    if (input instanceof HTMLInputElement) {
      window.setTimeout(() => input.focus(), 350)
    }
  }

  const focusWorkflowSection = (section: WorkflowSection) => {
    if (isSectionDisabled(section)) return

    const wasExpanded = expandedSection === section
    setExpandedSection(section)

    if (wasExpanded) {
      const mainEl = mainRef.current
      const sectionEl = sectionRefs.current[section]
      if (mainEl && sectionEl) {
        requestAnimationFrame(() => {
          applyWorkflowScroll(mainEl, {
            expandedSection: section,
            expandedSectionEl: sectionEl,
          })
        })
      }
    }
  }

  const handleComplete = () => {
    if (workflowReady && !completableSection) {
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
      onAction('workflow-finish', finishWorkflowId)
    }
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
        onAction('scan-complete', payload)
        break
      case 'manual-entry':
        onAction('manual-entry')
        break
      case 'back-to-scan':
        onAction('back-to-scan')
        break
      case 'wrong-pump':
        onAction('wrong-pump')
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
    ? getMileageIssueLabel(mileageIssues[0], messages.vehicle.mileageIssues)
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
  const completeDisabledReason = canComplete
    ? undefined
    : getCompleteDisabledReason(
        completableSection,
        sectionTitles,
        sections,
        sectionStatus,
        messages.workflow.complete,
        context.odometerReading,
        fuelWorkflowContext,
        workflowReady,
        mileageState,
        mileageOptions,
        messages.vehicle,
        language === 'es' ? 'es-US' : 'en-US',
      )
  const vehicleSummary = getVehicleSummary(
    sections,
    sectionStatus,
    context,
    vehicleProfile,
    messages,
  )

  const handleStallAction = (action: string, payload?: string) => {
    if (!isStallSectionUnlocked(context)) return
    onStallAction(action, payload)
  }

  const focusBlockedCompleteTarget = () => {
    const odometerBlocked = !hasResolvedOdometer(
      context.odometerReading,
      mileageState,
      mileageOptions,
    )

    if (odometerBlocked) {
      scrollToOdometer()
      return
    }

    const section = getSectionNeedingAttention(
      sections,
      sectionStatus,
      acknowledgedSections,
      {
        completableSection,
        workflowReady,
        fuelContext: fuelWorkflowContext,
        isSectionDisabled,
      },
    )

    if (section) {
      focusWorkflowSection(section)
    }
  }

  const handleCompletePress = () => {
    if (!canComplete) {
      setShowCompleteHint(true)
      focusBlockedCompleteTarget()
      return
    }
    setShowCompleteHint(false)
    handleComplete()
  }

  useEffect(() => {
    if (canComplete) {
      setShowCompleteHint(false)
    }
  }, [canComplete])

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
            onChangePump={() => handleFuelAction('wrong-pump')}
            onUnlockPump={() => handleFuelAction('unlock-pump')}
            onCancelUnlock={() => handleFuelAction('cancel-unlock')}
            onReportIssue={() => handleFuelAction('report-issue')}
            onFinishFueling={() => handleFuelAction('finish-fueling')}
            onCompleteRemoteFueling={() => handleFuelAction('complete-remote-fueling')}
            onGallonsChange={(value) => handleFuelAction('gallons-change', value)}
            onGallonsCaptureRecord={onGallonsCaptureRecord}
            vehicleUnitId={TRANSPORT_VEHICLE.unitId}
            fuelJobId={`${TRANSPORT_VEHICLE.unitId}-fuel-${context.pumpNumber || 'pending'}-${context.fuelStartedAt ?? 'draft'}`}
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
    <div className="relative flex min-h-0 w-full flex-1 flex-col app-surface">
      <Header
        title={resolvedTitle}
        subtitle={resolvedSubtitle}
        onBack={() => onAction('back')}
        onReportIssue={() => onAction('report-issue')}
        onSignOut={onSignOut}
        onReplayTutorial={tutorial.start}
        confirmOnExit
      />

      <main
        id="main-content"
        ref={mainRef}
        className="app-scroll app-workflow-main min-h-0 flex-1 py-2"
      >
        <div className="app-workflow-scroll-body">
          <div className="app-main-bottom" data-workflow-widget="stack">
          <VehicleCard
            summary={vehicleSummary}
            onReportVehicle={() => onAction('report-issue', 'vehicle')}
            odometer={{
              odometerReading: odometerDisplayValue,
              onOdometerChange: (value) => onAction('odometer-change', value),
              verified: !manualMileageRequired,
              hint: odometerHint,
              minimumMiles: odometerMinimumMiles,
              odometerRef,
            }}
          />
          <AccordionGroup>
            {sections.map((section, index) => {
              const sectionOptional = isSectionOptional(
                section,
                sections,
                sectionStatus,
                fuelWorkflowContext,
              )
              const sectionAwaiting =
                !isSectionExpanded(section) &&
                !isSectionDisabled(section) &&
                !sectionOptional &&
                (sectionStatus[section] === 'not-started' ||
                  sectionStatus[section] === 'in-progress' ||
                  sectionStatus[section] === 'missing')

              return (
                <AccordionSection
                  key={section}
                  title={sectionTitles[section]}
                  status={sectionStatus[section]}
                  statusLabel={sectionOptional ? t('common.optional') : undefined}
                  chipVariant={sectionOptional ? 'optional' : 'default'}
                  highlighted={sectionAwaiting}
                  expanded={isSectionExpanded(section)}
                  disabled={isSectionDisabled(section)}
                  disabledReason={getSectionDisabledReason(
                    section,
                    context,
                    messages.workflow.complete,
                  )}
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
          </div>
        </div>
      </main>

      <footer
        className="app-workflow-footer shrink-0 border-t border-[var(--color-fleet-secondary-border)] pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
        aria-label={t('workflow.completeFooterAria')}
        data-tutorial="complete"
      >
        <CompleteButton
          disabled={!canComplete}
          onClick={handleCompletePress}
          ariaDescribedBy={
            showCompleteHint && completeDisabledReason ? completeHintId : undefined
          }
        />
        {showCompleteHint && completeDisabledReason ? (
          <p
            id={completeHintId}
            className="app-workflow-footer__hint"
            role="status"
            aria-live="polite"
          >
            {completeDisabledReason}
          </p>
        ) : null}
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
        trackPrefix={tutorialConfig?.trackPrefix ?? 'transport.tutorial'}
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
          onScanComplete={(value) => {
            if (scannerTarget === 'cleaning') {
              closeScanner()
              onCleaningAction('scan-complete', value)
            } else {
              handleFuelAction('scan-complete', value)
            }
          }}
        />
    </div>
  )
}
