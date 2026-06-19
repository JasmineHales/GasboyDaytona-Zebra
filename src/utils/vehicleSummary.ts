import type { FlowContext, SectionStatus, WorkflowSection } from '../types/flow'
import type { VehicleMileageState } from './mileageResolution'
import { TRUSTED_MILEAGE_STATE } from './mileageScenarios'
import { getCleaningProgress, getFuelProgress, getMovementProgress, getStallProgress } from './progress'
import {
  getOptionalSections,
  getRequiredSections,
  getVsaProgressCounts,
  hasVsaCoreServiceComplete,
  isStallSectionUnlocked,
  isVsaWorkflow,
} from './workflowProgress'

export type VehiclePriority = 'high' | 'medium' | 'low'

export type VehicleHoldWarning = {
  code: string
  message: string
}

export type VehicleProfile = {
  unitId: string
  name: string
  vehicleClass: string
  odometerMiles: number
  mileageState: VehicleMileageState
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
  odometerMiles: 28432,
  mileageState: TRUSTED_MILEAGE_STATE,
  carPriority: 'LOW',
  carTier: 'RESERVE',
}

export const VSA_VEHICLE: VehicleProfile = {
  unitId: 'BLA',
  name: 'Tesla Model 3',
  vehicleClass: 'EV MIDSIZE',
  odometerMiles: 15207,
  mileageState: {
    telematicsMiles: 15207,
    telematicsStale: true,
    telematicsVinConfident: true,
    gasboyMiles: 15207,
    gasboyDelayed: false,
    mileageSource: 'telematics',
    lookupStatus: 'resolved',
    sourcesMismatch: false,
  },
  holdWarning: {
    code: 'E',
    message: 'STOP TNC CAR - OK TO SERVICE',
  },
}

export type IssueVehicleOption = Pick<VehicleProfile, 'unitId' | 'name' | 'vehicleClass'>

export const ISSUE_VEHICLE_OPTIONS: IssueVehicleOption[] = [
  {
    unitId: TRANSPORT_VEHICLE.unitId,
    name: TRANSPORT_VEHICLE.name,
    vehicleClass: TRANSPORT_VEHICLE.vehicleClass,
  },
  {
    unitId: VSA_VEHICLE.unitId,
    name: VSA_VEHICLE.name,
    vehicleClass: VSA_VEHICLE.vehicleClass,
  },
  { unitId: 'RED', name: 'Toyota Corolla', vehicleClass: 'MIDSIZE 4 DOOR' },
  { unitId: 'GRN', name: 'Ford Escape', vehicleClass: '4WD SMALL SUV' },
  { unitId: 'BLU', name: 'Chevrolet Malibu', vehicleClass: 'MIDSIZE 4 DOOR' },
]

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
  if (isVsaWorkflow(sections)) {
    const parallel = ['cleaning', 'fuel'] as const
    if (parallel.some((section) => sectionStatus[section] === 'missing')) {
      return 'missing'
    }
    if (
      sections.includes('stall') &&
      (sectionStatus.stall === 'missing' || sectionStatus.stall === 'in-progress')
    ) {
      return sectionStatus.stall === 'missing' ? 'missing' : 'in-progress'
    }
    if (parallel.some((section) => sectionStatus[section] === 'in-progress')) {
      return 'in-progress'
    }
    if (hasVsaCoreServiceComplete(sectionStatus)) return 'complete'
    return 'not-started'
  }

  const required = getRequiredSections(sections)
  const optional = getOptionalSections(sections)
  const requiredStatuses = required.map((section) => sectionStatus[section])

  if (requiredStatuses.every((status) => status === 'complete')) {
    const optionalPending = optional.some(
      (section) =>
        sectionStatus[section] === 'in-progress' || sectionStatus[section] === 'missing',
    )
    if (optionalPending) return 'in-progress'
    return 'complete'
  }

  if (requiredStatuses.some((status) => status === 'missing')) return 'missing'
  if (requiredStatuses.some((status) => status === 'in-progress')) return 'in-progress'
  return 'not-started'
}

export function getVehicleSummary(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  context: FlowContext,
  vehicle: VehicleProfile = TRANSPORT_VEHICLE,
): VehicleSummary {
  const optionalSections = getOptionalSections(sections)
  const progressCounts = isVsaWorkflow(sections)
    ? getVsaProgressCounts(sectionStatus)
    : {
        completed: getRequiredSections(sections).filter(
          (section) => sectionStatus[section] === 'complete',
        ).length,
        total: getRequiredSections(sections).length,
      }
  const completedSections = progressCounts.completed
  const totalSections = progressCounts.total
  const progressPercent =
    totalSections === 0 ? 0 : Math.round((completedSections / totalSections) * 100)

  const overallStatus = deriveOverallStatus(sectionStatus, sections)
  const { priority, priorityLabel } = vehicle.holdWarning
    ? { priority: 'high' as const, priorityLabel: 'On Hold' }
    : derivePriority(sectionStatus, sections)

  const stallUnlocked = isStallSectionUnlocked(context)
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
      ? 'All required steps complete — tap Complete to finish'
      : isVsaWorkflow(sections) &&
          sectionStatus.cleaning === 'complete' &&
          sectionStatus.fuel === 'not-started'
        ? 'Cleaning complete — tap Complete to finish (fuel optional)'
        : isVsaWorkflow(sections) &&
            sectionStatus.fuel === 'complete' &&
            sectionStatus.cleaning === 'not-started'
          ? 'Fueling complete — tap Complete to finish (cleaning optional)'
          : sectionStatus.movement === 'complete' &&
              optionalSections.includes('fuel') &&
              sectionStatus.fuel === 'not-started'
            ? 'Movement complete — tap Complete to finish (fuel optional)'
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
