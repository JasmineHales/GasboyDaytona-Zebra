import type { VehicleMileageState } from '../utils/mileageResolution'
import type { MileageScenarioId } from '../utils/mileageScenarios'

export type SectionStatus = 'complete' | 'not-started' | 'in-progress' | 'missing'

export type FuelStep =
  | 'verify-pump'
  | 'unlocking-pump'
  | 'pump-unlocked'
  | 'pump-verified'
  | 'fueling-in-progress'
  | 'fueling-complete'
  | 'fueling-complete-missing'
  | 'additional-fueling'
  | 'additional-fueling-complete'
  | 'pump-unavailable'
  | 'connection-lost'
  | 'no-response'
  | 'pump-timeout'
  | 'manual-entry'
  | 'manual-entry-error'
  | 'manual-entry-filled'

export type ScreenId =
  | 'transport-default'
  | 'transport-complete'
  | 'transport-issue-header'
  | MileageScenarioId
  | 'movement-transport-location-selected'
  | 'movement-transport-complete'
  | 'movement-stall-select-stall'
  | 'movement-stall-complete'
  | 'movement-stall-stall-verify'
  | 'movement-stall-issue-reported'
  | 'vsa-complete'
  | 'vsa-issue-header'
  | 'cleaning-default'
  | 'cleaning-manual-entry'
  | 'cleaning-manual-entry-filled'
  | 'cleaning-manual-entry-error'
  | 'cleaning-pump-verified'
  | 'cleaning-in-progress'
  | 'cleaning-complete'
  | 'stall-default'
  | 'vsa-no-stall-default'
  | 'stall-complete'
  | 'stall-missing'
  | 'stall-issue-reported'
  | 'fueling-default'
  | 'fueling-unlocking'
  | 'fueling-scanner'
  | 'fueling-manual-entry'
  | 'fueling-pump-unlocked'
  | 'fueling-in-progress'
  | 'fueling-in-progress-unconfirmed'
  | 'fueling-complete'
  | 'fueling-additional'
  | 'fueling-additional-complete'
  | 'fueling-pump-unavailable'
  | 'fueling-connection-lost'
  | 'fueling-no-response'
  | 'fueling-pump-timeout'
  | 'fueling-issue'
  | 'fueling-issue-details'
  | 'on-site-default'
  | 'on-site-manual-entry'
  | 'on-site-pump-verified'
  | 'on-site-fueling-in-progress'
  | 'on-site-fueling-complete'
  | 'on-site-missing-info'
  | 'on-site-missing-filled'
  | 'non-gasboy-default'
  | 'non-gasboy-manual-entry'
  | 'non-gasboy-pump-verified'
  | 'non-gasboy-fueling-in-progress'
  | 'non-gasboy-fueling-complete'
  | 'non-gasboy-missing-info'
  | 'non-gasboy-missing-filled'

export type MovementMode = 'transport' | 'stall'

export type MovementPhase =
  | 'select-location'
  | 'location-selected'
  | 'select-stall'
  | 'stall-selected'
  | 'stall-verify'
  | 'stall-issue-reported'

export type StallPhase =
  | 'select-stall'
  | 'stall-selected'
  | 'stall-verify'
  | 'stall-issue-reported'

export type CleaningStep =
  | 'verify-pump'
  | 'manual-entry'
  | 'manual-entry-filled'
  | 'manual-entry-error'
  | 'pump-verified'
  | 'cleaning-in-progress'
  | 'cleaning-complete'

export type WorkflowSection = 'movement' | 'fuel' | 'stall' | 'cleaning'

export type FuelTransaction = {
  pump: string
  gallons: string
  status: 'complete' | 'issue'
}

export type FlowContext = {
  screen: ScreenId
  movementComplete: boolean
  movementMode: MovementMode
  movementPhase: MovementPhase
  location: string
  stallNumber: string
  stallPhase: StallPhase
  stallSectionNumber: string
  fuelComplete: boolean
  stallComplete: boolean
  cleaningComplete: boolean
  cleaningStep: CleaningStep
  cleaningPumpNumber: string
  cleaningStartedAt: number | null
  cleaningFinalTime: string
  fuelStep: FuelStep
  pumpNumber: string
  fuelGallons: string
  fuelGallonsDispensed: string
  fuelFinalTime: string
  fuelStartedAt: number | null
  isAdditionalFueling: boolean
  fuelTransactions: FuelTransaction[]
  unavailablePumps: number[]
  showIssueOverlay: boolean
  issueDetails: string
  issueReportSource: 'header' | 'fuel' | null
  unlockMode: 'remote' | 'on-site'
  locationType: 'gasboy' | 'non-gasboy'
  odometerReading: string
  mileageState: VehicleMileageState
  /** Remote unlock: gallons not yet received from pump sync */
  fuelGallonsPending?: boolean
  /** Remote unlock: pump telemetry confirmed fueling activity */
  fuelPumpStatusReceived?: boolean
  /** When false, VSA workflow shows a VSA section instead of stall assignment. */
  vsaStallEnabled?: boolean
}
