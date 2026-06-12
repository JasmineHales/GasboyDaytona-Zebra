import { Car, MapPin, ParkingCircle } from 'lucide-react'
import { useState } from 'react'
import type { MovementMode, MovementPhase } from '../../types/flow'
import { StallIssueReportedNotice } from '../stall/StallIssueReportedNotice'
import { StallOccupiedNotice } from '../stall/StallOccupiedNotice'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { TextField, textFieldKeySubmit } from '../ui/TextField'
import { getMovementProgress } from '../../utils/progress'

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
  const progress = getMovementProgress(mode, phase)

  return (
    <div className="workflow-stack">
      <ProgressIndicator {...progress} />

      <div className="workflow-stack">
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
            {locationSelected ? (
              <TextField
                label="Location"
                value={location}
                readOnly
                startIcon={MapPin}
                onClear={onLocationClear}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <p className="fleet-field__label">Location</p>
                <button
                  type="button"
                  onClick={onOpenLocationSearch}
                  className="fleet-field w-full text-left"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-[var(--color-fleet-text-secondary)]" />
                  <span className="fleet-field__value text-[var(--color-fleet-text-secondary)]">
                    Select Location
                  </span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {stallSelected || stallVerify ? (
              <TextField
                label="Stall No."
                value={stallNumber}
                readOnly
                onClear={() => {
                  setStallDraft('')
                  onStallClear()
                }}
              />
            ) : (
              <TextField
                label="Stall No."
                value={stallDraft}
                placeholder="Stall Number"
                inputMode="numeric"
                onChange={setStallDraft}
                onBlur={() => {
                  const value = stallDraft.trim()
                  if (value) onStallSelect(value)
                }}
                onKeyDown={(event) =>
                  textFieldKeySubmit(event, (value) => onStallSelect(value))
                }
              />
            )}

            {stallVerify && <StallOccupiedNotice onTakePhoto={onTakePhoto} />}

            {issueReported && (
              <StallIssueReportedNotice onRetakePhoto={onRetakePhoto} />
            )}
          </>
        )}
      </div>
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
      className={`field-target flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded border-2 px-6 py-3 ${
        active
          ? 'border-[#155dfc] bg-[#f0f9ff] text-[#155dfc]'
          : 'border-[#676e73] text-[var(--color-text-secondary)]'
      }`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span className="text-base font-semibold">{label}</span>
    </button>
  )
}

