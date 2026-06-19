import { useId, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { PumpVerifyCard } from '../ui/PumpVerifyCard'
import { ScannerScreen } from './ScannerScreen'
import { TextAreaField, TextField } from '../ui/TextField'
import { slugifyTrackValue, trackProps } from '../../utils/tracking'
import {
  ISSUE_VEHICLE_OPTIONS,
  type IssueVehicleOption,
} from '../../utils/vehicleSummary'
import type { VehicleSummary } from '../../utils/vehicleSummary'
import type { Messages } from '../../i18n/types'

type Step =
  | 'category'
  | 'select-pump'
  | 'select-vehicle'
  | 'issue-type'
  | 'details'
  | 'confirmation'

type IssueCategory = 'vehicle' | 'pump'

type ScannerContext = 'pump' | 'vehicle'

const VEHICLE_SCAN = {
  resolveUnitId: 'SIL',
  trackPrefix: 'issue.select-vehicle.scan',
} as const

export type IssueReportData = {
  category: IssueCategory
  pumpNumber: string
  issueType: string
  details: string
  vehicleUnitId?: string
  vehicleName?: string
}

type IssueOverlayProps = {
  onClose: () => void
  onComplete: (data: IssueReportData) => void
  defaultPumpNumber?: string
  source?: 'header' | 'fuel' | 'vehicle'
  vehicle?: Pick<VehicleSummary, 'unitId' | 'name'>
}

function resolveIssueVehicle(
  vehicle?: Pick<VehicleSummary, 'unitId' | 'name'>,
): IssueVehicleOption | null {
  if (!vehicle) return null

  return (
    ISSUE_VEHICLE_OPTIONS.find((option) => option.unitId === vehicle.unitId) ?? {
      unitId: vehicle.unitId,
      name: vehicle.name,
      vehicleClass: '',
    }
  )
}

function initialOverlayState(
  source: 'header' | 'fuel' | 'vehicle',
  defaultPumpNumber: string,
): { step: Step; category: IssueCategory | null } {
  if (source === 'fuel') {
    return {
      category: 'pump',
      step: defaultPumpNumber.trim().length > 0 ? 'issue-type' : 'select-pump',
    }
  }
  if (source === 'vehicle') {
    return { category: 'vehicle', step: 'details' }
  }
  return { step: 'category', category: null }
}

type CategoryOption = {
  id: IssueCategory
  label: string
  description: string
  disabled?: boolean
}

function getCategoryOptions(
  source: 'header' | 'fuel' | 'vehicle',
  vehicle: Pick<VehicleSummary, 'unitId' | 'name'> | undefined,
  issue: Messages['issue'],
): CategoryOption[] {
  const vehicleDescription = vehicle
    ? issue.vehicleReportFor
        .replace('{unitId}', vehicle.unitId)
        .replace('{name}', vehicle.name)
    : issue.vehicleIssueDesc

  const pumpDescription =
    source === 'fuel' ? issue.pumpIssueDuringSession : issue.pumpGeneralDesc

  return [
    {
      id: 'vehicle',
      label: issue.vehicleIssue,
      description: vehicleDescription,
    },
    {
      id: 'pump',
      label: issue.pumpIssue,
      description: pumpDescription,
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

function VehicleSelectList({
  vehicles,
  onSelect,
}: {
  vehicles: IssueVehicleOption[]
  onSelect: (vehicle: IssueVehicleOption) => void
}) {
  if (vehicles.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--color-fleet-text-secondary)]">
        No vehicles match your search.
      </p>
    )
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border border-[var(--color-fleet-secondary-border)]">
      {vehicles.map((vehicle, index) => (
        <button
          key={vehicle.unitId}
          type="button"
          onClick={() => onSelect(vehicle)}
          className={`field-target flex w-full items-center gap-3 px-4 text-left ${
            index < vehicles.length - 1
              ? 'border-b border-[var(--color-fleet-secondary-border)]'
              : ''
          }`}
          {...trackProps('issue.select-vehicle.choose', {
            unit: slugifyTrackValue(vehicle.unitId),
          })}
        >
          <div className="min-w-0 flex-1 py-3">
            <p className="text-base font-semibold text-[var(--color-fleet-text)]">
              <span>{vehicle.unitId}</span>
              <span className="text-[var(--color-fleet-text-secondary)]"> · </span>
              <span>{vehicle.name}</span>
            </p>
            <p className="text-sm text-[var(--color-fleet-text-secondary)]">
              {vehicle.vehicleClass}
            </p>
          </div>
          <ChevronRight className="h-10 w-10 shrink-0 text-[var(--color-fleet-text-secondary)]" />
        </button>
      ))}
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
  const { t } = useI18n()
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
          aria-label={t('common.close')}
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
            aria-label={t('header.goBack')}
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
          aria-label={t('common.close')}
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
  const { messages, t } = useI18n()
  const titleId = useId()
  const fuelPumpPrefilled =
    source === 'fuel' && defaultPumpNumber.trim().length > 0
  const initial = initialOverlayState(source, defaultPumpNumber)
  const [step, setStep] = useState<Step>(initial.step)
  const [category, setCategory] = useState<IssueCategory | null>(initial.category)
  const [pumpNumber, setPumpNumber] = useState(defaultPumpNumber)
  const [selectedVehicle, setSelectedVehicle] = useState<IssueVehicleOption | null>(() =>
    source === 'vehicle' ? resolveIssueVehicle(vehicle) : null,
  )
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [issueType, setIssueType] = useState(
    source === 'vehicle' ? messages.issue.vehicleIssue : '',
  )
  const [details, setDetails] = useState('')
  const [scannerContext, setScannerContext] = useState<ScannerContext | null>(null)

  const isPumpFlow = category === 'pump' || source === 'fuel'
  const headerTitle =
    source === 'vehicle'
      ? messages.issue.reportVehicleIssue
      : isPumpFlow
        ? messages.issue.reportFuellingIssue
        : messages.issue.reportIssue
  const overlaySubtitle =
    source === 'vehicle'
      ? vehicle
        ? t('issue.reportingFor', { unitId: vehicle.unitId, name: vehicle.name })
        : messages.issue.workflowStaysOpen
      : source === 'fuel'
        ? messages.issue.fuellingStaysOpen
        : step === 'category'
          ? messages.issue.chooseCategory
          : messages.issue.workflowStaysOpen
  const showPumpSubtitle =
    isPumpFlow && pumpNumber.trim().length > 0 && step !== 'select-pump'

  const filteredVehicles = useMemo(() => {
    const query = vehicleQuery.trim().toLowerCase()
    if (!query) return ISSUE_VEHICLE_OPTIONS

    return ISSUE_VEHICLE_OPTIONS.filter(
      (vehicle) =>
        vehicle.unitId.toLowerCase().includes(query) ||
        vehicle.name.toLowerCase().includes(query) ||
        vehicle.vehicleClass.toLowerCase().includes(query),
    )
  }, [vehicleQuery])

  const handleBack = () => {
    switch (step) {
      case 'select-pump':
        if (source === 'fuel') onClose()
        else setStep('category')
        break
      case 'select-vehicle':
        setStep('category')
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
        if (source === 'vehicle') {
          onClose()
          break
        }
        if (isPumpFlow) setStep('issue-type')
        else setStep('select-vehicle')
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
      setIssueType(messages.issue.vehicleIssue)
      setStep('select-vehicle')
    }
  }

  const handleVehicleSelect = (vehicleOption: IssueVehicleOption) => {
    setSelectedVehicle(vehicleOption)
    setStep('details')
  }

  const resolveVehicleByUnitId = (unitId: string) => {
    const match = ISSUE_VEHICLE_OPTIONS.find((option) => option.unitId === unitId)
    if (match) handleVehicleSelect(match)
  }

  const handlePumpScanComplete = () => {
    setPumpNumber('5')
    setScannerContext(null)
    setStep('issue-type')
  }

  const handleVehicleScanComplete = () => {
    setScannerContext(null)
    resolveVehicleByUnitId(VEHICLE_SCAN.resolveUnitId)
  }

  const renderScanner = () => {
    if (!scannerContext) return null

    const isPump = scannerContext === 'pump'

    return (
      <ScannerScreen
        title={isPump ? undefined : messages.issue.scanVehicle}
        hint={isPump ? undefined : messages.issue.scanVehicleHint}
        manualEntryDescription={isPump ? undefined : messages.issue.searchVehiclesManually}
        onBack={() => setScannerContext(null)}
        onManualEntry={() => setScannerContext(null)}
        onScanComplete={isPump ? handlePumpScanComplete : handleVehicleScanComplete}
        trackPrefix={isPump ? 'issue.scanner' : VEHICLE_SCAN.trackPrefix}
      />
    )
  }

  const canContinuePump = pumpNumber.trim().length > 0

  const reportData: IssueReportData = {
    category: category ?? 'pump',
    pumpNumber,
    issueType,
    details,
    vehicleUnitId: selectedVehicle?.unitId ?? vehicle?.unitId,
    vehicleName: selectedVehicle?.name ?? vehicle?.name,
  }

  const activeScanner = renderScanner()
  if (activeScanner) return activeScanner

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
          title={step === 'category' ? messages.issue.reportIssue : headerTitle}
          subtitle={step === 'confirmation' ? undefined : overlaySubtitle}
          showBack={step !== 'category' && !(source === 'fuel' && step === initial.step) && source !== 'vehicle'}
          onBack={handleBack}
          onClose={onClose}
        />

        {showPumpSubtitle && (
          <div className="issue-overlay-pump" role="status" aria-label={`Pump ${pumpNumber}`}>
            <p className="issue-overlay-pump__label">{messages.fuel.tablePump}</p>
            <p className="issue-overlay-pump__value">{pumpNumber}</p>
          </div>
        )}

        <div className="app-scroll flex min-h-0 flex-1 flex-col">
          {step === 'category' && (
            <div className="flex flex-1 flex-col justify-center gap-2 pb-4">
              <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                {messages.issue.whatsTheIssue}
              </p>
              <IssueCategoryList
                options={getCategoryOptions(source, vehicle, messages.issue)}
                onSelect={handleCategorySelect}
              />
            </div>
          )}

          {step === 'select-vehicle' && (
            <div className="flex flex-1 flex-col gap-2 pb-4">
              <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                {messages.issue.selectVehicle}
              </p>
              <PumpVerifyCard
                buttonLabel={messages.issue.scanVehicle}
                scanHint={messages.issue.scanVehicleShortHint}
                onClick={() => setScannerContext('vehicle')}
                trackScan="issue.select-vehicle.scan.open"
              />
              <p className="text-center text-sm font-bold text-[var(--color-fleet-text)]">
                {t('common.or')}
              </p>
              <TextField
                label={messages.issue.searchVehicles}
                value={vehicleQuery}
                onChange={setVehicleQuery}
                placeholder={messages.issue.searchPlaceholder}
                startIcon={Search}
                onClear={() => setVehicleQuery('')}
                clearTrackTag="issue.select-vehicle.clear"
                autoComplete="off"
              />
              <VehicleSelectList
                vehicles={filteredVehicles}
                onSelect={handleVehicleSelect}
              />
            </div>
          )}

          {step === 'select-pump' && (
            <>
              <div className="workflow-stack">
                <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                  {messages.issue.selectPump}
                </p>
                <PumpVerifyCard
                  buttonLabel={messages.fuel.scanPump}
                  onClick={() => setScannerContext('pump')}
                  trackScan="issue.select-pump.scan"
                />
                <p className="text-center text-sm font-bold text-[var(--color-fleet-text)]">
                  {t('common.or')}
                </p>
                <TextField
                  label={messages.issue.enterManually}
                  value={pumpNumber}
                  onChange={setPumpNumber}
                  placeholder={messages.fuel.enterPumpNo}
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
                  {t('common.continue')}
                </button>
                <TextButton onClick={onClose}>{t('common.cancel')}</TextButton>
              </div>
            </>
          )}

          {step === 'issue-type' && (
            <div className="flex flex-1 flex-col justify-center gap-2 pb-4">
              <p className="text-base font-semibold text-[var(--color-fleet-text)]">
                {messages.issue.whatsTheIssue}
              </p>
              <OverlayList
                items={[...messages.issue.pumpIssueTypes]}
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
              {category === 'vehicle' && (selectedVehicle ?? vehicle) && (
                <p className="issue-category-context">
                  {t('issue.reportingForVehicle', {
                    unitId: (selectedVehicle ?? vehicle)!.unitId,
                    name: (selectedVehicle ?? vehicle)!.name,
                  })}
                </p>
              )}
              <div className="flex flex-1 flex-col gap-2 pb-4">
                <TextAreaField
                  label={messages.issue.additionalDetails}
                  value={details}
                  onChange={setDetails}
                  placeholder={messages.issue.detailsPlaceholder}
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
                  {t('common.continue')}
                </button>
                <TextButton onClick={onClose}>{t('common.cancel')}</TextButton>
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
                  <p className="text-xl font-bold text-[var(--color-fleet-text)]">
                    {messages.issue.issueReported}
                  </p>
                  <p className="text-sm leading-normal text-[var(--color-fleet-text-secondary)]">
                    {messages.issue.issueReportedThanks}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onComplete(reportData)}
                  className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full border-[var(--color-fleet-info)] text-[var(--color-fleet-text-blue)]"
                  {...trackProps('issue.confirmation.done')}
                >
                  {t('common.done')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
