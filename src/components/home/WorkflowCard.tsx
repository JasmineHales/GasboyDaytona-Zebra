import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslate } from '../../i18n/I18nProvider'
import type { HomeWorkflowVariant } from '../../utils/homeWorkflows'
import { trackProps } from '../../utils/tracking'

type WorkflowCardProps = {
  variant: HomeWorkflowVariant
  title: string
  icon: ReactNode
  onClick: () => void
  compact?: boolean
  disabled?: boolean
}

export function WorkflowCard({
  variant,
  title,
  icon,
  onClick,
  compact = false,
  disabled = false,
}: WorkflowCardProps) {
  const t = useTranslate()

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-label={disabled ? `${title}. ${t('common.soon')}.` : undefined}
      className={`home-workflow-card home-workflow-card--${variant}${
        compact ? ' home-workflow-card--compact' : ''
      }${disabled ? ' home-workflow-card--disabled' : ''}`}
      data-tutorial={`workflow-${variant}`}
      {...trackProps(`home.workflow.${variant}`, { disabled })}
    >
      <div className="home-workflow-card__icon">{icon}</div>
      <div className="home-workflow-card__body">
        <p className="home-workflow-card__title">{title}</p>
      </div>
      {disabled ? (
        <span className="home-workflow-card__badge">{t('common.soon')}</span>
      ) : (
        <span className="home-workflow-card__chevron" aria-hidden>
          <ChevronRight className="h-5 w-5" />
        </span>
      )}
    </button>
  )
}
