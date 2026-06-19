import type { FlowContext, SectionStatus, WorkflowSection } from '../types/flow'
import type { Messages } from '../i18n/types'
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

function sectionNextAction(
  section: WorkflowSection,
  status: SectionStatus,
  context: FlowContext,
  copy: Messages,
): string {
  const sectionLabels = copy.workflow.sections
  if (status === 'complete') {
    return copy.workflow.complete.sectionComplete.replace('{section}', sectionLabels[section])
  }

  switch (section) {
    case 'movement': {
      const progress = getMovementProgress(
        context.movementMode,
        context.movementPhase,
        copy.progress,
      )
      if (status === 'missing') return copy.vehicle.verifyStallBeforeTransport
      if (context.movementPhase === 'location-selected' && context.location) {
        return copy.vehicle.confirmTransportTo.replace('{location}', context.location)
      }
      return progress.label
    }
    case 'fuel': {
      const progress = getFuelProgress(context.fuelStep, copy.progress)
      if (status === 'missing') return copy.vehicle.resolveFuelIssue
      return progress.label
    }
    case 'stall': {
      const progress = getStallProgress(context.stallPhase, copy.progress)
      if (status === 'missing') return copy.vehicle.verifyStallAvailability
      return progress.label
    }
    case 'cleaning': {
      const progress = getCleaningProgress(context.cleaningStep, copy.progress)
      return progress.label
    }
    default:
      return copy.vehicle.completeSection.replace('{section}', sectionLabels[section])
  }
}

function derivePriority(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  sections: WorkflowSection[],
  copy: Messages,
): { priority: VehiclePriority; priorityLabel: string } {
  const statuses = sections.map((section) => sectionStatus[section])
  if (statuses.some((status) => status === 'missing')) {
    return { priority: 'high', priorityLabel: copy.vehicle.status.highPriority }
  }
  if (statuses.some((status) => status === 'in-progress')) {
    return { priority: 'medium', priorityLabel: copy.vehicle.status.active }
  }
  if (statuses.every((status) => status === 'complete')) {
    return { priority: 'low', priorityLabel: copy.vehicle.status.complete }
  }
  return { priority: 'medium', priorityLabel: copy.vehicle.status.awaitingAction }
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
  copy: Messages,
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
    ? { priority: 'high' as const, priorityLabel: copy.vehicle.status.onHold }
    : derivePriority(sectionStatus, sections, copy)

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
      ? copy.vehicle.allStepsComplete
      : isVsaWorkflow(sections) &&
          sectionStatus.cleaning === 'complete' &&
          sectionStatus.fuel === 'not-started'
        ? copy.vehicle.cleaningCompleteOptional
        : isVsaWorkflow(sections) &&
            sectionStatus.fuel === 'complete' &&
            sectionStatus.cleaning === 'not-started'
          ? copy.vehicle.fuelingCompleteOptional
          : sectionStatus.movement === 'complete' &&
              optionalSections.includes('fuel') &&
              sectionStatus.fuel === 'not-started'
            ? copy.vehicle.movementCompleteOptional
            : sectionNextAction(activeSection, sectionStatus[activeSection], context, copy)

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
