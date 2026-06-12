import { useEffect, useRef, useState } from 'react'
import type { FlowContext, SectionStatus, WorkflowSection } from '../types/flow'
import { CleaningContent } from './cleaning/CleaningContent'
import { AccordionGroup, AccordionSection } from './ui/AccordionSection'
import { AlertBanner } from './ui/AlertBanner'
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
  context: FlowContext
  onAction: (action: string, payload?: string) => void
  onMovementAction: (action: string, payload?: string) => void
  onStallAction: (action: string, payload?: string) => void
  onCleaningAction: (action: string, payload?: string) => void
}

export function TransportScreen({
  title = 'Transport',
  subtitle = 'Fuel Island',
  sections = DEFAULT_SECTIONS,
  defaultExpanded,
  vehicleProfile = TRANSPORT_VEHICLE,
  context,
  onAction,
  onMovementAction,
  onStallAction,
  onCleaningAction,
}: TransportScreenProps) {
  const [expandedSection, setExpandedSection] = useState<WorkflowSection | null>(() =>
    initialExpanded(sections, defaultExpanded),
  )
  const [acknowledgedSections, setAcknowledgedSections] = useState<WorkflowSection[]>(
    [],
  )
  const [showScanner, setShowScanner] = useState(false)
  const [scannerTarget, setScannerTarget] = useState<'fuel' | 'cleaning'>('fuel')
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const sectionRefs = useRef<Partial<Record<WorkflowSection, HTMLDivElement | null>>>({})

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
          : context.fuelStep === 'verify-pump' && !context.isAdditionalFueling
            ? 'not-started'
            : 'in-progress'
  const stallUnlocked = context.fuelComplete || context.cleaningComplete
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

  const completableSection = sections.find(
    (section) =>
      sectionStatus[section] === 'complete' &&
      !acknowledgedSections.includes(section),
  )

  const handleComplete = () => {
    if (!completableSection) return

    onAction('complete', completableSection)
    setAcknowledgedSections((prev) => [...prev, completableSection])
  }

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
    const mainEl = mainRef.current
    if (!mainEl) return

    const scrollToBottom = () => {
      mainEl.scrollTop = Math.max(0, mainEl.scrollHeight - mainEl.clientHeight)
    }

    const scrollExpandedIntoView = () => {
      if (!expandedSection) {
        scrollToBottom()
        return
      }

      const sectionEl = sectionRefs.current[expandedSection]
      if (!sectionEl) return

      const padding = 8
      const mainRect = mainEl.getBoundingClientRect()
      const headerEl =
        sectionEl.querySelector<HTMLElement>('[data-accordion-scroll-header]') ??
        sectionEl
      const headerRect = headerEl.getBoundingClientRect()
      const headerTop = headerRect.top - mainRect.top + mainEl.scrollTop

      // Align section header + step content from the top; page scroll handles overflow below.
      mainEl.scrollTo({
        top: Math.max(0, headerTop - padding),
        behavior: 'smooth',
      })
    }

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(scrollExpandedIntoView)
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

  const showAlert = context.unavailablePumps.length > 0
  const hasSectionInProgress = sections.some(
    (section) => sectionStatus[section] === 'in-progress',
  )
  const canComplete =
    completableSection !== undefined && !hasSectionInProgress
  const vehicleSummary = getVehicleSummary(sections, sectionStatus, context, vehicleProfile)

  const renderSectionContent = (section: WorkflowSection) => {
    switch (section) {
      case 'cleaning':
        return (
          <CleaningContent
            step={context.cleaningStep}
            pumpNumber={context.cleaningPumpNumber}
            finalTime={context.cleaningFinalTime}
            startedAt={context.cleaningStartedAt}
            onScanPump={() => openScanner('cleaning')}
            onManualEntry={() => onCleaningAction('manual-entry')}
            onBackToScan={() => onCleaningAction('back-to-scan')}
            onPumpChange={(value) => onCleaningAction('pump-change', value)}
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
            onScanPump={() => handleFuelAction('scan')}
            onManualEntry={() => handleFuelAction('manual-entry')}
            onBackToScan={() => handleFuelAction('back-to-scan')}
            onPumpChange={(value) => handleFuelAction('pump-change', value)}
            onClearPump={() => handleFuelAction('clear-pump')}
            onOnSiteUnlock={() => handleFuelAction('on-site-unlock')}
            onStartFueling={() => handleFuelAction('start-fueling')}
            onUnlockPump={() => handleFuelAction('unlock-pump')}
            onCancelUnlock={() => handleFuelAction('cancel-unlock')}
            onReportIssue={() => handleFuelAction('report-issue')}
            onFinishFueling={() => handleFuelAction('finish-fueling')}
            onGallonsChange={(value) => handleFuelAction('gallons-change', value)}
            onRetry={() => handleFuelAction('retry')}
          />
        )
      case 'stall':
        return (
          <StallContent
            phase={context.stallPhase}
            stallNumber={context.stallSectionNumber}
            onStallSelect={(stall) => onStallAction('stall-select', stall)}
            onStallClear={() => onStallAction('stall-clear')}
            onTakePhoto={() => onStallAction('take-photo')}
            onRetakePhoto={() => onStallAction('retake-photo')}
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
        onSignOut={() => onAction('back')}
      />

      <main
        ref={mainRef}
        className="app-scroll flex min-h-0 flex-1 flex-col px-3 py-2 sm:px-4 md:px-6 md:py-3"
      >
        <div className="mt-auto flex w-full flex-col gap-4">
          <div className="flex shrink-0 flex-col gap-3">
            <VehicleCard summary={vehicleSummary} />
            {showAlert && (
              <AlertBanner
                message={`Pumps Unavailable: ${context.unavailablePumps.join(', ')}`}
              />
            )}
          </div>

          <div className="w-full shrink-0">
            <AccordionGroup>
              {sections.map((section, index) => (
                <AccordionSection
                  key={section}
                  title={SECTION_TITLES[section]}
                  status={sectionStatus[section]}
                  expanded={expandedSection === section}
                  disabled={isSectionDisabled(section)}
                  onToggle={() => toggleSection(section)}
                  isLast={index === sections.length - 1}
                  sectionRef={(el) => {
                    sectionRefs.current[section] = el
                  }}
                >
                  {renderSectionContent(section)}
                </AccordionSection>
              ))}
            </AccordionGroup>
          </div>
        </div>
      </main>

      <footer className="shrink-0 border-t border-[var(--color-fleet-secondary-border)] px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 md:px-6">
        <CompleteButton
          disabled={!canComplete}
          onClick={handleComplete}
        />
      </footer>

      {sections.includes('movement') && showLocationSearch && (
        <LocationSearchOverlay
          onClose={() => setShowLocationSearch(false)}
          onSelect={(location) => {
            setShowLocationSearch(false)
            onMovementAction('location-select', location)
          }}
        />
      )}

      {showScanner && (
        <ScannerScreen
          onBack={closeScanner}
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
      )}

    </div>
  )
}
