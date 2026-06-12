export type SectionStatus = 'complete' | 'not-started' | 'in-progress' | 'missing'

export type FuelStep =
  | 'verify-pump'
  | 'unlocking-pump'
  | 'pump-unlocked'
  | 'fueling-in-progress'
  | 'fueling-complete'
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
  | 'movement-transport-complete'
  | 'movement-stall-complete'
  | 'movement-stall-issue-reported'
  | 'stall-default'
  | 'stall-complete'
  | 'stall-missing'
  | 'fueling-default'
  | 'fueling-unlocking'
  | 'fueling-scanner'
  | 'fueling-manual-entry'
  | 'fueling-pump-unlocked'
  | 'fueling-in-progress'
  | 'fueling-complete'
  | 'fueling-additional'
  | 'fueling-additional-complete'
  | 'fueling-pump-unavailable'
  | 'fueling-connection-lost'
  | 'fueling-no-response'
  | 'fueling-pump-timeout'
  | 'fueling-issue'
  | 'fueling-issue-details'
  | 'on-site-pump-unlocked'
  | 'on-site-pump-verified'
  | 'on-site-fueling-in-progress'
  | 'on-site-fueling-complete'
  | 'on-site-missing-info'
  | 'on-site-missing-filled'
  | 'non-gasboy-pump-unlocked'
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

export type FlowContext = {
  screen: ScreenId
  movementComplete: boolean
  movementMode: MovementMode
  movementPhase: MovementPhase
  location: string
  stallNumber: string
  fuelComplete: boolean
  stallComplete: boolean
  fuelStep: FuelStep
  pumpNumber: string
  unavailablePumps: number[]
  showIssueOverlay: boolean
  issueDetails: string
  unlockMode: 'remote' | 'on-site'
  locationType: 'gasboy' | 'non-gasboy'
}
