import type { VehicleSearchActivityType } from '../types/vehicleSearch'
import type { WorkflowView } from './flowNavigation'
import type { Messages } from '../i18n/types'

export type VehicleSearchActivityConfig = {
  titleKey: keyof Messages['vehicleSearch']['titles']
  badgeKey: keyof Messages['vehicleSearch']['badges']
  confirmLabelKey: 'continue' | 'selectVehicle'
}

const ACTIVITY_CONFIG: Record<VehicleSearchActivityType, VehicleSearchActivityConfig> = {
  Fuel: { titleKey: 'fuel', badgeKey: 'fuel', confirmLabelKey: 'continue' },
  Transporter: { titleKey: 'transporter', badgeKey: 'transporter', confirmLabelKey: 'continue' },
  VSA: { titleKey: 'vsa', badgeKey: 'vsa', confirmLabelKey: 'selectVehicle' },
  'Car Wash': { titleKey: 'carWash', badgeKey: 'carWash', confirmLabelKey: 'continue' },
  'Stall Move': { titleKey: 'stallMove', badgeKey: 'stallMove', confirmLabelKey: 'continue' },
  'Transport Move': { titleKey: 'transportMove', badgeKey: 'transportMove', confirmLabelKey: 'continue' },
  'Non-Driving Activity': {
    titleKey: 'nonDriving',
    badgeKey: 'nonDriving',
    confirmLabelKey: 'continue',
  },
}

export function getVehicleSearchActivityConfig(
  activityType: VehicleSearchActivityType,
): VehicleSearchActivityConfig {
  return ACTIVITY_CONFIG[activityType]
}

export function workflowToActivityType(workflow: WorkflowView): VehicleSearchActivityType {
  switch (workflow) {
    case 'fuel':
      return 'Fuel'
    case 'transport':
      return 'Transporter'
    case 'vsa':
      return 'VSA'
  }
}
