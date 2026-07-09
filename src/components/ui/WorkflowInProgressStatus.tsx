import { useTranslate } from '../../i18n/I18nProvider'
import { ElapsedTimer } from './ElapsedTimer'

export const NOZZLE_PICKUP_WINDOW_SECONDS = 60

export type WorkflowInProgressStatusProps = {
  pumpNumber: string
  startedAt: number | null
}

export function WorkflowInProgressStatus({
  pumpNumber,
  startedAt,
}: WorkflowInProgressStatusProps) {
  const t = useTranslate()
  const summaryPumpLabel = t('workflow.inProgress.pumpTitle', { pump: pumpNumber })

  return (
    <section
      className="workflow-in-progress workflow-in-progress--default"
      aria-label={summaryPumpLabel}
    >
      <div className="workflow-in-progress__summary">
        <p className="workflow-in-progress__summary-pump">{summaryPumpLabel}</p>
        <ElapsedTimer startedAt={startedAt} compact />
      </div>
    </section>
  )
}
