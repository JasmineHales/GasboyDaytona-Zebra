import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  QrCode,
  X,
} from 'lucide-react'
import { ScannerScreen } from './ScannerScreen'

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
  'Pump stopperd fueling',
  'Pump is damaged',
  'Other',
] as const

const CATEGORY_OPTIONS: { id: IssueCategory; label: string }[] = [
  { id: 'vehicle', label: 'Vehicle Issue' },
  { id: 'pump', label: 'Pump Issue' },
]

function OverlayList({
  items,
  onSelect,
}: {
  items: readonly string[]
  onSelect: (item: string) => void
}) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border border-[var(--color-fleet-secondary-border)]">
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className={`field-target flex w-full items-center px-4 py-2 text-left ${
            index < items.length - 1
              ? 'border-b border-[var(--color-fleet-secondary-border)]'
              : ''
          }`}
        >
          <span className="flex-1 py-1 text-sm font-semibold text-[var(--color-fleet-text)]">
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
  centered = false,
  showBack,
  onBack,
  onClose,
}: {
  title: string
  centered?: boolean
  showBack?: boolean
  onBack?: () => void
  onClose: () => void
}) {
  if (!showBack && !centered) {
    return (
      <div className="flex w-full items-center">
        <p className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]">
          {title}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="field-target flex shrink-0 items-center justify-center rounded-full p-2"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-[var(--color-fleet-text)]" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-full items-center">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="field-target flex shrink-0 items-center justify-center rounded-full p-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-[var(--color-fleet-text)]" />
        </button>
      ) : (
        <div className="w-10 shrink-0" />
      )}
      <p className="min-w-0 flex-1 text-center text-lg font-bold text-[var(--color-fleet-text)]">
        {title}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="field-target flex shrink-0 items-center justify-center rounded-full p-2"
        aria-label="Close"
      >
        <X className="h-6 w-6 text-[var(--color-fleet-text)]" />
      </button>
    </div>
  )
}

function TextButton({
  children,
  onClick,
}: {
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fleet-btn fleet-btn-md w-full text-[var(--color-fleet-text-blue)]"
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
}: IssueOverlayProps) {
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
      />
    )
  }

  return (
    <div className="app-overlay bg-white">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-4 py-4">
        <OverlayHeader
          title={step === 'category' ? 'Report Issue' : headerTitle}
          showBack={step !== 'category' && !(source === 'fuel' && step === initial.step)}
          onBack={handleBack}
          onClose={onClose}
        />

        {showPumpSubtitle && (
          <p className="text-center text-base font-semibold text-[var(--color-fleet-text)]">
            Pump {pumpNumber}
          </p>
        )}

        <div className="app-scroll flex min-h-0 flex-1 flex-col">
          {step === 'category' && (
            <div className="flex flex-1 flex-col justify-center gap-2 pb-4">
              <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                What&apos;s the issue?
              </p>
              <OverlayList
                items={CATEGORY_OPTIONS.map((o) => o.label)}
                onSelect={(label) => {
                  const option = CATEGORY_OPTIONS.find((o) => o.label === label)
                  if (option) handleCategorySelect(option.id)
                }}
              />
            </div>
          )}

          {step === 'select-pump' && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                  Select Pump
                </p>
                <p className="text-xs text-[var(--color-fleet-text-secondary)]">
                  Scan Pump
                </p>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex w-full flex-col gap-4 rounded-xl border border-[#7ccffd] bg-white px-6 pb-5 pt-6 text-left"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative flex h-24 w-24 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[var(--color-fleet-info-ring)] opacity-60" />
                      <QrCode className="relative h-14 w-14 text-[var(--color-fleet-info)]" />
                    </div>
                    <p className="text-center text-base font-semibold text-[var(--color-fleet-text-blue-secondary)]">
                      Scan Pump QR
                    </p>
                  </div>
                  <p className="text-center text-xs text-[var(--color-fleet-text-secondary)]">
                    Scan the QR code at your pump
                  </p>
                  <span className="fleet-btn fleet-btn-md fleet-btn-contained-info fleet-btn-elevated w-full">
                    <QrCode className="h-5 w-5" />
                    Scan Pump
                  </span>
                </button>
                <p className="text-center text-sm font-bold text-[var(--color-fleet-text)]">
                  OR
                </p>
                <p className="text-xs text-[var(--color-fleet-text-secondary)]">
                  Enter Manually
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pumpNumber}
                  onChange={(e) => setPumpNumber(e.target.value)}
                  placeholder="Enter pump no."
                  className="w-full rounded border border-[var(--color-fleet-secondary-border)] px-3 py-4 text-base text-[var(--color-fleet-text)] outline-none focus:border-[var(--color-fleet-info)]"
                />
              </div>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <button
                  type="button"
                  disabled={!canContinuePump}
                  onClick={() => setStep('issue-type')}
                  className={`fleet-btn fleet-btn-md w-full ${
                    canContinuePump
                      ? 'fleet-btn-contained-info fleet-btn-elevated'
                      : 'cursor-not-allowed bg-[rgba(45,47,49,0.12)] text-[rgba(45,47,49,0.38)]'
                  }`}
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
                onSelect={(issue) => {
                  setIssueType(issue)
                  setStep('details')
                }}
              />
            </div>
          )}

          {step === 'details' && (
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-1 flex-col gap-2 pb-4">
                <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                  Additional details?
                </p>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Tell us more (optional)"
                  className="h-56 w-full resize-none rounded-lg border border-[var(--color-fleet-secondary-border)] p-3 text-base text-[var(--color-fleet-text)] outline-none focus:border-[var(--color-fleet-info)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setStep('confirmation')}
                  className="fleet-btn fleet-btn-md fleet-btn-contained-info fleet-btn-elevated w-full"
                >
                  Continue
                </button>
                <TextButton onClick={onClose}>Cancel</TextButton>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="flex flex-1 flex-col rounded-xl bg-[var(--color-fleet-info-surface)] p-6">
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#b9e4fe]">
                  <Check className="h-8 w-8 text-[var(--color-fleet-info)]" strokeWidth={3} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-bold text-[#111827]">Issue Reported</p>
                  <p className="text-sm leading-normal text-[#4b5563]">
                    Thank you for letting us know. We&apos;ll look into this and get back to
                    you soon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onComplete(reportData)}
                  className="fleet-btn fleet-btn-md fleet-btn-outlined w-full border-[var(--color-fleet-info)] text-[var(--color-fleet-text-blue)]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
