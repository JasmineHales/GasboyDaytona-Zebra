import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { useId } from 'react'
import { useTranslate } from '../../i18n/I18nProvider'
import type { SectionStatus } from '../../types/flow'
import { ElapsedTimer } from './ElapsedTimer'
import { StatusChip } from './StatusChip'
import { trackProps } from '../../utils/tracking'

type AccordionSectionProps = {
  title: string
  status: SectionStatus
  statusLabel?: string
  chipVariant?: 'default' | 'optional' | 'required'
  highlighted?: boolean
  expanded: boolean
  onToggle: () => void
  children?: ReactNode
  collapsedOnly?: boolean
  disabled?: boolean
  disabledReason?: string
  isLast?: boolean
  trackTag: string
  sectionRef?: Ref<HTMLDivElement>
  headerTimerStartedAt?: number | null
  dataTutorial?: string
  layout?: 'grouped' | 'card'
  sectionIcon?: ReactNode
  subtitle?: string
}

export function AccordionSection({
  title,
  status,
  statusLabel,
  chipVariant = 'default',
  highlighted = false,
  expanded,
  onToggle,
  children,
  collapsedOnly = false,
  disabled = false,
  disabledReason,
  isLast = true,
  trackTag,
  sectionRef,
  headerTimerStartedAt = null,
  dataTutorial,
  layout = 'grouped',
  sectionIcon,
  subtitle,
}: AccordionSectionProps) {
  const t = useTranslate()
  const panelId = useId()
  const titleId = useId()
  const isCard = layout === 'card'
  const isOptional = chipVariant === 'optional'
  const isRequired = chipVariant === 'required'
  const showHeaderTimer =
    !expanded &&
    !isRequired &&
    status === 'in-progress' &&
    headerTimerStartedAt != null
  const showStatusChip = !disabled && !isCard

  const headerClass = [
    'fleet-accordion-header',
    disabled ? 'fleet-accordion-header--disabled' : '',
    highlighted && !expanded ? 'fleet-accordion-header--awaiting' : '',
    isCard ? 'fleet-accordion-header--card' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={sectionRef}
      className={isCard ? 'workflow-section-card__inner' : 'app-surface'}
      data-workflow-section
      data-tutorial={dataTutorial}
    >
      <button
        type="button"
        data-workflow-section-header
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={disabled ? undefined : expanded}
        aria-controls={disabled ? undefined : panelId}
        aria-labelledby={titleId}
        className={headerClass}
        {...trackProps(trackTag, { expanded })}
      >
        {isCard ? (
          <div className="workflow-section-card__leading">
            {sectionIcon ? (
              <span className="workflow-section-card__icon" aria-hidden>
                {sectionIcon}
              </span>
            ) : null}
            <div className="workflow-section-card__copy">
              <div className="workflow-section-card__title-row">
                <h2 id={titleId} className="fleet-accordion-header__title">
                  {title}
                </h2>
                {isOptional ? (
                  <span className="workflow-pill workflow-pill--optional">
                    {t('workflow.optional')}
                  </span>
                ) : (
                  <span className="workflow-pill workflow-pill--required">
                    {t('workflow.required')}
                  </span>
                )}
              </div>
              {subtitle ? (
                <p className="workflow-section-card__subtitle">{subtitle}</p>
              ) : null}
              {disabled && disabledReason ? (
                <p className="fleet-accordion-header__hint">{disabledReason}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 id={titleId} className="fleet-accordion-header__title">
              {title}
            </h2>
            {disabled && disabledReason && (
              <p className="fleet-accordion-header__hint">{disabledReason}</p>
            )}
          </div>
        )}
        <div className="fleet-accordion-header__meta">
          {showHeaderTimer && (
            <div className="fleet-accordion-header__timer">
              <ElapsedTimer startedAt={headerTimerStartedAt} compact />
            </div>
          )}
          {showStatusChip && (
            <StatusChip status={status} label={statusLabel} variant={chipVariant} />
          )}
          {!disabled && (
            <>
              {expanded ? (
                <ChevronUp
                  className="fleet-accordion-header__chevron"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : (
                <ChevronDown
                  className="fleet-accordion-header__chevron"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
            </>
          )}
        </div>
      </button>

      {expanded && !collapsedOnly && (
        <>
          <div className="h-px bg-[var(--color-fleet-secondary-border)]" />
          <div
            id={panelId}
            role="region"
            aria-labelledby={titleId}
            className="fleet-accordion-body"
          >
            {children}
          </div>
        </>
      )}

      {!isLast && !isCard && (
        <div className="h-px bg-[var(--color-fleet-secondary-border)]" />
      )}
    </div>
  )
}

type AccordionGroupProps = {
  children: ReactNode
  className?: string
  groupRef?: Ref<HTMLDivElement>
  'aria-labelledby'?: string
}

export function AccordionGroup({
  children,
  className,
  groupRef,
  'aria-labelledby': ariaLabelledBy,
}: AccordionGroupProps) {
  return (
    <div
      ref={groupRef}
      data-workflow-widget="accordion"
      className={`fleet-accordion-group ${className ?? ''}`}
      role="group"
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </div>
  )
}
