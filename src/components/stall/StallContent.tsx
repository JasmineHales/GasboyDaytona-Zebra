import { useState } from 'react'
import type { StallPhase } from '../../types/flow'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { TextField, textFieldKeySubmit } from '../ui/TextField'
import { getStallProgress } from '../../utils/progress'
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

export function StallContent({
  phase,
  stallNumber,
  onStallSelect,
  onStallClear,
  onTakePhoto,
  onRetakePhoto,
}: StallContentProps) {
  const [stallDraft, setStallDraft] = useState('')

  const isDefault = phase === 'select-stall'
  const stallVerify = phase === 'stall-verify'
  const issueReported = phase === 'stall-issue-reported'
  const progress = getStallProgress(phase)

  return (
    <div className="workflow-stack">
      <ProgressIndicator {...progress} />

      <div className="workflow-stack">
        {isDefault ? (
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
        ) : (
          <TextField
            label="Stall No."
            value={stallNumber}
            readOnly
            onClear={() => {
              setStallDraft('')
              onStallClear()
            }}
          />
        )}

        {stallVerify && <StallOccupiedNotice onTakePhoto={onTakePhoto} />}

        {issueReported && (
          <StallIssueReportedNotice onRetakePhoto={onRetakePhoto} />
        )}

      </div>
    </div>
  )
}
