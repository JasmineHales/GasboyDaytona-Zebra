import type { VehicleInformationSummaryProps } from '../components/ui/VehicleInformationSummary'
import {
  TRANSPORT_VEHICLE,
  VSA_VEHICLE,
  type IssueVehicleOption,
  type VehicleProfile,
} from './vehicleSummary'

export function lookupVehicleProfile(unitId: string): VehicleProfile | null {
  if (unitId === VSA_VEHICLE.unitId) return VSA_VEHICLE
  if (unitId === TRANSPORT_VEHICLE.unitId) return TRANSPORT_VEHICLE
  return null
}

export function toVehicleInformationSummary(
  profile: VehicleProfile | IssueVehicleOption | Pick<VehicleProfile, 'unitId' | 'name'>,
): VehicleInformationSummaryProps {
  if ('licensePlate' in profile && profile.licensePlate) {
    return {
      unitId: profile.unitId,
      licensePlate: profile.licensePlate,
      make: profile.make,
      model: profile.model,
      vehicleType: profile.vehicleType,
      holdWarning: 'holdWarning' in profile ? profile.holdWarning : undefined,
    }
  }

  const fullProfile = lookupVehicleProfile(profile.unitId)
  if (fullProfile) {
    return toVehicleInformationSummary(fullProfile)
  }

  return {
    unitId: profile.unitId,
    name: profile.name,
  }
}
