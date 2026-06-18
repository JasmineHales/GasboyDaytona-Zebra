import type {
  MileageReliabilityIssue,
  VehicleMileageState,
} from './mileageResolution'

export const DEMO_MILEAGE_MILES = 28432

export const TRUSTED_MILEAGE_STATE: VehicleMileageState = {
  telematicsMiles: DEMO_MILEAGE_MILES,
  telematicsStale: false,
  telematicsVinConfident: true,
  gasboyMiles: DEMO_MILEAGE_MILES,
  gasboyDelayed: false,
  mileageSource: 'gasboy',
  lookupStatus: 'resolved',
  sourcesMismatch: false,
}

export type MileageScenarioId =
  | 'transport-mileage-trusted'
  | 'transport-mileage-stale'
  | 'transport-mileage-no-telematics'
  | 'transport-mileage-vin-mismatch'
  | 'transport-mileage-gasboy-unavailable'
  | 'transport-mileage-gasboy-delayed'
  | 'transport-mileage-rental'
  | 'transport-mileage-lookup-timeout'
  | 'transport-mileage-source-mismatch'
  | 'transport-mileage-no-data'

export const MILEAGE_SCENARIOS: Record<
  MileageScenarioId,
  { label: string; state: VehicleMileageState }
> = {
  'transport-mileage-trusted': {
    label: 'Trusted (prefilled)',
    state: TRUSTED_MILEAGE_STATE,
  },
  'transport-mileage-stale': {
    label: 'Telematics stale',
    state: {
      ...TRUSTED_MILEAGE_STATE,
      telematicsStale: true,
    },
  },
  'transport-mileage-no-telematics': {
    label: 'No telematics',
    state: {
      ...TRUSTED_MILEAGE_STATE,
      telematicsMiles: null,
    },
  },
  'transport-mileage-vin-mismatch': {
    label: 'VIN mismatch',
    state: {
      ...TRUSTED_MILEAGE_STATE,
      telematicsVinConfident: false,
    },
  },
  'transport-mileage-gasboy-unavailable': {
    label: 'Gasboy unavailable',
    state: {
      ...TRUSTED_MILEAGE_STATE,
      gasboyMiles: null,
    },
  },
  'transport-mileage-gasboy-delayed': {
    label: 'Gasboy delayed',
    state: {
      ...TRUSTED_MILEAGE_STATE,
      gasboyDelayed: true,
    },
  },
  'transport-mileage-rental': {
    label: 'Rental source',
    state: {
      ...TRUSTED_MILEAGE_STATE,
      mileageSource: 'rental',
    },
  },
  'transport-mileage-lookup-timeout': {
    label: 'Lookup timeout',
    state: {
      ...TRUSTED_MILEAGE_STATE,
      telematicsMiles: null,
      gasboyMiles: null,
      lookupStatus: 'timeout',
    },
  },
  'transport-mileage-source-mismatch': {
    label: 'Source mismatch',
    state: {
      ...TRUSTED_MILEAGE_STATE,
      telematicsMiles: DEMO_MILEAGE_MILES,
      gasboyMiles: DEMO_MILEAGE_MILES + 127,
      sourcesMismatch: true,
    },
  },
  'transport-mileage-no-data': {
    label: 'No mileage data',
    state: {
      telematicsMiles: null,
      telematicsStale: false,
      telematicsVinConfident: true,
      gasboyMiles: null,
      gasboyDelayed: false,
      mileageSource: 'gasboy',
      lookupStatus: 'resolved',
      sourcesMismatch: false,
    },
  },
}

export const MILEAGE_SCENARIO_IDS = Object.keys(
  MILEAGE_SCENARIOS,
) as MileageScenarioId[]

const MILEAGE_ISSUE_LABELS: Record<MileageReliabilityIssue, string> = {
  'telematics-unavailable': 'Telematics unavailable',
  'telematics-stale': 'Telematics out of date',
  'telematics-vin-mismatch': 'VIN does not match',
  'gasboy-unavailable': 'Gasboy unavailable',
  'gasboy-delayed': 'Gasboy delayed',
  'rental-source': 'Rental mileage may be outdated',
  'lookup-timeout': 'Mileage lookup timed out',
  'source-mismatch': 'Sources do not match',
}

export function getMileageIssueLabel(issue: MileageReliabilityIssue): string {
  return MILEAGE_ISSUE_LABELS[issue]
}
