export type HistoryWorkflowFilter = 'all' | 'transport' | 'vsa' | 'fuel'

export type HistoryDatePreset = 'all' | 'today' | 'yesterday' | 'last7' | 'last30'

export type HistoryFilters = {
  workflowType: HistoryWorkflowFilter
  datePreset: HistoryDatePreset
}

export const EMPTY_HISTORY_FILTERS: HistoryFilters = {
  workflowType: 'all',
  datePreset: 'all',
}

export const HISTORY_WORKFLOW_FILTERS: HistoryWorkflowFilter[] = [
  'all',
  'transport',
  'vsa',
  'fuel',
]

export const HISTORY_DATE_PRESETS: HistoryDatePreset[] = [
  'all',
  'today',
  'yesterday',
  'last7',
  'last30',
]

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function countActiveHistoryFilters(filters: HistoryFilters): number {
  let count = 0
  if (filters.workflowType !== 'all') count += 1
  if (filters.datePreset !== 'all') count += 1
  return count
}

export function matchesHistoryDatePreset(
  completedAtIso: string,
  preset: HistoryDatePreset,
  now = new Date(),
): boolean {
  if (preset === 'all') return true

  const completedAt = new Date(completedAtIso)
  if (Number.isNaN(completedAt.getTime())) return false

  const today = startOfDay(now)
  const itemDay = startOfDay(completedAt)
  const diffDays = Math.round((today.getTime() - itemDay.getTime()) / 86_400_000)

  switch (preset) {
    case 'today':
      return diffDays === 0
    case 'yesterday':
      return diffDays === 1
    case 'last7':
      return diffDays >= 0 && diffDays <= 6
    case 'last30':
      return diffDays >= 0 && diffDays <= 29
    default:
      return true
  }
}
