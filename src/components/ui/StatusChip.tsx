import type { SectionStatus } from '../../types/flow'

const styles: Record<SectionStatus, string> = {
  complete: 'bg-[var(--color-chip-complete-bg)] text-[var(--color-text-success)]',
  'not-started': 'bg-[var(--color-chip-neutral-bg)] text-[var(--color-text-primary)]',
  'in-progress': 'bg-[#dbeafe] text-[var(--color-brand-primary-dark)]',
  missing: 'bg-[#fef3c7] text-[#92400e]',
}

const labels: Record<SectionStatus, string> = {
  complete: 'Complete',
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  missing: 'Missing Information',
}

type StatusChipProps = {
  status: SectionStatus
}

export function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={`inline-flex min-h-6 max-h-6 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
