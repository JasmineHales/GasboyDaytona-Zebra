import { Loader2 } from 'lucide-react'
import { useId } from 'react'
import { trackProps } from '../../utils/tracking'

export type PumpIssueCardProps = {
  /** Opens the pump issue report flow. */
  onReportIssue: () => void
  /** Shows a loading state while the report is being submitted. */
  isReporting?: boolean
  disabled?: boolean
  trackTag?: string
  /** Stacked layout with full-width action for in-progress fueling. */
  layout?: 'stack' | 'horizontal'
}

/**
 * Assistance card shown during active fueling when the driver may need help
 * with a pump that stopped early or is not dispensing correctly.
 *
 * Accessibility:
 * - `section` landmark with `aria-labelledby` / `aria-describedby`
 * - 48px+ touch target on the primary action
 * - `aria-busy` while reporting
 */
export function PumpIssueCard({
  onReportIssue,
  isReporting = false,
  disabled = false,
  trackTag = 'fuel.report-issue.in-progress',
  layout = 'stack',
}: PumpIssueCardProps) {
  const titleId = useId()
  const descriptionId = useId()
  const isDisabled = disabled || isReporting
  const isHorizontal = layout === 'horizontal'

  const copy = (
    <div className="pump-issue-card__copy">
      <p id={titleId} className="pump-issue-card__title">
        Pump issue?
      </p>
      <p id={descriptionId} className="pump-issue-card__message">
        Report if fueling stopped early or fuel isn&apos;t dispensing.
      </p>
    </div>
  )

  const actionButton = (
    <button
      type="button"
      onClick={onReportIssue}
      disabled={isDisabled}
      className={`pump-issue-card__action fleet-btn fleet-btn-lg fleet-btn-elevated w-full${
        isReporting ? ' pump-issue-card__action--loading' : ''
      }`}
      aria-busy={isReporting}
      {...trackProps(trackTag)}
    >
      {isReporting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Reporting...
        </>
      ) : (
        'Report & Continue'
      )}
    </button>
  )

  return (
    <section
      className={`pump-issue-card${
        isHorizontal ? ' pump-issue-card--horizontal' : ''
      }`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {copy}
      {actionButton}
    </section>
  )
}
