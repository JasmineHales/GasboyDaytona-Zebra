import {
  AlertTriangle,
  Camera,
  Car,
  Info,
  MapPin,
  ParkingCircle,
  X,
} from 'lucide-react'
import { useState } from 'react'
import type { MovementMode, MovementPhase } from '../../types/flow'

type MovementContentProps = {
  mode: MovementMode
  phase: MovementPhase
  location: string
  stallNumber: string
  onModeChange: (mode: MovementMode) => void
  onLocationClear: () => void
  onStallSelect: (stall: string) => void
  onStallClear: () => void
  onTakePhoto: () => void
  onRetakePhoto: () => void
  onOpenLocationSearch: () => void
}

export function MovementContent({
  mode,
  phase,
  location,
  stallNumber,
  onModeChange,
  onLocationClear,
  onStallSelect,
  onStallClear,
  onTakePhoto,
  onRetakePhoto,
  onOpenLocationSearch,
}: MovementContentProps) {
  const [stallDraft, setStallDraft] = useState('')

  const isTransport = mode === 'transport'
  const locationSelected = phase === 'location-selected'
  const stallSelected = phase === 'stall-selected' || phase === 'stall-issue-reported'
  const stallVerify = phase === 'stall-verify'
  const issueReported = phase === 'stall-issue-reported'

  return (
    <div className="flex flex-col gap-2.5">
      {isTransport ? (
        <TransportProgress
          selected={locationSelected}
        />
      ) : (
        <StallProgress
          phase={phase}
        />
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex gap-4">
          <ModeTab
            active={isTransport}
            icon={Car}
            label="Transport"
            onClick={() => onModeChange('transport')}
          />
          <ModeTab
            active={!isTransport}
            icon={ParkingCircle}
            label="Stall"
            onClick={() => onModeChange('stall')}
          />
        </div>

        {isTransport ? (
          <>
            <p className="text-base font-bold tracking-tight text-[#101828]">Location</p>
            {locationSelected ? (
              <FieldInput
                startIcon={MapPin}
                value={location}
                onClear={onLocationClear}
              />
            ) : (
              <button
                type="button"
                onClick={onOpenLocationSearch}
                className="flex w-full items-center rounded border border-[var(--color-border)] px-3 py-4 text-left"
              >
                <MapPin className="mr-2 h-6 w-6 shrink-0 text-[var(--color-text-primary)]" />
                <span className="flex-1 text-base text-[var(--color-text-primary)]">
                  Select Location
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-base font-bold tracking-tight text-[#101828]">Stall No.</p>
            {stallSelected || stallVerify ? (
              <FieldInput
                value={stallNumber}
                onClear={() => {
                  setStallDraft('')
                  onStallClear()
                }}
              />
            ) : (
              <input
                type="text"
                inputMode="numeric"
                placeholder="Stall Number"
                value={stallDraft}
                onChange={(e) => setStallDraft(e.target.value)}
                onBlur={() => {
                  const value = stallDraft.trim()
                  if (value) onStallSelect(value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = stallDraft.trim()
                    if (value) onStallSelect(value)
                  }
                }}
                className="w-full rounded border border-[var(--color-border)] px-3 py-4 text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand-primary)]"
              />
            )}

            {stallVerify && (
              <>
                <div className="flex flex-col gap-4 rounded border border-[#ffc970] bg-[#fff9ec] px-4 py-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-[30px] w-[30px] shrink-0 text-[#f97306]" />
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-bold text-[#7f380f]">Stall appears occupied</p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        If this stall is available take a photo to report issue.
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-[#ffc970]" />
                  <ul className="list-disc pl-6 text-base font-semibold text-[var(--color-text-primary)]">
                    <li>Stall Number</li>
                    <li>Entire stall &amp; surroundings</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={onTakePhoto}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded bg-[var(--color-brand-primary)] px-6 text-sm font-semibold text-white shadow-[0_1px_5px_rgba(0,0,0,0.12),0_2px_2px_rgba(0,0,0,0.14),0_3px_1px_-2px_rgba(0,0,0,0.2)]"
                >
                  <Camera className="h-6 w-6" />
                  Take Photo
                </button>
              </>
            )}

            {issueReported && (
              <>
                <div className="flex flex-col gap-4 rounded border border-[var(--color-brand-primary)] bg-[#f0f9ff] px-4 py-3">
                  <div className="flex gap-2">
                    <Info className="h-[30px] w-[30px] shrink-0 text-[var(--color-brand-primary)]" />
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-bold text-[var(--color-brand-primary-dark)]">
                        Issue reported
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        Photo attached successfully
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-[var(--color-brand-info-border)]" />
                  <div className="flex items-center gap-2">
                    <div className="h-[100px] w-[150px] shrink-0 rounded bg-[#cbd5e1]" />
                    <div className="flex flex-col gap-2 text-sm">
                      <p className="font-semibold">IMG-26_256_2265_2563.jpog</p>
                      <p>just now</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onRetakePhoto}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded border border-[var(--color-brand-primary)] bg-white px-6 text-sm font-semibold text-[var(--color-brand-primary-dark)]"
                >
                  <Camera className="h-6 w-6" />
                  Retake Photo
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TransportProgress({ selected }: { selected: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3 p-0.5">
        <StepBadge
          number={selected ? 2 : 1}
          variant={selected ? 'complete' : 'active'}
        />
        <p
          className={`pt-1 text-sm leading-5 ${
            selected
              ? 'font-semibold text-[#085d48]'
              : 'font-bold text-[#424548]'
          }`}
        >
          {selected ? 'Location Selected' : 'Select Location'}
        </p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
        <div
          className={`h-full rounded-full ${selected ? 'w-full bg-[#14b8a6]' : 'w-1/2 bg-[#0d9488]'}`}
        />
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">Step 2 of 2</p>
    </div>
  )
}

function StallProgress({ phase }: { phase: MovementPhase }) {
  const verify = phase === 'stall-verify'
  const selected = phase === 'stall-selected' || phase === 'stall-issue-reported'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3 p-0.5">
        <StepBadge
          number={selected || verify ? 2 : 1}
          variant={verify ? 'warning' : selected ? 'complete' : 'active'}
        />
        <p
          className={`pt-1 text-sm leading-5 ${
            verify
              ? 'font-bold text-[#f97306]'
              : selected
                ? 'font-semibold text-[#085d48]'
                : 'font-bold text-[#424548]'
          }`}
        >
          {verify
            ? 'Stalling Selected - Verify Stall'
            : selected
              ? 'Stall Selected'
              : 'Select Stall'}
        </p>
      </div>
      {!verify && !selected && (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
            <div className="h-full w-1/2 rounded-full bg-[#0d9488]" />
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">Step 2 of 2</p>
        </>
      )}
    </div>
  )
}

function StepBadge({
  number,
  variant,
}: {
  number: number
  variant: 'active' | 'complete' | 'warning'
}) {
  const styles = {
    active: 'border-2 border-[#2f7185] bg-white text-[#2f7185]',
    complete: 'bg-[#0d9488] text-white',
    warning: 'border-2 border-[#f97306] bg-white text-[#f97306]',
  }[variant]

  return (
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${styles}`}
    >
      {number}
    </div>
  )
}

function ModeTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof Car
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 flex-1 items-center justify-center gap-1 rounded border px-6 py-3 ${
        active
          ? 'border-[#155dfc] bg-[#f0f9ff] text-[#155dfc]'
          : 'border-[#676e73] text-[var(--color-text-secondary)]'
      }`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  )
}

function FieldInput({
  value,
  onClear,
  startIcon: StartIcon,
}: {
  value: string
  onClear: () => void
  startIcon?: typeof MapPin
}) {
  return (
    <div className="flex items-center rounded border border-[var(--color-border)] px-3 py-4">
      {StartIcon && <StartIcon className="mr-2 h-6 w-6 shrink-0" />}
      <span className="flex-1 text-base">{value}</span>
      <button type="button" onClick={onClear} aria-label="Clear">
        <X className="h-6 w-6 text-[var(--color-text-secondary)]" />
      </button>
    </div>
  )
}
