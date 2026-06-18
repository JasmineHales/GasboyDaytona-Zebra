import { useId, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  X,
} from 'lucide-react'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { PumpVerifyCard } from '../ui/PumpVerifyCard'
import { ScannerScreen } from './ScannerScreen'
import { TextAreaField, TextField } from '../ui/TextField'
import { slugifyTrackValue, trackProps } from '../../utils/tracking'
import type { VehicleSummary } from '../../utils/vehicleSummary'

type Step = 'category' | 'select-pump' | 'issue-type' | 'details' | 'confirmation'

type IssueCategory = 'vehicle' | 'pump'

export type IssueReportData = {
  category: IssueCategory
  pumpNumber: string
  issueType: string
  details: string
}

type IssueOverlayProps = {
  onClose: () => void
  onComplete: (data: IssueReportData) => void
  defaultPumpNumber?: string
  source?: 'header' | 'fuel'
  vehicle?: Pick<VehicleSummary, 'unitId' | 'name'>
}

function initialOverlayState(
  source: 'header' | 'fuel',
  defaultPumpNumber: string,
): { step: Step; category: IssueCategory | null } {
  if (source === 'fuel') {
    return {
      category: 'pump',
      step: defaultPumpNumber.trim().length > 0 ? 'issue-type' : 'select-pump',
    }
  }
  return { step: 'category', category: null }
}

const PUMP_ISSUES = [
  "Pump won't unlock",
  "Pump won't start fueling",
  'Pump stopped fueling',
  'Pump is damaged',
  'Other',
] as const

type CategoryOption = {
  id: IssueCategory
  label: string
  description: string
  disabled?: boolean
}

function getCategoryOptions(vehicle?: Pick<VehicleSummary, 'unitId' | 'name'>): CategoryOption[] {
  const vehicleDescription = vehicle
    ? `Problem with ${vehicle.unitId} · ${vehicle.name} — the vehicle assigned to this workflow.`
    : 'Start Transport or VSA to report an issue for the vehicle you are working on.'

  return [
    {
      id: 'vehicle',
      label: 'Vehicle Issue',
      description: vehicleDescription,
      disabled: !vehicle,
    },
    {
      id: 'pump',
      label: 'Pump Issue',
      description:
        'Report from the Fuel section using Report Issue there. That keeps your session open and lets you start a new transaction after reporting.',
      disabled: true,
    },
  ]
}

function IssueCategoryList({
  options,
  onSelect,
}: {
  options: CategoryOption[]
  onSelect: (category: IssueCategory) => void
}) {
  return (
    <div className="issue-category-list">
      {options.map((option) => {
        const hintId = `issue-category-${option.id}-hint`

        if (option.disabled) {
          return (
            <div
              key={option.id}
              className="issue-category-option issue-category-option--disabled"
              role="note"
              aria-labelledby={`issue-category-${option.id}-label`}
              aria-describedby={hintId}
            >
              <div className="issue-category-option__body">
                <p id={`issue-category-${option.id}-label`} className="issue-category-option__label">
                  {option.label}
                </p>
                <p id={hintId} className="issue-category-option__hint">
                  {option.description}
                </p>
              </div>
            </div>
          )
        }

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className="issue-category-option field-target"
            aria-describedby={hintId}
            {...trackProps(`issue.category.${option.id}`)}
          >
            <div className="issue-category-option__body">
              <p id={`issue-category-${option.id}-label`} className="issue-category-option__label">
                {option.label}
              </p>
              <p id={hintId} className="issue-category-option__hint">
                {option.description}
              </p>
            </div>
            <ChevronRight
              className="issue-category-option__chevron"
              aria-hidden
            />
          </button>
        )
      })}
    </div>
  )
}

function OverlayList({
  items,
  onSelect,
  trackPrefix,
}: {
  items: readonly string[]
  onSelect: (item: string) => void
  trackPrefix: string
}) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border border-[var(--color-fleet-secondary-border)]">
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className={`field-target flex w-full items-center px-4 text-left ${
            index < items.length - 1
              ? 'border-b border-[var(--color-fleet-secondary-border)]'
              : ''
          }`}
          {...trackProps(`${trackPrefix}.${slugifyTrackValue(item)}`)}
        >
          <span className="flex-1 py-2 text-base font-semibold text-[var(--color-fleet-text)]">
            {item}
          </span>
          <ChevronRight className="h-10 w-10 shrink-0 text-[var(--color-fleet-text-secondary)]" />
        </button>
      ))}
    </div>
  )
}

function OverlayHeader({
  title,
  subtitle,
  titleId,
  centered = false,
  showBack,
  onBack,
  onClose,
}: {
  title: string
  subtitle?: string
  titleId: string
  centered?: boolean
  showBack?: boolean
  onBack?: () => void
  onClose: () => void
}) {
  const toolbar =
    !showBack && !centered ? (
      <div className="flex w-full items-center">
        <p
          id={titleId}
          className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
        >
          {title}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="field-target flex shrink-0 items-center justify-center rounded-full p-2"
          aria-label="Close"
          {...trackProps('issue.close')}
        >
          <X className="h-6 w-6 text-[var(--color-fleet-text)]" />
        </button>
      </div>
    ) : (
      <div className="flex w-full items-center">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="field-target flex shrink-0 items-center justify-center rounded-full p-2"
            aria-label="Go back"
            {...trackProps('issue.back')}
          >
            <ArrowLeft className="h-6 w-6 text-[var(--color-fleet-text)]" />
          </button>
        ) : (
          <div className="w-10 shrink-0" />
        )}
        <p
          id={titleId}
          className="min-w-0 flex-1 text-center text-lg font-bold text-[var(--color-fleet-text)]"
        >
          {title}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="field-target flex shrink-0 items-center justify-center rounded-full p-2"
          aria-label="Close"
          {...trackProps('issue.close')}
        >
          <X className="h-6 w-6 text-[var(--color-fleet-text)]" />
        </button>
      </div>
    )

  return (
    <div className="shrink-0">
      {toolbar}
      {subtitle && (
        <p className="mt-2 text-left text-[length:var(--text-ui-sm)] leading-relaxed text-[var(--color-fleet-text-secondary)]">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function TextButton({
  children,
  onClick,
  trackTag = 'issue.cancel',
}: {
  children: string
  onClick: () => void
  trackTag?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fleet-btn fleet-btn-lg fleet-btn-link w-full"
      {...trackProps(trackTag)}
    >
      {children}
    </button>
  )
}

export function IssueOverlay({
  onClose,
  onComplete,
  defaultPumpNumber = '',
  source = 'header',
  vehicle,
}: IssueOverlayProps) {
  const titleId = useId()
  const fuelPumpPrefilled =
    source === 'fuel' && defaultPumpNumber.trim().length > 0
  const initial = initialOverlayState(source, defaultPumpNumber)
  const [step, setStep] = useState<Step>(initial.step)
  const [category, setCategory] = useState<IssueCategory | null>(initial.category)
  const [pumpNumber, setPumpNumber] = useState(defaultPumpNumber)
  const [issueType, setIssueType] = useState('')
  const [details, setDetails] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  const isPumpFlow = category === 'pump' || source === 'fuel'
  const headerTitle = isPumpFlow ? 'Report Fuelling Issue' : 'Report Issue'
  const overlaySubtitle =
    source === 'fuel'
      ? 'Your fuelling session stays open behind this form. Tap outside or Cancel to go back.'
      : step === 'category'
        ? 'Choose the type of issue. Pump problems must be reported from the Fuel section.'
        : 'Your workflow stays open behind this form. Tap outside or Cancel to go back.'
  const showPumpSubtitle =
    isPumpFlow && pumpNumber.trim().length > 0 && step !== 'select-pump'

  const handleBack = () => {
    switch (step) {
      case 'select-pump':
        if (source === 'fuel') onClose()
        else setStep('category')
        break
      case 'issue-type':
        if (source === 'fuel') {
          if (fuelPumpPrefilled) onClose()
          else setStep('select-pump')
        } else {
          setStep('select-pump')
        }
        break
      case 'details':
        setStep(isPumpFlow ? 'issue-type' : 'category')
        break
      case 'confirmation':
        setStep('details')
        break
      default:
        break
    }
  }

  const handleCategorySelect = (selected: IssueCategory) => {
    setCategory(selected)
    if (selected === 'pump') {
      setStep('select-pump')
    } else {
      setIssueType('Vehicle Issue')
      setStep('details')
    }
  }

  const handleScanComplete = () => {
    setPumpNumber('5')
    setShowScanner(false)
    setStep('issue-type')
  }

  const canContinuePump = pumpNumber.trim().length > 0

  const reportData: IssueReportData = {
    category: category ?? 'pump',
    pumpNumber,
    issueType,
    details,
  }

  if (showScanner) {
    return (
      <ScannerScreen
        onBack={() => setShowScanner(false)}
        onManualEntry={() => setShowScanner(false)}
        onScanComplete={handleScanComplete}
        trackPrefix="issue.scanner"
      />
    )
  }

  return (
    <BottomSheetOverlay
      open
      onDismiss={onClose}
      dismissTrackTag="issue.dismiss-backdrop"
      labelId={titleId}
    >
      <div className="flex min-h-[50dvh] max-h-[92dvh] flex-col gap-2 overflow-hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <OverlayHeader
          titleId={titleId}
          title={step === 'category' ? 'Report Issue' : headerTitle}
          subtitle={step === 'confirmation' ? undefined : overlaySubtitle}
          showBack={step !== 'category' && !(source === 'fuel' && step === initial.step)}
          onBack={handleBack}
          onClose={onClose}
        />

        {showPumpSubtitle && (
          <div className="issue-overlay-pump" role="status" aria-label={`Pump ${pumpNumber}`}>
            <p className="issue-overlay-pump__label">Pump</p>
            <p className="issue-overlay-pump__value">{pumpNumber}</p>
          </div>
        )}

        <div className="app-scroll flex min-h-0 flex-1 flex-col">
          {step === 'category' && (
            <div className="flex flex-1 flex-col justify-center gap-2 pb-4">
              <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                What&apos;s the issue?
              </p>
              <IssueCategoryList
                options={getCategoryOptions(vehicle)}
                onSelect={handleCategorySelect}
              />
            </div>
          )}

          {step === 'select-pump' && (
            <>
              <div className="workflow-stack">
                <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                  Select Pump
                </p>
                <PumpVerifyCard
                  buttonLabel="Scan Pump"
                  onClick={() => setShowScanner(true)}
                  trackScan="issue.select-pump.scan"
                />
                <p className="text-center text-sm font-bold text-[var(--color-fleet-text)]">
                  OR
                </p>
                <TextField
                  label="Enter Manually"
                  value={pumpNumber}
                  onChange={setPumpNumber}
                  placeholder="Enter pump no."
                  inputMode="numeric"
                  clearTrackTag="issue.select-pump.clear"
                />
              </div>
              <div className="workflow-stack mt-auto pt-4">
                <button
                  type="button"
                  disabled={!canContinuePump}
                  onClick={() => setStep('issue-type')}
                  className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
                  {...trackProps('issue.select-pump.continue')}
                >
                  Continue
                </button>
                <TextButton onClick={onClose}>Cancel</TextButton>
              </div>
            </>
          )}

          {step === 'issue-type' && (
            <div className="flex flex-1 flex-col justify-center gap-2 pb-4">
              <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                What&apos;s the issue?
              </p>
              <OverlayList
                items={PUMP_ISSUES}
                trackPrefix="issue.type"
                onSelect={(issue) => {
                  setIssueType(issue)
                  setStep('details')
                }}
              />
            </div>
          )}

          {step === 'details' && (
            <div className="flex flex-1 flex-col gap-2">
              {category === 'vehicle' && vehicle && (
                <p className="issue-category-context">
                  Reporting for {vehicle.unitId} · {vehicle.name}
                </p>
              )}
              <div className="flex flex-1 flex-col gap-2 pb-4">
                <TextAreaField
                  label="Additional details?"
                  value={details}
                  onChange={setDetails}
                  placeholder="Tell us more (optional)"
                  clearTrackTag="issue.details.clear"
                />
              </div>
              <div className="workflow-stack">
                <button
                  type="button"
                  onClick={() => setStep('confirmation')}
                  className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
                  {...trackProps('issue.details.continue')}
                >
                  Continue
                </button>
                <TextButton onClick={onClose}>Cancel</TextButton>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="flex flex-1 flex-col rounded-xl bg-[var(--color-fleet-info-surface)] p-6">
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="status">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--color-hertz-yellow-surface)]">
                  <Check className="h-8 w-8 text-[var(--color-fleet-info)]" strokeWidth={3} aria-hidden />
                </div>
                <div className="workflow-stack">
                  <p className="text-xl font-bold text-[var(--color-fleet-text)]">Issue Reported</p>
                  <p className="text-sm leading-normal text-[var(--color-fleet-text-secondary)]">
                    Thank you for letting us know. We&apos;ll look into this and get back to
                    you soon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onComplete(reportData)}
                  className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full border-[var(--color-fleet-info)] text-[var(--color-fleet-text-blue)]"
                  {...trackProps('issue.confirmation.done')}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
