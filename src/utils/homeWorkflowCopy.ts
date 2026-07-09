import type { Messages } from '../i18n/types'
import type {
  HomeWorkflowGroup,
  HomeWorkflowGroupId,
  HomeWorkflowId,
  HomeWorkflowItem,
  HomeWorkflowVariant,
} from './homeWorkflows'

const WORKFLOW_META: Array<{
  id: HomeWorkflowId
  variant: HomeWorkflowVariant
  group: HomeWorkflowGroupId
  comingSoon?: boolean
  devOnly?: boolean
}> = [
  { id: 'vsa', variant: 'vsa', group: 'turnaround' },
  { id: 'transport', variant: 'transport', group: 'turnaround' },
  { id: 'fuel', variant: 'fuel', group: 'turnaround' },
  { id: 'chase-van', variant: 'chase-van', group: 'turnaround', comingSoon: true },
  { id: 'dispatcher', variant: 'dispatcher', group: 'turnaround', comingSoon: true },
  { id: 'inspection', variant: 'inspection', group: 'turnaround', comingSoon: true },
  { id: 'keys', variant: 'keys', group: 'turnaround', comingSoon: true },
  {
    id: 'non-driving-activity',
    variant: 'non-driving-activity',
    group: 'turnaround',
    comingSoon: true,
  },
]

export function buildHomeWorkflowItems(
  workflows: Messages['home']['workflows'],
): HomeWorkflowItem[] {
  return WORKFLOW_META.map((meta) => ({
    ...meta,
    title: workflows[meta.id].title,
    description: workflows[meta.id].description,
  }))
}

export function buildHomeWorkflowGroups(
  groups: Messages['home']['groups'],
): HomeWorkflowGroup[] {
  return [
    {
      id: 'turnaround',
      label: groups.turnaround.label,
      description: groups.turnaround.description,
    },
  ]
}
