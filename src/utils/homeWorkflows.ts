export type HomeWorkflowVariant =
  | 'vsa'
  | 'transport'
  | 'fuel'
  | 'chase-van'
  | 'dispatcher'
  | 'inspection'
  | 'keys'
  | 'non-driving-activity'
  | 'default'

export type HomeWorkflowId =
  | 'vsa'
  | 'transport'
  | 'fuel'
  | 'chase-van'
  | 'dispatcher'
  | 'inspection'
  | 'keys'
  | 'non-driving-activity'

export type HomeWorkflowGroupId = 'turnaround'

export type HomeWorkflowItem = {
  id: HomeWorkflowId
  title: string
  description: string
  variant: HomeWorkflowVariant
  group: HomeWorkflowGroupId
  /** Shown in the list but not wired to a screen yet. */
  comingSoon?: boolean
}

export type HomeWorkflowGroup = {
  id: HomeWorkflowGroupId
  label: string
  description?: string
}

/** Add new turnaround actions here — list layout scales via grouped compact rows. */
export const HOME_WORKFLOW_ITEMS: HomeWorkflowItem[] = [
  {
    id: 'vsa',
    title: 'VSA',
    description: 'Clean vehicle\nOptional fuel & stall',
    variant: 'vsa',
    group: 'turnaround',
  },
  {
    id: 'transport',
    title: 'Transporter',
    description: 'Move or stall vehicle\nOptional fuel',
    variant: 'transport',
    group: 'turnaround',
  },
  {
    id: 'fuel',
    title: 'Fuel Only',
    description: 'Fuel only transaction',
    variant: 'fuel',
    group: 'turnaround',
  },
  {
    id: 'chase-van',
    title: 'Chase Van',
    description: 'Retrieve customer chase van',
    variant: 'chase-van',
    group: 'turnaround',
    comingSoon: true,
  },
  {
    id: 'dispatcher',
    title: 'Dispatcher',
    description: 'Coordinate fleet dispatch',
    variant: 'dispatcher',
    group: 'turnaround',
    comingSoon: true,
  },
  {
    id: 'inspection',
    title: 'Inspection',
    description: 'Pre-rental vehicle check',
    variant: 'inspection',
    group: 'turnaround',
    comingSoon: true,
  },
  {
    id: 'keys',
    title: 'Keys',
    description: 'Key handoff & return',
    variant: 'keys',
    group: 'turnaround',
    comingSoon: true,
  },
  {
    id: 'non-driving-activity',
    title: 'Non-Driving Activity',
    description: 'Track work without driving a vehicle',
    variant: 'non-driving-activity',
    group: 'turnaround',
    comingSoon: true,
  },
]

export const HOME_WORKFLOW_GROUPS: HomeWorkflowGroup[] = [
  {
    id: 'turnaround',
    label: 'Turnaround',
    description: 'Start a vehicle workflow',
  },
]

export function homeWorkflowGroups(): HomeWorkflowGroup[] {
  return HOME_WORKFLOW_GROUPS
}

export function homeWorkflowItemsForGroup(
  groupId: HomeWorkflowGroupId,
): HomeWorkflowItem[] {
  return HOME_WORKFLOW_ITEMS.filter((item) => item.group === groupId)
}
