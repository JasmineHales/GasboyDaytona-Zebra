import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { useId } from 'react'
import type { SectionStatus } from '../../types/flow'
import { ElapsedTimer } from './ElapsedTimer'
import { StatusChip } from './StatusChip'
import { trackProps } from '../../utils/tracking'

type AccordionSectionProps = {
  title: string
  status: SectionStatus
  statusLabel?: string
  chipVariant?: 'default' | 'optional'
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
}: AccordionSectionProps) {
  const panelId = useId()
  const titleId = useId()
  const showHeaderTimer =
    !expanded &&
    status === 'in-progress' &&
    headerTimerStartedAt != null

  return (
    <div ref={sectionRef} className="bg-white" data-workflow-section data-tutorial={dataTutorial}>
      <button
        type="button"
        data-workflow-section-header
        onClick={onToggle}
        disabled={disabled}
        aria-disabled={disabled}
        aria-expanded={disabled ? undefined : expanded}
        aria-controls={disabled ? undefined : panelId}
        aria-labelledby={titleId}
        className={`fleet-accordion-header${disabled ? ' fleet-accordion-header--disabled' : ''}${highlighted && !expanded ? ' fleet-accordion-header--awaiting' : ''}`}
        {...trackProps(trackTag, { expanded })}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p id={titleId} className="fleet-accordion-header__title">
            {title}
          </p>
          {disabled && disabledReason && (
            <p className="fleet-accordion-header__hint">{disabledReason}</p>
          )}
        </div>
        <div className="fleet-accordion-header__meta">
          {showHeaderTimer && (
            <div className="fleet-accordion-header__timer">
              <ElapsedTimer startedAt={headerTimerStartedAt} compact />
            </div>
          )}
          {!disabled && (
            <StatusChip status={status} label={statusLabel} variant={chipVariant} />
          )}
          {expanded ? (
            <ChevronUp className="h-7 w-7 shrink-0 text-[var(--color-fleet-text)]" aria-hidden />
          ) : (
            <ChevronDown className="h-7 w-7 shrink-0 text-[var(--color-fleet-text)]" aria-hidden />
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

      {!isLast && <div className="h-px bg-[var(--color-fleet-secondary-border)]" />}
    </div>
  )
}

type AccordionGroupProps = {
  children: ReactNode
  className?: string
  groupRef?: Ref<HTMLDivElement>
}

export function AccordionGroup({
  children,
  className,
  groupRef,
}: AccordionGroupProps) {
  return (
    <div
      ref={groupRef}
      data-workflow-widget="accordion"
      className={`overflow-hidden rounded-lg border-2 border-[var(--color-fleet-secondary-border)] bg-white ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
