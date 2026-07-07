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
  title?: string
  message: string
}

export type FuelSimulationConfig = {
  /** Auto-complete remote fueling after this many ms (omit when simulating pump stop). */
  autoCompleteMs?: number
  pumpStatusDelayMs?: number
  gallons?: string
  /** Stop dispensing mid-session before nozzle return (e.g. BC18351). */
  pumpStopDelayMs?: number
  pumpStopGallons?: string
  /** Remote unlock simulation (default: success ~1.5s). */
  unlockOutcome?: 'success' | 'no-response' | 'pump-timeout'
  /** Remote fueling: no pump telemetry or auto-complete — driver completes manually. */
  manualCompleteOnly?: boolean
}

/** Hyundai Santa Fe (BC18351) — pump stops ~12s into fueling. */
export const BC18351_FUEL_SIMULATION: FuelSimulationConfig = {
  pumpStatusDelayMs: 4_000,
  pumpStopDelayMs: 12_000,
  pumpStopGallons: '3',
}

/** Ford Explorer (V576AE) — unlock succeeds; no pump connection; complete manually. */
export const V576AE_FUEL_SIMULATION: FuelSimulationConfig = {
  manualCompleteOnly: true,
}

/** Volkswagen Jetta (215BG2) — unlock window expires. */
export const BG215_FUEL_SIMULATION: FuelSimulationConfig = {
  unlockOutcome: 'pump-timeout',
}

export function trustedMileageForOdometer(miles: number): VehicleMileageState {
  return {
    ...TRUSTED_MILEAGE_STATE,
    telematicsMiles: miles,
    gasboyMiles: miles,
  }
}

/** Stale telematics — prompts manual odometer entry (e.g. 8LAK631). */
export function staleMileageForOdometer(miles: number): VehicleMileageState {
  return {
    ...trustedMileageForOdometer(miles),
    telematicsStale: true,
    mileageSource: 'telematics',
  }
}

export type VehicleProfile = {
  unitId: string
  name: string
  vehicleClass: string
  licensePlate?: string
  make?: string
  model?: string
  vehicleType?: string
  vin?: string
  color?: string
  state?: string
  odometerMiles: number
  mileageState: VehicleMileageState
  fuelSimulation?: FuelSimulationConfig
  holdWarning?: VehicleHoldWarning
  carPriority?: string
  carTier?: string
  year?: number
  notice?: string
  owningArea?: string
}

export type VehicleSummary = {
  unitId: string
  name: string
  vehicleClass: string
  licensePlate: string
  make: string
  model: string
  vehicleType: string
  vin: string
  color: string
  state: string
  holdWarning?: VehicleHoldWarning
  carPriority?: string
  carTier?: string
  year?: number
  notice?: string
  owningArea?: string
  priority: VehiclePriority
  priorityLabel: string
  overallStatus: SectionStatus
  nextAction: string
  completedSections: number
  totalSections: number
  progressPercent: number
}

export function getVehicleIdentityFromProfile(profile: VehicleProfile): Pick<
  VehicleSummary,
  'licensePlate' | 'make' | 'model' | 'vehicleType' | 'vin' | 'color' | 'state'
> {
  const [fallbackMake = '', ...modelParts] = profile.name.trim().split(/\s+/)
  const fallbackModel = modelParts.join(' ')

  return {
    licensePlate: profile.licensePlate ?? profile.unitId,
    make: profile.make ?? fallbackMake,
    model: profile.model ?? fallbackModel,
    vehicleType: profile.vehicleType ?? '—',
    vin: profile.vin ?? '',
    color: profile.color ?? '',
    state: profile.state ?? '',
  }
}

export const TRANSPORT_VEHICLE: VehicleProfile = {
  unitId: '04465324',
  name: 'Jeep Compass',
  vehicleClass: '2WD SMALL 5 PASS SUV',
  licensePlate: '8LAK631',
  make: 'Jeep',
  model: 'Compass',
  vehicleType: 'TNC',
  vin: '1C4NJCEB4HD123456',
  color: 'Silver',
  state: 'FL',
  odometerMiles: 28432,
  mileageState: staleMileageForOdometer(28432),
  carPriority: 'LOW',
  carTier: 'RESERVE',
  year: 2024,
  owningArea: 'Daytona AP',
}

export const VSA_VEHICLE: VehicleProfile = {
  unitId: '04465325',
  name: 'Tesla Model 3',
  vehicleClass: 'MIDSIZE',
  licensePlate: 'DNJ 0955',
  make: 'Tesla',
  model: 'Model 3',
  vehicleType: 'TNC',
  vin: '5YJ3E1EA1KF654321',
  color: 'Black',
  state: 'FL',
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
  fuelSimulation: {
    autoCompleteMs: 20_000,
    pumpStatusDelayMs: 4_000,
    gallons: '5',
  },
  holdWarning: {
    code: 'E',
    message: 'STOP TNC CAR - OK TO SERVICE',
  },
  carPriority: 'MEDIUM',
  carTier: 'PREMIUM',
  year: 2023,
  owningArea: 'Daytona AP',
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
    ...getVehicleIdentityFromProfile(vehicle),
    holdWarning: vehicle.holdWarning,
    carPriority: vehicle.carPriority,
    carTier: vehicle.carTier,
    year: vehicle.year,
    notice: vehicle.notice,
    owningArea: vehicle.owningArea,
    priority,
    priorityLabel,
    overallStatus,
    nextAction,
    completedSections,
    totalSections,
    progressPercent,
  }
}
