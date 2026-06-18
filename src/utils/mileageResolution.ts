export type MileageLookupStatus = 'resolved' | 'pending' | 'timeout'

export type MileageSourceKind = 'telematics' | 'gasboy' | 'rental'

export type VehicleMileageState = {
  telematicsMiles: number | null
  telematicsStale: boolean
  telematicsVinConfident: boolean
  gasboyMiles: number | null
  gasboyDelayed: boolean
  mileageSource: MileageSourceKind
  lookupStatus: MileageLookupStatus
  sourcesMismatch: boolean
}

export type MileageReliabilityIssue =
  | 'telematics-unavailable'
  | 'telematics-stale'
  | 'telematics-vin-mismatch'
  | 'gasboy-unavailable'
  | 'gasboy-delayed'
  | 'rental-source'
  | 'lookup-timeout'
  | 'source-mismatch'

export type MileageResolutionOptions = {
  /** When true, gasboy availability/delay rules apply (e.g. fuel island). */
  gasboyMileageExpected?: boolean
}

export function getMileageReliabilityIssues(
  state: VehicleMileageState,
  options: MileageResolutionOptions = {},
): MileageReliabilityIssue[] {
  const issues: MileageReliabilityIssue[] = []
  const gasboyExpected = options.gasboyMileageExpected ?? false

  if (state.telematicsMiles == null) {
    issues.push('telematics-unavailable')
  }
  if (state.telematicsStale) {
    issues.push('telematics-stale')
  }
  if (!state.telematicsVinConfident) {
    issues.push('telematics-vin-mismatch')
  }
  if (gasboyExpected) {
    if (state.gasboyMiles == null) {
      issues.push('gasboy-unavailable')
    }
    if (state.gasboyDelayed) {
      issues.push('gasboy-delayed')
    }
  }
  if (state.mileageSource === 'rental') {
    issues.push('rental-source')
  }
  if (state.lookupStatus === 'pending' || state.lookupStatus === 'timeout') {
    issues.push('lookup-timeout')
  }
  if (state.sourcesMismatch) {
    issues.push('source-mismatch')
  }

  return issues
}

/** Manual odometer entry is required when any mileage reliability rule fails. */
export function requiresManualMileageEntry(
  state: VehicleMileageState,
  options?: MileageResolutionOptions,
): boolean {
  return getMileageReliabilityIssues(state, options).length > 0
}

export function getTrustedMileageMiles(
  state: VehicleMileageState,
  options?: MileageResolutionOptions,
): number | null {
  if (requiresManualMileageEntry(state, options)) return null

  if (state.mileageSource === 'gasboy' && state.gasboyMiles != null) {
    return state.gasboyMiles
  }
  if (state.mileageSource === 'telematics' && state.telematicsMiles != null) {
    return state.telematicsMiles
  }
  if (state.gasboyMiles != null) return state.gasboyMiles
  if (state.telematicsMiles != null) return state.telematicsMiles
  return null
}

export function hasOdometerReading(odometerReading: string): boolean {
  return odometerReading.trim().length > 0
}

/** Last telematics reading used as a manual-entry floor when available. */
export function getTelematicsOdometerFloor(
  state: VehicleMileageState,
): number | null {
  return state.telematicsMiles
}

export function isOdometerBelowTelematicsFloor(
  manualReading: string,
  mileageState: VehicleMileageState,
): boolean {
  const floor = getTelematicsOdometerFloor(mileageState)
  if (floor == null) return false

  const trimmed = manualReading.trim()
  if (!trimmed) return false

  const entered = Number(trimmed)
  return Number.isFinite(entered) && entered < floor
}

export function getOdometerFloorValidationError(
  manualReading: string,
  floor: number | null | undefined,
  options?: { showPartial?: boolean },
): string | undefined {
  if (floor == null) return undefined

  const trimmed = manualReading.trim()
  if (!trimmed) return undefined

  const entered = Number(trimmed)
  if (!Number.isFinite(entered) || entered >= floor) return undefined

  if (options?.showPartial || trimmed.length >= String(floor).length) {
    return `Mileage cannot be lower than the last telematics reading (${floor.toLocaleString('en-US')} mi).`
  }

  return undefined
}

export function getOdometerValidationError(
  manualReading: string,
  mileageState: VehicleMileageState,
  options?: { showPartial?: boolean },
): string | undefined {
  return getOdometerFloorValidationError(
    manualReading,
    getTelematicsOdometerFloor(mileageState),
    options,
  )
}

export function isValidManualOdometerReading(
  manualReading: string,
  mileageState: VehicleMileageState,
): boolean {
  if (!hasOdometerReading(manualReading)) return false
  return !isOdometerBelowTelematicsFloor(manualReading, mileageState)
}

export function hasResolvedOdometer(
  manualReading: string,
  mileageState: VehicleMileageState,
  options?: MileageResolutionOptions,
): boolean {
  if (requiresManualMileageEntry(mileageState, options)) {
    return isValidManualOdometerReading(manualReading, mileageState)
  }
  return getTrustedMileageMiles(mileageState, options) != null
}

export function getEffectiveOdometerMiles(
  manualReading: string,
  mileageState: VehicleMileageState,
  options?: MileageResolutionOptions,
): number | null {
  if (requiresManualMileageEntry(mileageState, options)) {
    const trimmed = manualReading.trim()
    return trimmed.length > 0 ? Number(trimmed) : null
  }
  return getTrustedMileageMiles(mileageState, options)
}
