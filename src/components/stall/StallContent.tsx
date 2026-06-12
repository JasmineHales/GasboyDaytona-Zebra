import { AlertTriangle, Camera, Info, X } from 'lucide-react'
import { useState } from 'react'
import type { StallPhase } from '../../types/flow'
import { PhotoAttachmentPreview } from '../ui/PhotoAttachmentPreview'
import { ProgressIndicator } from '../ui/ProgressIndicator'
import { getStallProgress } from '../../utils/progress'

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
    <div className="flex flex-col gap-2.5">
      <ProgressIndicator {...progress} />

      <div className="flex flex-col gap-2.5">
        <p className="text-base font-bold tracking-tight text-[#101828]">Stall No.</p>

        {isDefault ? (
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
        ) : (
          <FieldInput
            value={stallNumber}
            onClear={() => {
              setStallDraft('')
              onStallClear()
            }}
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
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
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
              <PhotoAttachmentPreview fileName="IMG-26_256_2265_2563.jpog" />
            </div>
            <button
              type="button"
              onClick={onRetakePhoto}
              className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            >
              <Camera className="h-6 w-6" />
              Retake Photo
            </button>
          </>
        )}

      </div>
    </div>
  )
}

function FieldInput({ value, onClear }: { value: string; onClear: () => void }) {
  return (
    <div className="flex items-center rounded border border-[var(--color-border)] px-3 py-4">
      <span className="flex-1 text-base">{value}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClear()
        }}
        className="field-target flex shrink-0 items-center justify-center"
        aria-label="Clear stall number"
      >
        <X className="h-6 w-6 text-[var(--color-text-secondary)]" />
      </button>
    </div>
  )
}
