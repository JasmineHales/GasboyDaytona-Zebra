import { useI18n } from '../../i18n/I18nProvider'
import { ExpandableAssistanceCard } from './ExpandableAssistanceCard'

export type PumpIssueCardProps = {
  /** Opens the pump issue report flow. */
  onReportIssue: () => void
  /** Shows a loading state while the report is being submitted. */
  isReporting?: boolean
  disabled?: boolean
  trackTag?: string
}

/**
 * Assistance card shown during active fueling when the driver may need help
 * with a pump that stopped early or is not dispensing correctly.
 */
export function PumpIssueCard({
  onReportIssue,
  isReporting = false,
  disabled = false,
  trackTag = 'fuel.report-issue.in-progress',
}: PumpIssueCardProps) {
  const { messages } = useI18n()
  const copy = messages.fuel

  return (
    <ExpandableAssistanceCard
      title={copy.pumpIssuesTitle}
      description={copy.pumpIssuesDesc}
      actionLabel={copy.reportAndContinue}
      onAction={onReportIssue}
      isActionLoading={isReporting}
      actionDisabled={disabled}
      actionTrackTag={trackTag}
      toggleTrackTag="fuel.report-issue.in-progress.toggle"
    />
  )
}
