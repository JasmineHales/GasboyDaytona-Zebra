import {
  AlertTriangle,
  ArrowLeftRight,
  ChevronRight,
  Clock,
  Flag,
  Fuel,
  Lock,
  Play,
  RefreshCw,
  ShieldPlus,
  Timer,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FuelStep, FuelTransaction } from '../../types/flow'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { PumpConfirmedCard } from '../ui/PumpConfirmedCard'
import { PumpVerifyDefault } from '../ui/PumpVerifyDefault'
import { GallonsCaptureField } from './GallonsCaptureField'
import { isValidGallonsValue, formatGallons } from '../../utils/gallonsInput'
import type { GallonsCaptureRecord } from '../../types/gallonsCapture'
import { TextField } from '../ui/TextField'
import { UnlockingStatus } from '../ui/UnlockingStatus'
import { UnlockOutcomePanel } from '../ui/UnlockOutcomePanel'
import { WorkflowNotice } from '../ui/WorkflowNotice'
import { ElapsedTimer } from '../ui/ElapsedTimer'
import {
  WorkflowInProgressStatus,
  NOZZLE_PICKUP_WINDOW_SECONDS,
} from '../ui/WorkflowInProgressStatus'
import { useI18n } from '../../i18n/I18nProvider'
import { isUnavailablePump } from '../../utils/pump'
import {
  getCleaningQuickSelectHint,
} from '../../utils/pumpQuickSelect'
import { ExpandableAssistanceCard } from './ExpandableAssistanceCard'
import { FuelUnlockModeInfo } from './FuelUnlockModeInfo'
import { NozzleReturnIllustration } from './NozzleReturnIllustration'
import { PumpIssueCard } from './PumpIssueCard'
import { PumpQuickSelect } from '../ui/PumpQuickSelect'
import { trackProps } from '../../utils/tracking'

type FuelStepContentProps = {
  step: FuelStep
  pumpNumber: string
  unlockMode: 'remote' | 'on-site'
  locationType: 'gasboy' | 'non-gasboy'
  fuelGallons: string
  fuelGallonsDispensed: string
  fuelFinalTime: string
  fuelStartedAt: number | null
  isAdditionalFueling: boolean
  fuelTransactions: FuelTransaction[]
  fuelGallonsPending?: boolean
  unavailablePumps?: number[]
  cleaningActivePump?: string | null
  cleaningQuickSelectInProgress?: boolean
  onScanPump: () => void
  onManualEntry: () => void
  onBackToScan: () => void
  onPumpChange: (value: string) => void
  onQuickSelectPump: (pump: string) => void
  onClearPump: () => void
  onUnlockPump: () => void
  onOnSiteUnlock: () => void
  onStartFueling: () => void
  onChangePump: () => void
  onCancelUnlock: () => void
  onReportIssue: () => void
  onFinishFueling: () => void
  onCompleteRemoteFueling: () => void
  onSubmitMissingGallons: () => void
  onGallonsChange: (value: string) => void
  onGallonsCaptureRecord?: (record: GallonsCaptureRecord) => void
  vehicleUnitId?: string
  fuelJobId?: string
  onRetry: () => void
}

type ManualFuelingVariant = 'on-site' | 'non-gasboy'

function formatGallonsDisplay(gallons: string): string {
  return gallons.trim() ? gallons : '--'
}

function FuelStatusChip({ status }: { status: FuelTransaction['status'] }) {
  const { t } = useI18n()
  if (status === 'complete') {
    return (
      <span className="inline-flex max-w-full rounded bg-[var(--color-chip-complete-bg)] px-1.5 py-0.5 text-xs font-semibold leading-tight text-[var(--color-text-success)]">
        {t('fuel.statusComplete')}
      </span>
    )
  }
  return (
    <span className="fleet-chip fleet-chip-warning max-w-full text-xs leading-tight">
      {t('fuel.statusIssue')}
    </span>
  )
}

function FuelSummaryTableHead({ labels }: { labels: string[] }) {
  const [pump, status, time, gal] = labels
  return (
    <div className="fuel-summary-table__grid fuel-summary-table__head">
      <p className="fuel-summary-table__cell fuel-summary-table__cell--head">{pump}</p>
      <p className="fuel-summary-table__cell fuel-summary-table__cell--head">{status}</p>
      <p className="fuel-summary-table__cell fuel-summary-table__cell--head fuel-summary-table__cell--metric">
        {time}
      </p>
      <p className="fuel-summary-table__cell fuel-summary-table__cell--head fuel-summary-table__cell--metric">
        {gal}
      </p>
    </div>
  )
}

function ManualFuelingSummaryTable({
  pump,
  time,
  gallons,
}: {
  pump: string
  time: string
  gallons: string
}) {
  const { messages } = useI18n()
  const fuelCopy = messages.fuel
  const gallonDisplay = gallons.trim() ? gallons : '--'

  return (
    <div className="fuel-summary-table">
      <FuelSummaryTableHead
        labels={[
          fuelCopy.tablePump,
          fuelCopy.tableStatus,
          fuelCopy.tableTime,
          fuelCopy.tableGal,
        ]}
      />
      <div className="fuel-summary-table__grid">
        <p className="fuel-summary-table__cell">{pump}</p>
        <div className="fuel-summary-table__status">
          <FuelStatusChip status="complete" />
        </div>
        <p className="fuel-summary-table__cell fuel-summary-table__cell--metric">{time}</p>
        <p className="fuel-summary-table__cell fuel-summary-table__cell--metric">{gallonDisplay}</p>
      </div>
    </div>
  )
}

function MissingGallonsForm({
  fuelGallons,
  onGallonsChange,
  onSubmit,
  onGallonsCaptureRecord,
  vehicleUnitId,
  fuelJobId,
}: {
  fuelGallons: string
  onGallonsChange: (value: string) => void
  onSubmit: () => void
  onGallonsCaptureRecord?: (record: GallonsCaptureRecord) => void
  vehicleUnitId?: string
  fuelJobId?: string
}) {
  const { t } = useI18n()
  const canSubmit = isValidGallonsValue(fuelGallons, { maxDecimals: 2 })

  return (
    <div className="workflow-stack">
      <GallonsCaptureField
        value={fuelGallons}
        onChange={onGallonsChange}
        onCaptureRecord={onGallonsCaptureRecord}
        vehicleId={vehicleUnitId}
        jobId={fuelJobId}
        clearTrackTag="fuel.missing-gallons.clear"
        trackPrefix="fuel.missing-gallons"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
        {...trackProps('fuel.missing-gallons.submit')}
      >
        {t('common.submit')}
      </button>
    </div>
  )
}

function sumTransactionGallons(rows: FuelTransaction[]): string | null {
  let sum = 0
  let hasAny = false

  for (const row of rows) {
    const trimmed = row.gallons.trim()
    if (!trimmed) continue
    const gallons = Number.parseFloat(trimmed)
    if (!Number.isFinite(gallons)) continue
    sum += gallons
    hasAny = true
  }

  if (!hasAny) return null
  return formatGallons(sum)
}

function parseDurationToSeconds(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '--') return null
  const match = /^(\d{1,2}):(\d{2}):(\d{2})$/.exec(trimmed)
  if (!match) return null
  const hours = Number.parseInt(match[1]!, 10)
  const minutes = Number.parseInt(match[2]!, 10)
  const seconds = Number.parseInt(match[3]!, 10)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null
  }
  return hours * 3600 + minutes * 60 + seconds
}

function formatDurationSeconds(totalSeconds: number): string {
  const elapsed = Math.max(0, Math.floor(totalSeconds))
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function resolveFuelRowStatus(
  row: FuelTransaction,
  index: number,
  rows: FuelTransaction[],
): FuelTransaction['status'] {
  if (rows.length > 1 && index < rows.length - 1) {
    return 'issue'
  }
  return row.status
}

function resolveFuelRowTime(
  row: FuelTransaction,
  index: number,
  rows: FuelTransaction[],
  fallbackTime: string,
): string {
  const stored = row.time?.trim()
  if (stored) return stored
  const isLastRow = index === rows.length - 1
  if (rows.length === 1 || isLastRow) return fallbackTime
  return '--'
}

function sumTransactionTimes(
  rows: FuelTransaction[],
  fallbackTime: string,
): string | null {
  let sumSeconds = 0
  let hasAny = false

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]!
    const displayTime = resolveFuelRowTime(row, index, rows, fallbackTime)
    const seconds = parseDurationToSeconds(displayTime)
    if (seconds === null) continue
    sumSeconds += seconds
    hasAny = true
  }

  if (!hasAny) return null
  return formatDurationSeconds(sumSeconds)
}

function FuelSummaryTable({
  rows,
  timeOnTask,
}: {
  rows: FuelTransaction[]
  timeOnTask?: string
}) {
  const { messages } = useI18n()
  const fuelCopy = messages.fuel
  const resolvedTime = timeOnTask?.trim() || '--'
  const showTotal = rows.length > 1
  const totalGallons = showTotal ? sumTransactionGallons(rows) : null
  const totalTime = showTotal ? sumTransactionTimes(rows, resolvedTime) : null

  return (
    <div className="fuel-summary-table">
      <FuelSummaryTableHead
        labels={[
          fuelCopy.tablePump,
          fuelCopy.tableStatus,
          fuelCopy.tableTime,
          fuelCopy.tableGal,
        ]}
      />
      {rows.map((row, index) => {
        const rowTime = resolveFuelRowTime(row, index, rows, resolvedTime)

        return (
          <div
            key={`${row.pump}-${row.gallons}-${index}`}
            className="fuel-summary-table__grid"
          >
            <p className="fuel-summary-table__cell">{row.pump}</p>
            <div className="fuel-summary-table__status">
              <FuelStatusChip status={resolveFuelRowStatus(row, index, rows)} />
            </div>
            <p className="fuel-summary-table__cell fuel-summary-table__cell--metric">{rowTime}</p>
            <p className="fuel-summary-table__cell fuel-summary-table__cell--metric">
              {formatGallonsDisplay(row.gallons)}
            </p>
          </div>
        )
      })}
      {showTotal && totalGallons ? (
        <div className="fuel-summary-table__total fuel-summary-table__grid">
          <p className="fuel-summary-table__cell fuel-summary-table__cell--strong">
            {fuelCopy.tableTotal}
          </p>
          <p className="fuel-summary-table__cell" aria-hidden />
          <p className="fuel-summary-table__cell fuel-summary-table__cell--metric fuel-summary-table__cell--strong">
            {totalTime ?? resolvedTime}
          </p>
          <p className="fuel-summary-table__cell fuel-summary-table__cell--metric fuel-summary-table__cell--strong">
            {totalGallons}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function ReportIssueLink({
  onReportIssue,
  title,
  description,
  actionLabel,
  trackTag = 'fuel.report-issue',
  variant = 'default',
  layout = 'stack',
}: {
  onReportIssue: () => void
  title: string
  description: string
  actionLabel?: string
  trackTag?: string
  variant?: 'default' | 'inline'
  layout?: 'stack' | 'collapsible'
}) {
  const { t } = useI18n()
  const resolvedActionLabel = actionLabel ?? t('common.reportIt')
  const isInline = variant === 'inline'
  const isCollapsible = layout === 'collapsible'

  if (isCollapsible && isInline) {
    return (
      <ExpandableAssistanceCard
        title={title}
        description={description}
        actionLabel={resolvedActionLabel}
        onAction={onReportIssue}
        actionTrackTag={trackTag}
        toggleTrackTag={`${trackTag}.toggle`}
        className="expandable-assistance-card--fuel-complete"
      />
    )
  }

  const actionButton = (
    <button
      type="button"
      onClick={onReportIssue}
      className={
        isInline
          ? 'fleet-btn fleet-btn-lg fleet-btn-elevated fleet-report-issue__action fleet-report-issue__action--inline w-full'
          : 'fleet-btn fleet-btn-lg fleet-btn-outlined fleet-report-issue__action w-full'
      }
      {...trackProps(trackTag)}
    >
      {resolvedActionLabel}
    </button>
  )

  return (
    <div
      className={`fleet-report-issue${isInline ? ' fleet-report-issue--inline' : ''}`}
    >
      <div className="fleet-report-issue__copy">
        <p className="fleet-report-issue__title">{title}</p>
        <p className="fleet-report-issue__message">{description}</p>
      </div>
      {actionButton}
    </div>
  )
}

function PriorFuelSummary({ rows }: { rows: FuelTransaction[] }) {
  const { messages } = useI18n()
  const previous = rows.at(-1)
  if (!previous) return null

  const gallons = previous.gallons.trim()
  const gallonsLabel = gallons ? `${gallons} gal` : '--'

  return (
    <p className="prior-fuel-summary">
      <Clock className="prior-fuel-summary__icon" aria-hidden strokeWidth={2} />
      <span>
        <span className="prior-fuel-summary__label">
          {messages.fuel.previousFuelSummary}:
        </span>{' '}
        Pump {previous.pump} · {gallonsLabel}
      </span>
    </p>
  )
}

function getManualFuelingVariant(
  unlockMode: 'remote' | 'on-site',
  locationType: 'gasboy' | 'non-gasboy',
): ManualFuelingVariant | null {
  if (locationType === 'non-gasboy') return 'non-gasboy'
  if (unlockMode === 'on-site') return 'on-site'
  return null
}

const unlockActionClass =
  'fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full'

const verifyActionClass =
  'fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full'

function useLockSecondsRemaining(
  sessionStartedAt: number | null,
  windowSeconds: number,
): number {
  const fallbackStartRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const startedAt = sessionStartedAt ?? fallbackStartRef.current

  useEffect(() => {
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  return Math.max(0, windowSeconds - elapsed)
}

function FuelHeadsUpLockCountdown({
  startedAt,
  windowSeconds,
}: {
  startedAt: number | null
  windowSeconds: number
}) {
  const { t } = useI18n()
  const remaining = useLockSecondsRemaining(startedAt, windowSeconds)

  if (remaining <= 0) return null

  return (
    <>
      <div className="remote-fueling-active__status-divider" aria-hidden />
      <p className="remote-fueling-active__status-lock" role="note" aria-live="polite">
        <ShieldPlus
          className="remote-fueling-active__status-lock-icon"
          aria-hidden
          strokeWidth={2}
        />
        {t('fuel.remoteFueling.fuelWithinSeconds', {
          seconds: String(remaining),
        })}
      </p>
    </>
  )
}

function ManualPumpConfirmedCard({
  pumpNumber,
  onStartFueling,
  onChangePump,
}: {
  pumpNumber: string
  onStartFueling: () => void
  onChangePump: () => void
}) {
  const { messages, t } = useI18n()
  const fuelCopy = messages.fuel
  const title = t('fuel.atPump', { pump: pumpNumber })
  const subtitle = t('fuel.beginFueling')

  return (
    <>
      <PumpConfirmedCard
        title={title}
        subtitle={subtitle}
        actionLabel={t('fuel.startFueling')}
        onAction={onStartFueling}
        actionIcon={<Play className="h-5 w-5 fill-current" />}
        trackAction="fuel.start-fueling"
      />
      <button
        type="button"
        onClick={onChangePump}
        className="fleet-btn fleet-btn-lg fleet-btn-borderless w-full"
        {...trackProps('fuel.wrong-pump')}
      >
        <ArrowLeftRight className="h-5 w-5" />
        {fuelCopy.chooseAnotherPump}
      </button>
    </>
  )
}

function RemoteFuelingCompleteFallback({
  completeLabel,
  onComplete,
}: {
  completeLabel: string
  onComplete: () => void
}) {
  const { messages } = useI18n()
  const confirmCopy = messages.fuel.remoteFueling.completeConfirm
  const [showConfirm, setShowConfirm] = useState(false)

  const handleConfirm = () => {
    setShowConfirm(false)
    onComplete()
  }

  return (
    <>
      <div className="remote-fueling-active__fallback">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="fuel-assistance-row remote-fueling-active__fallback-action"
          {...trackProps('fuel.complete-remote-fueling')}
        >
          <span className="fuel-assistance-row__icon-wrap" aria-hidden>
            <Timer className="fuel-assistance-row__icon" strokeWidth={2} />
          </span>
          <span className="remote-fueling-active__fallback-copy">
            <span className="remote-fueling-active__fallback-title">{completeLabel}</span>
          </span>
          <ChevronRight
            className="remote-fueling-active__fallback-chevron"
            aria-hidden
            strokeWidth={2}
          />
        </button>
      </div>

      <BottomSheetOverlay
        open={showConfirm}
        onDismiss={() => setShowConfirm(false)}
        dismissTrackTag="fuel.nozzle-confirm.dismiss"
        labelId="fuel-nozzle-confirm-title"
      >
        <div className="bottom-sheet-body pt-2">
          <h2
            id="fuel-nozzle-confirm-title"
            className="text-left text-lg font-bold text-[var(--color-fleet-text)]"
          >
            {confirmCopy.title}
          </h2>
          <p className="mt-2 text-left text-[length:var(--text-ui-sm)] leading-relaxed text-[var(--color-fleet-text-secondary)]">
            {confirmCopy.body}
          </p>
          <NozzleReturnIllustration
            label={confirmCopy.graphicLabel}
            stepLabel={confirmCopy.graphicStep}
          />
          <div className="bottom-sheet-footer workflow-stack pt-5">
            <button
              type="button"
              onClick={handleConfirm}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
              {...trackProps('fuel.nozzle-confirm.continue')}
            >
              {confirmCopy.confirm}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
              {...trackProps('fuel.nozzle-confirm.cancel')}
            >
              {confirmCopy.cancel}
            </button>
          </div>
        </div>
      </BottomSheetOverlay>
    </>
  )
}

function RemoteFuelingActive({
  pumpNumber,
  fuelStartedAt,
  onComplete,
  onReportIssue,
}: {
  pumpNumber: string
  fuelStartedAt: number | null
  onComplete: () => void
  onReportIssue: () => void
}) {
  const { messages, t } = useI18n()
  const copy = messages.fuel.remoteFueling
  const pump = pumpNumber.trim() || '--'
  const pumpLabel = t('workflow.inProgress.pumpTitle', { pump })
  const lockRemaining = useLockSecondsRemaining(
    fuelStartedAt,
    NOZZLE_PICKUP_WINDOW_SECONDS,
  )

  return (
    <div className="remote-fueling-active">
      <div className="remote-fueling-active__status" role="status" aria-label={pumpLabel}>
        <div className="remote-fueling-active__status-main">
          <span className="remote-fueling-active__status-icon" aria-hidden>
            <Fuel className="h-6 w-6" strokeWidth={2} />
          </span>
          <p className="remote-fueling-active__status-pump">{pumpLabel}</p>
          <ElapsedTimer startedAt={fuelStartedAt} compact />
        </div>
        {lockRemaining > 0 ? (
          <FuelHeadsUpLockCountdown
            startedAt={fuelStartedAt}
            windowSeconds={NOZZLE_PICKUP_WINDOW_SECONDS}
          />
        ) : null}
      </div>

      <RemoteFuelingCompleteFallback
        completeLabel={copy.completeButton}
        onComplete={onComplete}
      />

      <PumpIssueCard onReportIssue={onReportIssue} />
    </div>
  )
}

function ManualFuelingInProgress({
  pumpNumber,
  fuelGallons,
  fuelStartedAt,
  onGallonsChange,
  onFinishFueling,
  onGallonsCaptureRecord,
  vehicleUnitId,
  fuelJobId,
}: {
  pumpNumber: string
  fuelGallons: string
  fuelStartedAt: number | null
  onGallonsChange: (value: string) => void
  onFinishFueling: () => void
  onGallonsCaptureRecord?: (record: GallonsCaptureRecord) => void
  vehicleUnitId?: string
  fuelJobId?: string
}) {
  const { messages } = useI18n()
  const fuelCopy = messages.fuel

  return (
    <>
      <WorkflowInProgressStatus
        pumpNumber={pumpNumber}
        startedAt={fuelStartedAt}
      />
      <div className="workflow-stack">
        <GallonsCaptureField
          value={fuelGallons}
          onChange={onGallonsChange}
          onCaptureRecord={onGallonsCaptureRecord}
          vehicleId={vehicleUnitId}
          jobId={fuelJobId}
          clearTrackTag="fuel.gallons.clear"
          trackPrefix="fuel.gallons"
        />
        <button
          type="button"
          onClick={onFinishFueling}
          className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
          {...trackProps('fuel.finish-fueling')}
        >
          <Flag className="h-5 w-5" />
          {fuelCopy.finishFueling}
        </button>
      </div>
    </>
  )
}

function UncertainUnlockOutcome({
  title,
  steps,
  headerTone,
  outcomePump,
  onCompleteFueling,
  onRetry,
  onChangePump,
  completeTrackTag,
  retryTrackTag,
  changePumpTrackTag,
}: {
  title: string
  steps: { label: string; state: 'complete' | 'warning' | 'error' }[]
  headerTone: 'warning' | 'error'
  outcomePump: string
  onCompleteFueling: () => void
  onRetry: () => void
  onChangePump: () => void
  completeTrackTag: string
  retryTrackTag: string
  changePumpTrackTag: string
}) {
  const { messages, t } = useI18n()
  const fuelCopy = messages.fuel

  return (
    <UnlockOutcomePanel
      title={title}
      headerTone={headerTone}
      steps={steps}
      primaryAction={{
        label: fuelCopy.retryUnlockPump,
        onClick: onRetry,
        trackTag: retryTrackTag,
        icon: <RefreshCw className="h-6 w-6" />,
      }}
      secondaryAction={{
        label: fuelCopy.changePump,
        onClick: onChangePump,
        trackTag: changePumpTrackTag,
        icon: <ArrowLeftRight className="h-6 w-6" />,
      }}
      footer={
        <div className="fleet-unlock-outcome-fallback">
          <WorkflowNotice
            variant="warning"
            title={t('fuel.unlockOutcomes.completeIfUnlockedTitle', {
              pump: outcomePump,
            })}
            description={t('fuel.unlockOutcomes.completeIfUnlockedDescription')}
            icon={<AlertTriangle className="h-4 w-4" />}
            footer={
              <button
                type="button"
                onClick={onCompleteFueling}
                className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full fleet-unlock-outcome-fallback__action"
                {...trackProps(completeTrackTag)}
              >
                <Flag className="h-5 w-5" />
                {fuelCopy.completeFueling}
              </button>
            }
          />
        </div>
      }
    />
  )
}

export function FuelStepContent({
  step,
  pumpNumber,
  unlockMode,
  locationType,
  fuelGallons,
  fuelGallonsDispensed,
  fuelFinalTime,
  fuelStartedAt,
  isAdditionalFueling,
  fuelTransactions,
  unavailablePumps = [],
  onScanPump,
  onManualEntry,
  onBackToScan,
  onPumpChange,
  onQuickSelectPump,
  onClearPump,
  onUnlockPump,
  onOnSiteUnlock,
  onStartFueling,
  onChangePump,
  onCancelUnlock,
  onReportIssue,
  onFinishFueling,
  onCompleteRemoteFueling,
  onSubmitMissingGallons,
  onGallonsChange,
  onGallonsCaptureRecord,
  vehicleUnitId,
  fuelJobId,
  onRetry,
  fuelGallonsPending = false,
  cleaningActivePump = null,
  cleaningQuickSelectInProgress = false,
}: FuelStepContentProps) {
  const { messages, t } = useI18n()
  const fuelCopy = messages.fuel
  const outcomePump = pumpNumber.trim() || '5'
  const manualVariant = getManualFuelingVariant(unlockMode, locationType)
  const isManualFuelingFlow = manualVariant !== null
  const isRemoteInProgress =
    !isManualFuelingFlow &&
    unlockMode === 'remote' &&
    (step === 'fueling-in-progress' || step === 'pump-unlocked')
  const isManualFuelingInProgress =
    isManualFuelingFlow && step === 'fueling-in-progress'
  const manualEntrySteps = [
    'manual-entry',
    'manual-entry-filled',
    'manual-entry-error',
  ] as const
  const isManualEntryStep = manualEntrySteps.includes(
    step as (typeof manualEntrySteps)[number],
  )
  const isUnavailable = isUnavailablePump(pumpNumber, unavailablePumps)
  const isUnavailableSelection =
    isUnavailable &&
    (step === 'manual-entry-filled' || step === 'manual-entry-error')
  const canUnlock =
    step === 'manual-entry-filled' && pumpNumber.trim().length > 0 && !isUnavailable
  const showGasboyVerifyDefault =
    step === 'verify-pump' &&
    locationType === 'gasboy' &&
    (unlockMode === 'remote' || unlockMode === 'on-site')
  const showNonGasboyVerifyDefault =
    step === 'verify-pump' && locationType === 'non-gasboy'
  const showNonGasboyManualEntry =
    locationType === 'non-gasboy' && isManualEntryStep
  const showGasboyManualEntry =
    locationType === 'gasboy' &&
    (unlockMode === 'remote' || unlockMode === 'on-site') &&
    isManualEntryStep
  const isLocationVerifyFlow =
    locationType === 'non-gasboy' || unlockMode === 'on-site'
  const showIssueHistory =
    isAdditionalFueling &&
    step !== 'fueling-complete' &&
    step !== 'additional-fueling-complete'
  const completeRows =
    fuelTransactions.length > 0
      ? fuelTransactions
      : [
          {
            pump: pumpNumber || '8',
            gallons: fuelGallonsDispensed || (fuelGallonsPending ? '' : '5'),
            status: 'complete' as const,
          },
        ]
  const switchUnlockMode =
    unlockMode === 'remote' ? onOnSiteUnlock : onCancelUnlock
  const hasSyncedGallonData =
    fuelGallonsDispensed.trim().length > 0 ||
    fuelTransactions.some((row) => row.gallons.trim().length > 0)
  const showGallonsPendingNotice = fuelGallonsPending && !hasSyncedGallonData
  const cleaningQuickSelectPump = (() => {
    const pump = cleaningActivePump?.trim()
    if (!pump) return null
    if (locationType !== 'gasboy') return null
    if (isUnavailablePump(pump, unavailablePumps)) return null
    if (step === 'verify-pump') return pump
    if (isManualEntryStep && !pumpNumber.trim()) return pump
    return null
  })()
  const cleaningQuickSelectHint = getCleaningQuickSelectHint(
    cleaningQuickSelectInProgress,
    messages.fuel.quickSelect,
  )

  return (
    <div className="workflow-stack">
      {showIssueHistory && fuelTransactions.length > 0 && (
        <PriorFuelSummary rows={fuelTransactions} />
      )}

      {showNonGasboyVerifyDefault && (
        <PumpVerifyDefault
          scanLabel={fuelCopy.scanPump}
          onScanPump={onScanPump}
          onManualEntry={onManualEntry}
          trackPrefix="fuel.verify"
        />
      )}

      {showGasboyVerifyDefault && (
        <PumpVerifyDefault
          onScanPump={onScanPump}
          onManualEntry={onManualEntry}
          unlockMode={unlockMode}
          onSwitchUnlockMode={switchUnlockMode}
          quickSelectPump={cleaningQuickSelectPump ?? undefined}
          quickSelectHint={cleaningQuickSelectHint}
          onQuickSelectPump={onQuickSelectPump}
          trackPrefix="fuel.verify"
        />
      )}

      {step === 'pump-verified' && isManualFuelingFlow && manualVariant && (
        <ManualPumpConfirmedCard
          pumpNumber={pumpNumber}
          onStartFueling={onStartFueling}
          onChangePump={onChangePump}
        />
      )}

      {(showGasboyManualEntry || showNonGasboyManualEntry) && (
        <>
          {showGasboyManualEntry && (
            <FuelUnlockModeInfo
              mode={unlockMode}
              onModeChange={(next) => {
                if (next === 'on-site') onOnSiteUnlock()
                else if (next === 'remote') onCancelUnlock()
              }}
              trackPrefix="fuel.unlock-mode"
            />
          )}

          {cleaningQuickSelectPump && (
            <PumpQuickSelect
              pump={cleaningQuickSelectPump}
              hint={cleaningQuickSelectHint}
              onSelect={onQuickSelectPump}
              remoteAccent={unlockMode === 'remote'}
              trackTag="fuel.verify.quick-select"
            />
          )}

          <TextField
            value={pumpNumber}
            placeholder={fuelCopy.enterPumpNo}
            aria-label={fuelCopy.enterPumpNo}
            inputMode="numeric"
            invalid={isUnavailableSelection}
            error={
              isUnavailableSelection
                ? isLocationVerifyFlow
                  ? t('fuel.pumpUnavailable')
                  : fuelCopy.cannotUnlock
                : undefined
            }
            onChange={onPumpChange}
            onClear={onClearPump}
            clearTrackTag="fuel.pump.clear"
          />

          <div className="workflow-stack">
            <button
              type="button"
              onClick={onUnlockPump}
              disabled={!canUnlock}
              className={
                showGasboyManualEntry && unlockMode === 'remote'
                  ? unlockActionClass
                  : verifyActionClass
              }
              {...trackProps(
                isLocationVerifyFlow ? 'fuel.verify-pump' : 'fuel.unlock-pump',
              )}
            >
              <Lock className="h-5 w-5" />
              {isLocationVerifyFlow ? fuelCopy.verifyPump : fuelCopy.unlockPump}
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToScan}
            className="fleet-btn fleet-btn-lg fleet-btn-borderless workflow-scan-link workflow-scan-link--start w-full"
            {...trackProps('fuel.back-to-scan')}
          >
            {fuelCopy.backToScan}
          </button>
        </>
      )}

      {step === 'unlocking-pump' && (
        <UnlockingStatus
          pumpNumber={pumpNumber}
          onCancelUnlock={onCancelUnlock}
        />
      )}

      {isRemoteInProgress && (
        <RemoteFuelingActive
          pumpNumber={pumpNumber}
          fuelStartedAt={fuelStartedAt}
          onComplete={onCompleteRemoteFueling}
          onReportIssue={onReportIssue}
        />
      )}

      {isManualFuelingInProgress && manualVariant && (
        <ManualFuelingInProgress
          pumpNumber={pumpNumber}
          fuelGallons={fuelGallons}
          fuelStartedAt={fuelStartedAt}
          onGallonsChange={onGallonsChange}
          onFinishFueling={onFinishFueling}
          onGallonsCaptureRecord={onGallonsCaptureRecord}
          vehicleUnitId={vehicleUnitId}
          fuelJobId={fuelJobId}
        />
      )}

      {step === 'fueling-complete-missing' && (
        <>
          <ManualFuelingSummaryTable
            pump={pumpNumber || '8'}
            time={fuelFinalTime || '00:01:14'}
            gallons={fuelGallonsDispensed}
          />
          <MissingGallonsForm
            fuelGallons={fuelGallons}
            onGallonsChange={onGallonsChange}
            onSubmit={onSubmitMissingGallons}
            onGallonsCaptureRecord={onGallonsCaptureRecord}
            vehicleUnitId={vehicleUnitId}
            fuelJobId={fuelJobId}
          />
        </>
      )}

      {(step === 'fueling-complete' || step === 'additional-fueling-complete') && (
        <>
          {showGallonsPendingNotice && (
            <div
              className="fuel-gallons-pending-notice rounded bg-[var(--color-fleet-info-surface)] px-4 py-3"
              role="status"
            >
              <p className="fuel-gallons-pending-notice__text">{fuelCopy.gallonsPending}</p>
            </div>
          )}
          <div className="fuel-complete-summary">
            {isManualFuelingFlow ? (
              <ManualFuelingSummaryTable
                pump={pumpNumber || '8'}
                time={fuelFinalTime || '00:01:14'}
                gallons={fuelGallonsDispensed}
              />
            ) : (
              <FuelSummaryTable
                rows={completeRows}
                timeOnTask={fuelFinalTime || '00:01:14'}
              />
            )}
            <ReportIssueLink
              variant="inline"
              layout="collapsible"
              onReportIssue={onReportIssue}
              title={fuelCopy.needMoreFuel}
              description={fuelCopy.needMoreFuelDesc}
              actionLabel={fuelCopy.reportAndContinue}
              trackTag="fuel.report-issue.complete"
            />
          </div>
        </>
      )}

      {step === 'connection-lost' && (
        <UncertainUnlockOutcome
          title={t('fuel.connectionLost', { pump: outcomePump })}
          headerTone="error"
          outcomePump={outcomePump}
          onCompleteFueling={onFinishFueling}
          onRetry={onRetry}
          onChangePump={onChangePump}
          completeTrackTag="fuel.connection-lost.complete-fueling"
          retryTrackTag="fuel.connection-lost.retry"
          changePumpTrackTag="fuel.connection-lost.change-pump"
          steps={[
            {
              label: fuelCopy.unlockProgress.stepConnected,
              state: 'complete',
            },
            {
              label: fuelCopy.unlockProgress.stepRequestSent,
              state: 'complete',
            },
            {
              label: t('fuel.unlockOutcomes.connectionLostStep', { pump: outcomePump }),
              state: 'error',
            },
          ]}
        />
      )}

      {step === 'no-response' && (
        <UncertainUnlockOutcome
          title={t('fuel.noResponse', { pump: outcomePump })}
          headerTone="warning"
          outcomePump={outcomePump}
          onCompleteFueling={onFinishFueling}
          onRetry={onRetry}
          onChangePump={onChangePump}
          completeTrackTag="fuel.no-response.complete-fueling"
          retryTrackTag="fuel.no-response.retry"
          changePumpTrackTag="fuel.no-response.change-pump"
          steps={[
            {
              label: fuelCopy.unlockProgress.stepConnected,
              state: 'complete',
            },
            {
              label: fuelCopy.unlockProgress.stepRequestSent,
              state: 'complete',
            },
            {
              label: t('fuel.unlockOutcomes.noResponseStep', { pump: outcomePump }),
              state: 'warning',
            },
          ]}
        />
      )}

      {step === 'pump-timeout' && (
        <UnlockOutcomePanel
          title={t('fuel.unlockExpired', { pump: outcomePump })}
          headerTone="error"
          steps={[
            {
              label: t('fuel.unlockOutcomes.pumpUnlocked', { pump: outcomePump }),
              state: 'complete',
            },
            {
              label: fuelCopy.unlockOutcomes.unlockAvailable,
              state: 'complete',
            },
            {
              label: fuelCopy.unlockOutcomes.unlockWindowExpired,
              state: 'error',
            },
          ]}
          primaryAction={{
            label: fuelCopy.retryUnlockPump,
            onClick: onRetry,
            trackTag: 'fuel.pump-timeout.retry',
            icon: <RefreshCw className="h-6 w-6" />,
          }}
          secondaryAction={{
            label: fuelCopy.changePump,
            onClick: onRetry,
            trackTag: 'fuel.pump-timeout.change-pump',
            icon: <ArrowLeftRight className="h-6 w-6" />,
          }}
        />
      )}

      {step === 'pump-unavailable' && (
        <UnlockOutcomePanel
          title={t('fuel.pumpUnavailableTitle', { pump: outcomePump })}
          headerTone="error"
          steps={[
            {
              label: t('fuel.unlockOutcomes.pumpSelected', { pump: outcomePump }),
              state: 'warning',
            },
            {
              label: t('fuel.unlockOutcomes.pumpUnavailableStep', { pump: outcomePump }),
              state: 'error',
            },
          ]}
          primaryAction={{
            label: fuelCopy.chooseAnotherPump,
            onClick: onRetry,
            trackTag: 'fuel.pump-unavailable.choose-another',
            icon: <Fuel className="h-6 w-6" />,
          }}
          secondaryAction={{
            label: fuelCopy.terminalUnlock,
            onClick: onOnSiteUnlock,
            trackTag: 'fuel.pump-unavailable.terminal-unlock',
            icon: <Fuel className="h-6 w-6" />,
          }}
        />
      )}
    </div>
  )
}
