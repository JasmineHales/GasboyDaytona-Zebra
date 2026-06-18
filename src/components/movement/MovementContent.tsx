import { Car, MapPin, ParkingCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { MovementMode, MovementPhase } from '../../types/flow'
import { StallIssueReportedNotice } from '../stall/StallIssueReportedNotice'
import { StallOccupiedNotice } from '../stall/StallOccupiedNotice'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { TextField, textFieldKeySubmit } from '../ui/TextField'
import { getMovementProgress } from '../../utils/progress'
import { trackProps } from '../../utils/tracking'

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

type CapturedPhoto = {
  url: string
  name: string
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
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null)

  useEffect(() => {
    return () => {
      if (capturedPhoto?.url) URL.revokeObjectURL(capturedPhoto.url)
    }
  }, [capturedPhoto?.url])

  const handleTakePhoto = (file: File) => {
    setCapturedPhoto((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return { url: URL.createObjectURL(file), name: file.name }
    })
    onTakePhoto()
  }

  const handleRetakePhoto = () => {
    setCapturedPhoto((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
    onRetakePhoto()
  }

  const handleStallClear = () => {
    setCapturedPhoto((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
    setStallDraft('')
    onStallClear()
  }

  const isTransport = mode === 'transport'
  const locationSelected = phase === 'location-selected'
  const stallSelected = phase === 'stall-selected' || phase === 'stall-issue-reported'
  const stallVerify = phase === 'stall-verify'
  const issueReported = phase === 'stall-issue-reported'
  const progress = getMovementProgress(mode, phase)

  const submitStallDraft = () => {
    const value = stallDraft.trim()
    if (value) onStallSelect(value)
  }

  return (
    <div className="workflow-stack">
      <ProgressIndicator {...progress} />

      <div className="workflow-stack">
        <div className="fleet-mode-tab-group" role="group" aria-label="Movement mode">
          <ModeTab
            active={isTransport}
            icon={Car}
            label="Transport"
            trackTag="movement.mode.transport"
            onClick={() => onModeChange('transport')}
          />
          <ModeTab
            active={!isTransport}
            icon={ParkingCircle}
            label="Stall"
            trackTag="movement.mode.stall"
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
                clearTrackTag="movement.location.clear"
              />
            ) : (
              <button
                type="button"
                onClick={onOpenLocationSearch}
                className="fleet-field w-full text-left"
                aria-label="Search location"
                {...trackProps('movement.location.search-open')}
              >
                <MapPin className="h-5 w-5 shrink-0 text-[var(--color-fleet-text-secondary)]" />
                <span className="fleet-field__value text-[var(--color-fleet-text-secondary)]">
                  Search location
                </span>
              </button>
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
                  handleStallClear()
                }}
                clearTrackTag="movement.stall.clear"
              />
            ) : (
              <>
                <TextField
                  value={stallDraft}
                  placeholder="Stall Number"
                  aria-label="Stall number"
                  inputMode="numeric"
                  onChange={setStallDraft}
                  onKeyDown={(event) => textFieldKeySubmit(event, onStallSelect)}
                />
                <button
                  type="button"
                  onClick={submitStallDraft}
                  disabled={!stallDraft.trim()}
                  className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
                  {...trackProps('movement.stall.confirm')}
                >
                  Confirm Stall
                </button>
              </>
            )}

            {stallVerify && (
              <StallOccupiedNotice
                onTakePhoto={handleTakePhoto}
                trackPrefix="movement.stall"
              />
            )}

            {issueReported && (
              <StallIssueReportedNotice
                onRetakePhoto={handleRetakePhoto}
                photoUrl={capturedPhoto?.url}
                photoName={capturedPhoto?.name}
                trackPrefix="movement.stall"
              />
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
  trackTag,
  onClick,
}: {
  active: boolean
  icon: typeof Car
  label: string
  trackTag: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`fleet-mode-tab ${active ? 'fleet-mode-tab--active' : ''}`}
      {...trackProps(trackTag, { active })}
    >
      <Icon className="h-6 w-6 shrink-0" aria-hidden />
      <span className="text-base font-semibold">{label}</span>
    </button>
  )
}

