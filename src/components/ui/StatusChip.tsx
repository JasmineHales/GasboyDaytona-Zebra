import type { SectionStatus } from '../../types/flow'

const statusClass: Record<SectionStatus, string> = {
  complete: 'fleet-status-chip--complete',
  'not-started': 'fleet-status-chip--not-started',
  'in-progress': 'fleet-status-chip--in-progress',
  missing: 'fleet-status-chip--missing',
}

const labels: Record<SectionStatus, string> = {
  complete: 'Complete',
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  missing: 'Missing Information',
}

type StatusChipProps = {
  status: SectionStatus
  label?: string
  variant?: 'default' | 'optional'
}

export function StatusChip({ status, label, variant = 'default' }: StatusChipProps) {
  const modifier =
    variant === 'optional'
      ? 'fleet-status-chip--optional'
      : statusClass[status]

  return (
    <span className={`fleet-status-chip fleet-status-chip--inline ${modifier}`}>
      {label ?? labels[status]}
    </span>
  )
}
