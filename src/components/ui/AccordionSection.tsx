import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'
import type { SectionStatus } from '../../types/flow'
import { StatusChip } from './StatusChip'

type AccordionSectionProps = {
  title: string
  status: SectionStatus
  expanded: boolean
  onToggle: () => void
  children?: ReactNode
  collapsedOnly?: boolean
}

export function AccordionSection({
  title,
  status,
  expanded,
  onToggle,
  children,
  collapsedOnly = false,
}: AccordionSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border-2 border-[var(--color-border)] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2 text-left"
      >
        <div className="flex flex-col gap-1">
          <StatusChip status={status} />
          <p className="text-lg font-bold">{title}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-6 w-6 shrink-0" />
        ) : (
          <ChevronDown className="h-6 w-6 shrink-0" />
        )}
      </button>

      {expanded && !collapsedOnly && (
        <>
          <div className="h-px bg-[var(--color-border-light)]" />
          <div className="bg-white px-4 pb-4 pt-2">{children}</div>
        </>
      )}
    </div>
  )
}
