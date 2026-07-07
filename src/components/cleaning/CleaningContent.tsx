import {
  ArrowLeft,
  Flag,
  Play,
} from 'lucide-react'
import type { CleaningStep } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { PumpConfirmedCard } from '../ui/PumpConfirmedCard'
import { PumpVerifyDefault } from '../ui/PumpVerifyDefault'
import { TextField } from '../ui/TextField'
import { WorkflowInProgressStatus } from '../ui/WorkflowInProgressStatus'
import { useI18n } from '../../i18n/I18nProvider'
import { getCleaningProgress } from '../../utils/progress'
import { isUnavailablePump } from '../../utils/pump'
import { getFuelQuickSelectHint } from '../../utils/pumpQuickSelect'
import { PumpQuickSelect } from '../ui/PumpQuickSelect'
import { trackProps } from '../../utils/tracking'

type CleaningContentProps = {
  step: CleaningStep
  pumpNumber: string
  finalTime: string
  startedAt: number | null
  fuelActivePump?: string | null
  fuelQuickSelectInProgress?: boolean
  unavailablePumps?: number[]
  onScanPump: () => void
  onManualEntry: () => void
  onBackToScan: () => void
  onPumpChange: (value: string) => void
  onQuickSelectPump: (pump: string) => void
  onClearPump: () => void
  onVerifyPump: () => void
  onWrongPump: () => void
  onStartCleaning: () => void
  onFinishCleaning: () => void
  onContinueCleaning: () => void
}

export function CleaningContent({
  step,
  pumpNumber,
  finalTime,
  startedAt,
  onScanPump,
  onManualEntry,
  onBackToScan,
  onPumpChange,
  onQuickSelectPump,
  onClearPump,
  onVerifyPump,
  onWrongPump,
  onStartCleaning,
  onFinishCleaning,
  onContinueCleaning,
  fuelActivePump = null,
  fuelQuickSelectInProgress = false,
  unavailablePumps = [],
}: CleaningContentProps) {
  const { messages, t } = useI18n()
  const cleaningCopy = messages.cleaning
  const fuelCopy = messages.fuel
  const progress = getCleaningProgress(step, messages.progress)
  const hideProgressIndicator = step === 'cleaning-complete'
  const canVerify =
    step === 'manual-entry-filled' && pumpNumber.trim().length > 0
  const showManualEntry = [
    'manual-entry',
    'manual-entry-filled',
    'manual-entry-error',
  ].includes(step)
  const fuelQuickSelectPump = (() => {
    const pump = fuelActivePump?.trim()
    if (!pump) return null
    if (isUnavailablePump(pump, unavailablePumps)) return null
    if (step === 'verify-pump') return pump
    if (showManualEntry && !pumpNumber.trim()) return pump
    return null
  })()
  const fuelQuickSelectHint = getFuelQuickSelectHint(
    fuelQuickSelectInProgress,
    messages.fuel.quickSelect,
  )

  return (
    <div className="workflow-stack">
      {!hideProgressIndicator && <ProgressIndicator {...progress} />}

      {step === 'verify-pump' && (
        <PumpVerifyDefault
          onScanPump={onScanPump}
          onManualEntry={onManualEntry}
          scanLabel={cleaningCopy.scanWorkstation}
          manualEntryLabel={cleaningCopy.enterWorkstationNumber}
          quickSelectPump={fuelQuickSelectPump ?? undefined}
          quickSelectHint={fuelQuickSelectHint}
          onQuickSelectPump={onQuickSelectPump}
          trackPrefix="cleaning.verify"
        />
      )}

      {showManualEntry && (
        <>
          {fuelQuickSelectPump && (
            <PumpQuickSelect
              pump={fuelQuickSelectPump}
              hint={fuelQuickSelectHint}
              onSelect={onQuickSelectPump}
              trackTag="cleaning.verify.quick-select"
            />
          )}

          <TextField
            label={cleaningCopy.manualEntry}
            value={pumpNumber}
            placeholder={cleaningCopy.enterWorkstationNo}
            inputMode="numeric"
            invalid={step === 'manual-entry-error'}
            error={step === 'manual-entry-error' ? cleaningCopy.selectAnotherWorkstation : undefined}
            onChange={onPumpChange}
            onClear={onClearPump}
            clearTrackTag="cleaning.pump.clear"
          />

          <div className="workflow-stack">
            <button
              type="button"
              onClick={onVerifyPump}
              disabled={!canVerify}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
              {...trackProps('cleaning.verify-pump')}
            >
              {cleaningCopy.confirmWorkstation}
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToScan}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined fleet-btn-start w-full"
            {...trackProps('cleaning.back-to-scan')}
          >
            <ArrowLeft className="h-5 w-5" />
            {cleaningCopy.backToScan}
          </button>
        </>
      )}

      {step === 'pump-verified' && (
        <>
          <PumpConfirmedCard
            title={t('cleaning.atWorkstation', { workstation: pumpNumber })}
            subtitle={cleaningCopy.workstationConfirmed}
            actionLabel={cleaningCopy.startCleaning}
            onAction={onStartCleaning}
            actionIcon={<Play className="h-5 w-5 fill-current" />}
            trackAction="cleaning.start"
          />
          <button
            type="button"
            onClick={onWrongPump}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps('cleaning.wrong-pump')}
          >
            {t('common.cancel')}
          </button>
        </>
      )}

      {step === 'cleaning-in-progress' && (
        <>
          <WorkflowInProgressStatus
            pumpNumber={pumpNumber}
            startedAt={startedAt}
            pumpLabel={cleaningCopy.tableWorkstation}
          />
          <button
            type="button"
            onClick={onFinishCleaning}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            {...trackProps('cleaning.finish')}
          >
            <Flag className="h-5 w-5" />
            {cleaningCopy.finishCleaning}
          </button>
        </>
      )}

      {step === 'cleaning-complete' && (
        <>
          <div className="overflow-hidden rounded">
            <div className="grid grid-cols-3 border-b-2 border-[var(--color-border)]">
              {[cleaningCopy.tableWorkstation, fuelCopy.tableStatus, fuelCopy.tableTime].map((heading) => (
                <p
                  key={heading}
                  className="px-4 py-4 text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  {heading}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-3 items-center">
              <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">
                {pumpNumber}
              </p>
              <div className="px-4 py-4">
                <span className="inline-flex rounded bg-[var(--color-chip-complete-bg)] px-2 py-0.5 text-sm font-semibold text-[var(--color-text-success)]">
                  {cleaningCopy.statusComplete}
                </span>
              </div>
              <p className="px-4 py-4 text-sm text-[var(--color-text-primary)]">
                {finalTime || '00:01:14'}
              </p>
            </div>
          </div>

          <div className="workflow-stack rounded bg-[var(--color-fleet-info-surface)] px-4 py-3">
            <p className="text-left text-sm font-semibold text-[var(--color-text-primary)]">
              {cleaningCopy.needMoreTime}
            </p>
            <p className="text-left text-sm font-medium text-[var(--color-text-primary)]">
              {cleaningCopy.continueCleaningHint}
            </p>
            <button
              type="button"
              onClick={onContinueCleaning}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
              {...trackProps('cleaning.continue')}
            >
              {cleaningCopy.continueCleaning}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
