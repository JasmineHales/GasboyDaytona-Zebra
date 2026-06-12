import type { SectionStatus } from '../../types/flow'

const styles: Record<SectionStatus, string> = {
  complete: 'fleet-chip fleet-chip-success',
  'not-started': 'fleet-chip fleet-chip-neutral',
  'in-progress': 'fleet-chip fleet-chip-info',
  missing: 'fleet-chip fleet-chip-warning',
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
  return <span className={styles[status]}>{labels[status]}</span>
}
