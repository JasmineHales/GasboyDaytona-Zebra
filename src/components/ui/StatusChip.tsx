import type { SectionStatus } from '../../types/flow'
import { useTranslate } from '../../i18n/I18nProvider'

const statusClass: Record<SectionStatus, string> = {
  complete: 'fleet-status-chip--complete',
  'not-started': 'fleet-status-chip--not-started',
  'in-progress': 'fleet-status-chip--in-progress',
  missing: 'fleet-status-chip--missing',
}

const statusLabelKey: Record<
  SectionStatus,
  'workflow.status.complete' | 'workflow.status.notStarted' | 'workflow.status.inProgress' | 'workflow.status.missing'
> = {
  complete: 'workflow.status.complete',
  'not-started': 'workflow.status.notStarted',
  'in-progress': 'workflow.status.inProgress',
  missing: 'workflow.status.missing',
}

type StatusChipProps = {
  status: SectionStatus
  label?: string
  variant?: 'default' | 'optional'
}

export function StatusChip({ status, label, variant = 'default' }: StatusChipProps) {
  const t = useTranslate()
  const modifier =
    variant === 'optional'
      ? 'fleet-status-chip--optional'
      : statusClass[status]

  return (
    <span className={`fleet-status-chip fleet-status-chip--inline ${modifier}`}>
      {label ?? t(statusLabelKey[status])}
    </span>
  )
}
