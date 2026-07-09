import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslate } from '../../i18n/I18nProvider'
import type { HomeWorkflowVariant } from '../../utils/homeWorkflows'
import { trackProps } from '../../utils/tracking'

type WorkflowCardProps = {
  variant: HomeWorkflowVariant
  title: string
  description?: string
  icon: ReactNode
  onClick: () => void
  compact?: boolean
  list?: boolean
  disabled?: boolean
}

export function WorkflowCard({
  variant,
  title,
  description,
  icon,
  onClick,
  compact = false,
  list = false,
  disabled = false,
}: WorkflowCardProps) {
  const t = useTranslate()
  const accessibleLabel = disabled
    ? `${title}. ${t('common.soon')}.`
    : description
      ? `${title}. ${description.replace('\n', '. ')}`
      : title

  const [descriptionPrimary, descriptionSecondary] = description
    ? description.split('\n', 2)
    : [undefined, undefined]

  const className = [
    'home-workflow-card',
    `home-workflow-card--${variant}`,
    compact ? 'home-workflow-card--compact' : '',
    list ? 'home-workflow-card--list' : '',
    disabled ? 'home-workflow-card--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-label={accessibleLabel}
      className={className}
      data-tutorial={`workflow-${variant}`}
      {...trackProps(`home.workflow.${variant}`, { disabled })}
    >
      <div className="home-workflow-card__icon">{icon}</div>
      <div className="home-workflow-card__body">
        <p className="home-workflow-card__title">{title}</p>
        {descriptionPrimary ? (
          <div className="home-workflow-card__desc-block">
            <p className="home-workflow-card__desc">{descriptionPrimary}</p>
            {descriptionSecondary ? (
              <p className="home-workflow-card__desc-secondary">{descriptionSecondary}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      {disabled ? (
        <span className="home-workflow-card__badge">{t('common.soon')}</span>
      ) : (
        <span className="home-workflow-card__chevron" aria-hidden>
          <ChevronRight className="home-workflow-card__chevron-svg" strokeWidth={2} />
        </span>
      )}
    </button>
  )
}
