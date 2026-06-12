import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import type { SectionStatus } from '../../types/flow'
import { StatusChip } from './StatusChip'

type AccordionSectionProps = {
  title: string
  status: SectionStatus
  expanded: boolean
  onToggle: () => void
  children?: ReactNode
  collapsedOnly?: boolean
  disabled?: boolean
  isLast?: boolean
  sectionRef?: Ref<HTMLDivElement>
}

export function AccordionSection({
  title,
  status,
  expanded,
  onToggle,
  children,
  collapsedOnly = false,
  disabled = false,
  isLast = true,
  sectionRef,
}: AccordionSectionProps) {
  return (
    <div ref={sectionRef} className="bg-white">
      <button
        type="button"
        data-accordion-scroll-header
        onClick={onToggle}
        disabled={disabled}
        aria-disabled={disabled}
        className={`fleet-accordion-header${disabled ? ' fleet-accordion-header--disabled' : ''}`}
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <StatusChip status={status} />
          <p className="text-lg font-bold text-[var(--color-fleet-text)]">{title}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-7 w-7 shrink-0 text-[var(--color-fleet-text)]" />
        ) : (
          <ChevronDown className="h-7 w-7 shrink-0 text-[var(--color-fleet-text)]" />
        )}
      </button>

      {expanded && !collapsedOnly && (
        <>
          <div className="h-px bg-[var(--color-fleet-secondary-border)]" />
          {/* Accordion body never scrolls — page scroll only (TransportScreen main). */}
          <div className="px-4 pb-4 pt-3">{children}</div>
        </>
      )}

      {!isLast && <div className="h-px bg-[var(--color-fleet-secondary-border)]" />}
    </div>
  )
}

type AccordionGroupProps = {
  children: ReactNode
  className?: string
}

export function AccordionGroup({ children, className }: AccordionGroupProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-[var(--color-fleet-secondary-border)] bg-white ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
