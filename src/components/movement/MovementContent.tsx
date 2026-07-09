import { Car, MapPin, ParkingCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { MovementMode, MovementPhase } from '../../types/flow'
import { StallIssueReportedNotice } from '../stall/StallIssueReportedNotice'
import { StallOccupiedNotice } from '../stall/StallOccupiedNotice'
import { TextField, textFieldKeySubmit } from '../ui/TextField'
import { useI18n } from '../../i18n/I18nProvider'
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
  const { messages } = useI18n()
  const movementCopy = messages.movement

  const submitStallDraft = () => {
    const value = stallDraft.trim()
    if (value) onStallSelect(value)
  }

  return (
    <div className="workflow-stack">
      <div className="workflow-stack">
        <div className="fleet-mode-tab-group" role="group" aria-label={movementCopy.modeGroup}>
          <ModeTab
            active={isTransport}
            icon={Car}
            label={movementCopy.transport}
            trackTag="movement.mode.transport"
            onClick={() => onModeChange('transport')}
          />
          <ModeTab
            active={!isTransport}
            icon={ParkingCircle}
            label={movementCopy.stall}
            trackTag="movement.mode.stall"
            onClick={() => onModeChange('stall')}
          />
        </div>

        {isTransport ? (
          <>
            {locationSelected ? (
              <TextField
                label={movementCopy.location}
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
                aria-label={movementCopy.searchLocation}
                {...trackProps('movement.location.search-open')}
              >
                <MapPin className="h-5 w-5 shrink-0 text-[var(--color-fleet-text-secondary)]" />
                <span className="fleet-field__placeholder">
                  {movementCopy.searchLocation}
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            {stallSelected || stallVerify ? (
              <TextField
                label={movementCopy.stallNo}
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
                  placeholder={movementCopy.stallNumber}
                  aria-label={movementCopy.stallNumberAria}
                  inputMode="numeric"
                  onChange={setStallDraft}
                  onBlur={submitStallDraft}
                  onKeyDown={(event) => textFieldKeySubmit(event, onStallSelect)}
                />
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

