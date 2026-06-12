import { useState } from 'react'
import type { FlowContext } from '../types/flow'
import { AccordionSection } from './ui/AccordionSection'
import { AlertBanner } from './ui/AlertBanner'
import { CompleteButton } from './ui/CompleteButton'
import { Header } from './ui/Header'
import { VehicleCard } from './ui/VehicleCard'
import { FuelStepContent } from './fuel/FuelStepContent'
import { IssueOverlay } from './fuel/IssueOverlay'
import { ScannerScreen } from './fuel/ScannerScreen'
import { LocationSearchOverlay } from './movement/LocationSearchOverlay'
import { MovementContent } from './movement/MovementContent'

type TransportScreenProps = {
  context: FlowContext
  onAction: (action: string, payload?: string) => void
  onMovementAction: (action: string, payload?: string) => void
}

export function TransportScreen({ context, onAction, onMovementAction }: TransportScreenProps) {
  const [timerCollapsed, setTimerCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    movement: !context.fuelComplete || context.movementComplete,
    fuel: true,
    stall: false,
  })
  const [showScanner, setShowScanner] = useState(false)
  const [showLocationSearch, setShowLocationSearch] = useState(false)

  const movementStatus = context.movementComplete
    ? 'complete'
    : context.movementPhase === 'stall-verify'
      ? 'missing'
      : context.movementPhase === 'select-location' ||
          context.movementPhase === 'select-stall'
        ? 'not-started'
        : 'in-progress'
  const fuelStatus = context.fuelComplete
    ? 'complete'
    : context.fuelStep === 'fueling-complete' ||
        context.fuelStep === 'additional-fueling-complete'
      ? 'complete'
      : context.fuelStep === 'verify-pump'
        ? 'not-started'
        : 'in-progress'
  const stallStatus = context.stallComplete
    ? 'complete'
    : context.screen === 'stall-missing'
      ? 'missing'
      : 'not-started'

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleFuelAction = (action: string) => {
    switch (action) {
      case 'scan':
        setShowScanner(true)
        break
      case 'scan-complete':
        setShowScanner(false)
        onAction('scan-complete')
        break
      case 'manual-entry':
        onAction('manual-entry')
        break
      case 'on-site-unlock':
        onAction('on-site-unlock')
        break
      case 'unlock-pump':
        onAction('unlock-pump')
        break
      case 'start-fueling':
        onAction('start-fueling')
        break
      case 'report-issue':
        onAction('report-issue')
        break
      case 'additional-fueling':
        onAction('additional-fueling')
        break
      case 'retry':
        onAction('retry')
        break
      default:
        break
    }
  }

  const showAlert = context.unavailablePumps.length > 0
  const canComplete =
    context.movementComplete && context.fuelComplete && context.stallComplete

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[360px] flex-col bg-white shadow-xl">
      <Header
        title="Transport"
        subtitle="Fuel Island"
        timerCollapsed={timerCollapsed}
        onToggleTimer={() => setTimerCollapsed((v) => !v)}
        onBack={() => onAction('back')}
      />

      <main className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-4">
          <VehicleCard />
          {showAlert && (
            <AlertBanner
              message={`Pumps Unavailable: ${context.unavailablePumps.join(', ')}`}
            />
          )}

          <div className="flex flex-col gap-0">
            <AccordionSection
              title="Movement"
              status={movementStatus}
              expanded={expandedSections.movement}
              onToggle={() => toggleSection('movement')}
            >
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
            </AccordionSection>

            <div className="-mt-0.5">
              <AccordionSection
                title="Fuel"
                status={fuelStatus}
                expanded={expandedSections.fuel}
                onToggle={() => toggleSection('fuel')}
              >
                <FuelStepContent
                  step={context.fuelStep}
                  pumpNumber={context.pumpNumber}
                  onScanPump={() => handleFuelAction('scan')}
                  onManualEntry={() => handleFuelAction('manual-entry')}
                  onOnSiteUnlock={() => handleFuelAction('on-site-unlock')}
                  onUnlockPump={() => handleFuelAction('unlock-pump')}
                  onReportIssue={() => handleFuelAction('report-issue')}
                  onAdditionalFueling={() => handleFuelAction('additional-fueling')}
                  onRetry={() => handleFuelAction('retry')}
                />
              </AccordionSection>
            </div>

            <div className="-mt-0.5">
              <AccordionSection
                title="Stall"
                status={stallStatus}
                expanded={expandedSections.stall}
                onToggle={() => toggleSection('stall')}
              >
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {stallStatus === 'missing'
                    ? 'Please complete missing stall information before finishing transport.'
                    : 'Confirm vehicle is properly positioned in the stall.'}
                </p>
              </AccordionSection>
            </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 px-4 pb-4 pt-2">
        <CompleteButton
          disabled={!canComplete}
          onClick={() => onAction('complete')}
        />
      </footer>

      {showLocationSearch && (
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
          onBack={() => setShowScanner(false)}
          onManualEntry={() => {
            setShowScanner(false)
            handleFuelAction('manual-entry')
          }}
        />
      )}

      {context.showIssueOverlay && (
        <IssueOverlay
          showDetails={context.screen === 'fueling-issue-details'}
          details={context.issueDetails}
          onClose={() => onAction('close-issue')}
          onSelectIssue={(issue) => onAction('select-issue', issue)}
          onSubmit={() => onAction('submit-issue')}
          onDetailsChange={(value) => onAction('issue-details', value)}
        />
      )}
    </div>
  )
}
