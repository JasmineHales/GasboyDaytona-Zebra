import type { FlowContext, SectionStatus, WorkflowSection } from '../types/flow'
import { getCleaningProgress, getFuelProgress, getMovementProgress, getStallProgress } from './progress'

export type VehiclePriority = 'high' | 'medium' | 'low'

export type VehicleHoldWarning = {
  code: string
  message: string
}

export type VehicleProfile = {
  unitId: string
  name: string
  vehicleClass: string
  holdWarning?: VehicleHoldWarning
  carPriority?: string
  carTier?: string
}

export type VehicleSummary = {
  unitId: string
  name: string
  vehicleClass: string
  holdWarning?: VehicleHoldWarning
  carPriority?: string
  carTier?: string
  priority: VehiclePriority
  priorityLabel: string
  overallStatus: SectionStatus
  nextAction: string
  completedSections: number
  totalSections: number
  progressPercent: number
}

export const TRANSPORT_VEHICLE: VehicleProfile = {
  unitId: 'SIL',
  name: 'Jeep Compass',
  vehicleClass: '4WD SMALL 5 PASS SUV',
  carPriority: 'LOW',
  carTier: 'RESERVE',
}

export const VSA_VEHICLE: VehicleProfile = {
  unitId: 'BLA',
  name: 'Tesla Model 3',
  vehicleClass: 'EV MIDSIZE',
  holdWarning: {
    code: 'E',
    message: 'STOP TNC CAR - OK TO SERVICE',
  },
}

const SECTION_LABELS: Record<WorkflowSection, string> = {
  movement: 'Movement',
  fuel: 'Fuel',
  stall: 'Stall',
  cleaning: 'Cleaning',
}

function sectionNextAction(
  section: WorkflowSection,
  status: SectionStatus,
  context: FlowContext,
): string {
  if (status === 'complete') return `${SECTION_LABELS[section]} complete`

  switch (section) {
    case 'movement': {
      const progress = getMovementProgress(context.movementMode, context.movementPhase)
      if (status === 'missing') return 'Verify stall before continuing transport'
      if (context.movementPhase === 'location-selected' && context.location) {
        return `Confirm transport to ${context.location}`
      }
      return progress.label
    }
    case 'fuel': {
      const progress = getFuelProgress(context.fuelStep)
      if (status === 'missing') return 'Resolve fuel issue to continue'
      return progress.label
    }
    case 'stall': {
      const progress = getStallProgress(context.stallPhase)
      if (status === 'missing') return 'Verify stall availability and report if needed'
      return progress.label
    }
    case 'cleaning': {
      const progress = getCleaningProgress(context.cleaningStep)
      return progress.label
    }
    default:
      return `Complete ${SECTION_LABELS[section]}`
  }
}

function derivePriority(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  sections: WorkflowSection[],
): { priority: VehiclePriority; priorityLabel: string } {
  const statuses = sections.map((section) => sectionStatus[section])
  if (statuses.some((status) => status === 'missing')) {
    return { priority: 'high', priorityLabel: 'High Priority' }
  }
  if (statuses.some((status) => status === 'in-progress')) {
    return { priority: 'medium', priorityLabel: 'Active' }
  }
  if (statuses.every((status) => status === 'complete')) {
    return { priority: 'low', priorityLabel: 'Complete' }
  }
  return { priority: 'medium', priorityLabel: 'Awaiting Action' }
}

function deriveOverallStatus(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  sections: WorkflowSection[],
): SectionStatus {
  const statuses = sections.map((section) => sectionStatus[section])
  if (statuses.every((status) => status === 'complete')) return 'complete'
  if (statuses.some((status) => status === 'missing')) return 'missing'
  if (statuses.some((status) => status === 'in-progress')) return 'in-progress'
  return 'not-started'
}

export function getVehicleSummary(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  context: FlowContext,
  vehicle: VehicleProfile = TRANSPORT_VEHICLE,
): VehicleSummary {
  const completedSections = sections.filter(
    (section) => sectionStatus[section] === 'complete',
  ).length
  const totalSections = sections.length
  const progressPercent =
    totalSections === 0 ? 0 : Math.round((completedSections / totalSections) * 100)

  const overallStatus = deriveOverallStatus(sectionStatus, sections)
  const { priority, priorityLabel } = vehicle.holdWarning
    ? { priority: 'high' as const, priorityLabel: 'On Hold' }
    : derivePriority(sectionStatus, sections)

  const stallUnlocked = context.fuelComplete || context.cleaningComplete
  const isActionableSection = (section: WorkflowSection) =>
    section !== 'stall' || stallUnlocked

  const activeSection =
    sections.find(
      (section) => isActionableSection(section) && sectionStatus[section] === 'missing',
    ) ??
    sections.find(
      (section) =>
        isActionableSection(section) && sectionStatus[section] === 'in-progress',
    ) ??
    sections.find(
      (section) =>
        isActionableSection(section) && sectionStatus[section] === 'not-started',
    ) ??
    sections[sections.length - 1]

  const nextAction =
    overallStatus === 'complete'
      ? 'All workflow steps complete — ready to finish'
      : sectionNextAction(activeSection, sectionStatus[activeSection], context)

  return {
    unitId: vehicle.unitId,
    name: vehicle.name,
    vehicleClass: vehicle.vehicleClass,
    holdWarning: vehicle.holdWarning,
    carPriority: vehicle.carPriority,
    carTier: vehicle.carTier,
    priority,
    priorityLabel,
    overallStatus,
    nextAction,
    completedSections,
    totalSections,
    progressPercent,
  }
}
