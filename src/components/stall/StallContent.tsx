import { useEffect, useState } from 'react'
import type { StallPhase } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { TextField, textFieldKeySubmit } from '../ui/TextField'
import { getStallProgress } from '../../utils/progress'
import { trackProps } from '../../utils/tracking'
import { StallIssueReportedNotice } from './StallIssueReportedNotice'
import { StallOccupiedNotice } from './StallOccupiedNotice'

type StallContentProps = {
  phase: StallPhase
  stallNumber: string
  onStallSelect: (stall: string) => void
  onStallClear: () => void
  onTakePhoto: () => void
  onRetakePhoto: () => void
}

type CapturedPhoto = {
  url: string
  name: string
}

export function StallContent({
  phase,
  stallNumber,
  onStallSelect,
  onStallClear,
  onTakePhoto,
  onRetakePhoto,
}: StallContentProps) {
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

  const submitStallDraft = () => {
    const value = stallDraft.trim()
    if (value) onStallSelect(value)
  }

  const isDefault = phase === 'select-stall'
  const stallVerify = phase === 'stall-verify'
  const issueReported = phase === 'stall-issue-reported'
  const progress = getStallProgress(phase)

  return (
    <div className="workflow-stack">
      <ProgressIndicator {...progress} />

      <div className="workflow-stack">
        {isDefault ? (
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
              {...trackProps('stall.number.confirm')}
            >
              Confirm Stall
            </button>
          </>
        ) : (
          <TextField
            label="Stall No."
            value={stallNumber}
            readOnly
            onClear={() => {
              handleStallClear()
            }}
            clearTrackTag="stall.number.clear"
          />
        )}

        {stallVerify && (
          <StallOccupiedNotice onTakePhoto={handleTakePhoto} trackPrefix="stall" />
        )}

        {issueReported && (
          <StallIssueReportedNotice
            onRetakePhoto={handleRetakePhoto}
            photoUrl={capturedPhoto?.url}
            photoName={capturedPhoto?.name}
            trackPrefix="stall"
          />
        )}

      </div>
    </div>
  )
}
