import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Fuel,
  Loader2,
  Lock,
  QrCode,
  Unlock,
} from 'lucide-react'
import type { FuelStep } from '../../types/flow'
import { StepIndicator } from '../ui/StepIndicator'

type FuelStepContentProps = {
  step: FuelStep
  pumpNumber: string
  onScanPump: () => void
  onManualEntry: () => void
  onOnSiteUnlock: () => void
  onUnlockPump: () => void
  onReportIssue: () => void
  onAdditionalFueling: () => void
  onRetry: () => void
}

const stepMeta: Record<
  FuelStep,
  { indicator: number; label: string; progress: number; total: number }
> = {
  'verify-pump': { indicator: 1, label: 'Verify Pump', progress: 0, total: 4 },
  'unlocking-pump': { indicator: 2, label: 'Unlock Pump', progress: 25, total: 4 },
  'pump-unlocked': { indicator: 2, label: 'Pump Unlocked', progress: 50, total: 4 },
  'fueling-in-progress': { indicator: 3, label: 'Fueling in Progress', progress: 75, total: 4 },
  'fueling-complete': { indicator: 4, label: 'Fueling Complete', progress: 100, total: 4 },
  'additional-fueling': { indicator: 4, label: 'Additional Fueling', progress: 100, total: 4 },
  'additional-fueling-complete': {
    indicator: 4,
    label: 'Additional Fueling Complete',
    progress: 100,
    total: 4,
  },
  'pump-unavailable': { indicator: 1, label: 'Verify Pump', progress: 0, total: 4 },
  'connection-lost': { indicator: 2, label: 'Unlock Pump', progress: 25, total: 4 },
  'no-response': { indicator: 2, label: 'Unlock Pump', progress: 25, total: 4 },
  'pump-timeout': { indicator: 2, label: 'Pump Unlocked', progress: 50, total: 4 },
  'manual-entry': { indicator: 1, label: 'Verify Pump', progress: 0, total: 4 },
  'manual-entry-error': { indicator: 1, label: 'Verify Pump', progress: 0, total: 4 },
  'manual-entry-filled': { indicator: 1, label: 'Verify Pump', progress: 25, total: 4 },
}

export function FuelStepContent({
  step,
  pumpNumber,
  onScanPump,
  onManualEntry,
  onOnSiteUnlock,
  onUnlockPump,
  onReportIssue,
  onAdditionalFueling,
  onRetry,
}: FuelStepContentProps) {
  const meta = stepMeta[step]

  return (
    <div className="flex flex-col gap-2">
      <StepIndicator
        step={meta.indicator}
        total={meta.total}
        label={meta.label}
        progress={meta.progress}
      />

      {step === 'verify-pump' && (
        <>
          <ScanCard onScan={onScanPump} />
          <TextButton label="Manually Enter Pump Number" onClick={onManualEntry} />
          <OptionRow icon={Lock} label="On-Site Unlock" onClick={onOnSiteUnlock} />
        </>
      )}

      {step === 'manual-entry' && (
        <ManualEntryCard
          value={pumpNumber}
          error=""
          onChange={() => {}}
          onSubmit={onUnlockPump}
        />
      )}

      {step === 'manual-entry-error' && (
        <ManualEntryCard
          value={pumpNumber}
          error="Invalid pump number. Please try again."
          onChange={() => {}}
          onSubmit={onRetry}
        />
      )}

      {step === 'manual-entry-filled' && (
        <ManualEntryCard
          value={pumpNumber || '12'}
          error=""
          onChange={() => {}}
          onSubmit={onUnlockPump}
        />
      )}

      {step === 'unlocking-pump' && (
        <StatusCard
          icon={Loader2}
          iconClass="animate-spin text-[var(--color-brand-primary)]"
          title="Unlocking Pump..."
          description="Please wait while we unlock the pump remotely."
        />
      )}

      {step === 'pump-unlocked' && (
        <>
          <StatusCard
            icon={Unlock}
            iconClass="text-[var(--color-brand-success)]"
            title={`Pump ${pumpNumber || '12'} Unlocked`}
            description="Begin fueling. The pump will lock automatically when complete."
          />
          <PrimaryButton label="Start Fueling" onClick={onUnlockPump} />
        </>
      )}

      {step === 'fueling-in-progress' && (
        <StatusCard
          icon={Fuel}
          iconClass="text-[var(--color-brand-primary)]"
          title="Fueling in Progress"
          description="Do not remove the nozzle until fueling is complete."
        />
      )}

      {step === 'fueling-complete' && (
        <>
          <StatusCard
            icon={CheckCircle2}
            iconClass="text-[var(--color-brand-success)]"
            title="Fueling Complete"
            description="Fuel transaction recorded successfully."
          />
          <TextButton label="Report Fueling Issue" onClick={onReportIssue} />
          <OptionRow icon={Fuel} label="Additional Fueling" onClick={onAdditionalFueling} />
        </>
      )}

      {step === 'additional-fueling' && (
        <StatusCard
          icon={Fuel}
          iconClass="text-[var(--color-brand-primary)]"
          title="Additional Fueling"
          description="Enter additional fuel amount and confirm."
        />
      )}

      {step === 'additional-fueling-complete' && (
        <StatusCard
          icon={CheckCircle2}
          iconClass="text-[var(--color-brand-success)]"
          title="Additional Fueling Complete"
          description="Additional fuel transaction recorded."
        />
      )}

      {(step === 'pump-unavailable' ||
        step === 'connection-lost' ||
        step === 'no-response' ||
        step === 'pump-timeout') && (
        <>
          <StatusCard
            icon={AlertTriangle}
            iconClass="text-[var(--color-brand-error)]"
            title={
              step === 'pump-unavailable'
                ? 'Pump Unavailable'
                : step === 'connection-lost'
                  ? 'Connection Lost'
                  : step === 'no-response'
                    ? 'No Response'
                    : 'Pump Time Out'
            }
            description={
              step === 'pump-unavailable'
                ? 'This pump is currently unavailable. Try another pump or enter manually.'
                : step === 'connection-lost'
                  ? 'Lost connection to the fuel system. Check your network and retry.'
                  : step === 'no-response'
                    ? 'The pump did not respond. Please retry or use on-site unlock.'
                    : 'The pump unlock timed out. Please retry.'
            }
            variant="error"
          />
          <PrimaryButton label="Retry" onClick={onRetry} />
          <TextButton label="Manually Enter Pump Number" onClick={onManualEntry} />
          <OptionRow icon={Lock} label="On-Site Unlock" onClick={onOnSiteUnlock} />
        </>
      )}
    </div>
  )
}

function ScanCard({ onScan }: { onScan: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-brand-info-border)] bg-white px-6 pb-5 pt-6">
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#e0f4ff] opacity-60" />
          <QrCode className="relative h-14 w-14 text-[var(--color-brand-primary)]" />
        </div>
        <p className="text-center text-base font-semibold text-[var(--color-brand-secondary)]">
          Scan Pump QR
        </p>
      </div>
      <p className="text-center text-xs text-[var(--color-text-secondary)]">
        Scan the QR code at your pump
      </p>
      <button
        type="button"
        onClick={onScan}
        className="flex h-10 w-full items-center justify-center gap-2 rounded bg-[var(--color-brand-primary)] px-4 text-sm font-semibold text-white shadow-[0_1px_5px_rgba(0,0,0,0.12),0_2px_2px_rgba(0,0,0,0.14),0_3px_1px_-2px_rgba(0,0,0,0.2)]"
      >
        <QrCode className="h-5 w-5" />
        Scan Pump
      </button>
    </div>
  )
}

function ManualEntryCard({
  value,
  error,
  onSubmit,
}: {
  value: string
  error: string
  onChange: () => void
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-brand-info-border)] bg-white p-6">
      <p className="text-base font-semibold text-[var(--color-brand-secondary)]">
        Enter Pump Number
      </p>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        readOnly
        placeholder="Pump #"
        className={`h-12 rounded border px-4 text-base outline-none ${
          error
            ? 'border-[var(--color-brand-error-border)] bg-[var(--color-brand-error-bg)]'
            : 'border-[var(--color-border)] bg-white'
        }`}
      />
      {error && <p className="text-xs text-[var(--color-brand-error)]">{error}</p>}
      <PrimaryButton label="Unlock Pump" onClick={onSubmit} />
    </div>
  )
}

function StatusCard({
  icon: Icon,
  iconClass,
  title,
  description,
  variant = 'info',
}: {
  icon: typeof Fuel
  iconClass: string
  title: string
  description: string
  variant?: 'info' | 'error'
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border px-6 py-5 ${
        variant === 'error'
          ? 'border-[var(--color-brand-error-border)] bg-[var(--color-brand-error-bg)]'
          : 'border-[var(--color-brand-info-border)] bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 shrink-0 ${iconClass}`} />
        <p className="text-base font-semibold text-[var(--color-brand-secondary)]">{title}</p>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)]">{description}</p>
    </div>
  )
}

function PrimaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center rounded bg-[var(--color-brand-primary)] px-4 text-sm font-semibold text-white shadow-[0_1px_5px_rgba(0,0,0,0.12),0_2px_2px_rgba(0,0,0,0.14),0_3px_1px_-2px_rgba(0,0,0,0.2)]"
    >
      {label}
    </button>
  )
}

function TextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center text-sm font-semibold text-[var(--color-brand-primary-dark)]"
    >
      {label}
    </button>
  )
}

function OptionRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Lock
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded border border-[var(--color-border)] p-1 text-left"
    >
      <div className="flex flex-1 items-center gap-3 px-4 py-2">
        <Icon className="h-6 w-6 shrink-0" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ChevronRight className="mr-2 h-6 w-6 shrink-0 text-[var(--color-text-secondary)]" />
    </button>
  )
}
