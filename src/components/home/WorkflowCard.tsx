import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { trackProps } from '../../utils/tracking'

type WorkflowCardProps = {
  variant: 'vsa' | 'transport' | 'fuel' | 'tracking'
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
}

export function WorkflowCard({
  variant,
  title,
  description,
  icon,
  onClick,
}: WorkflowCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`home-workflow-card home-workflow-card--${variant}`}
      data-tutorial={`workflow-${variant}`}
      {...trackProps(`home.workflow.${variant}`)}
    >
      <div className="home-workflow-card__icon">{icon}</div>
      <div className="home-workflow-card__body">
        <p className="home-workflow-card__title">{title}</p>
        <p className="home-workflow-card__desc">{description}</p>
      </div>
      <span className="home-workflow-card__chevron" aria-hidden>
        <ChevronRight className="h-5 w-5" />
      </span>
    </button>
  )
}
