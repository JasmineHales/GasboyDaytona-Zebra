import type { ReactNode } from 'react'
import { useId } from 'react'
import { ElapsedTimer } from './ElapsedTimer'

export type WorkflowInProgressTone = 'remote' | 'default'

export type WorkflowInProgressStatusProps = {
  title: string
  subtitle: string
  note?: string
  icon: ReactNode
  pumpNumber: string
  startedAt: number | null
  tone?: WorkflowInProgressTone
  statusLabel?: string
  elapsedLabel?: string
  pumpLabel?: string
}

export function WorkflowInProgressStatus({
  title,
  subtitle,
  note,
  icon,
  pumpNumber,
  startedAt,
  tone = 'default',
  statusLabel = 'In progress',
  elapsedLabel = 'Elapsed',
  pumpLabel = 'Pump',
}: WorkflowInProgressStatusProps) {
  const titleId = useId()
  const subtitleId = useId()
  const noteId = useId()
  const pumpLabelId = useId()
  const elapsedLabelId = useId()
  const describedBy = [subtitleId, note ? noteId : null].filter(Boolean).join(' ')

  return (
    <section
      className={`workflow-in-progress workflow-in-progress--${tone}`}
      aria-labelledby={titleId}
      aria-describedby={describedBy || undefined}
    >
      <div className="workflow-in-progress__top">
        <div className="workflow-in-progress__icon" aria-hidden="true">
          {icon}
        </div>
        <div className="workflow-in-progress__copy">
          <h3 className="workflow-in-progress__title" id={titleId}>
            {title}
          </h3>
          <p className="workflow-in-progress__subtitle" id={subtitleId}>
            {subtitle}
          </p>
        </div>
        <span className="workflow-in-progress__chip" role="status">
          <span className="workflow-in-progress__pulse" aria-hidden="true" />
          {statusLabel}
        </span>
      </div>

      <div className="workflow-in-progress__metrics">
        <div className="workflow-in-progress__metric">
          <p className="workflow-in-progress__metric-label" id={pumpLabelId}>
            {pumpLabel}
          </p>
          <p
            className="workflow-in-progress__metric-value"
            aria-labelledby={pumpLabelId}
          >
            {pumpNumber}
          </p>
        </div>
        <div className="workflow-in-progress__metric workflow-in-progress__metric--time">
          <p className="workflow-in-progress__metric-label" id={elapsedLabelId}>
            {elapsedLabel}
          </p>
          <ElapsedTimer
            startedAt={startedAt}
            compact
            labelId={elapsedLabelId}
          />
        </div>
      </div>

      {note && (
        <p className="workflow-in-progress__note" id={noteId}>
          {note}
        </p>
      )}
    </section>
  )
}
