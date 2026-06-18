import type { ReactNode } from 'react'
import { useId } from 'react'

export type WorkflowNoticeVariant = 'warning' | 'info' | 'success'

export type WorkflowNoticeProps = {
  variant: WorkflowNoticeVariant
  title: string
  description: string
  icon: ReactNode
  footer?: ReactNode
  requirements?: string[]
  requirementsTitle?: string
}

export function WorkflowNotice({
  variant,
  title,
  description,
  icon,
  footer,
  requirements,
  requirementsTitle = 'Include in your photo',
}: WorkflowNoticeProps) {
  const titleId = useId()
  const descriptionId = useId()
  const requirementsId = useId()
  const describedBy = [
    descriptionId,
    requirements?.length ? requirementsId : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={`workflow-notice workflow-notice--${variant}`}
      role={variant === 'warning' ? 'alert' : 'region'}
      aria-labelledby={titleId}
      aria-describedby={describedBy || undefined}
    >
      <div className="workflow-notice__body">
        <div className="workflow-notice__top">
          <div className="workflow-notice__icon" aria-hidden="true">
            {icon}
          </div>
          <div className="workflow-notice__copy">
            <h3 className="workflow-notice__title" id={titleId}>
              {title}
            </h3>
            <p className="workflow-notice__description" id={descriptionId}>
              {description}
            </p>
          </div>
        </div>

        {requirements && requirements.length > 0 && (
          <div className="workflow-notice__requirements">
            <p className="workflow-notice__requirements-title">{requirementsTitle}</p>
            <ul className="workflow-notice__requirements-list" id={requirementsId}>
              {requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {footer && <div className="workflow-notice__action">{footer}</div>}
    </section>
  )
}
