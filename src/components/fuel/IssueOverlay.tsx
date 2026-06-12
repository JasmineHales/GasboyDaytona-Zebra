import { X } from 'lucide-react'

type IssueOverlayProps = {
  showDetails: boolean
  details: string
  onClose: () => void
  onSelectIssue: (issue: string) => void
  onSubmit: () => void
  onDetailsChange: (value: string) => void
}

const ISSUES = [
  'Pump did not dispense fuel',
  'Incorrect fuel amount',
  'Pump locked prematurely',
  'Other',
]

export function IssueOverlay({
  showDetails,
  details,
  onClose,
  onSelectIssue,
  onSubmit,
  onDetailsChange,
}: IssueOverlayProps) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50">
      <div className="flex max-h-[70%] flex-col rounded-t-2xl bg-white">
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-4 py-4">
          <p className="text-lg font-bold">Report Fueling Issue</p>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          {!showDetails ? (
            <div className="flex flex-col gap-2">
              <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
                Select the issue you experienced:
              </p>
              {ISSUES.map((issue) => (
                <button
                  key={issue}
                  type="button"
                  onClick={() => onSelectIssue(issue)}
                  className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-left text-sm font-semibold hover:bg-[var(--color-surface-muted)]"
                >
                  {issue}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">Additional Details</p>
              <textarea
                value={details}
                onChange={(e) => onDetailsChange(e.target.value)}
                placeholder="Describe the issue..."
                rows={5}
                className="resize-none rounded-lg border border-[var(--color-border)] p-3 text-sm outline-none focus:border-[var(--color-brand-primary)]"
              />
              <button
                type="button"
                onClick={onSubmit}
                className="h-10 rounded bg-[var(--color-brand-primary)] text-sm font-semibold text-white"
              >
                Submit Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
