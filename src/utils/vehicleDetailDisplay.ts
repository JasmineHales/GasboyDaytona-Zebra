import type { VehicleDetailSectionsProps } from '../components/vehicle/VehicleDetailSections'
import { VEHICLE_SEARCH_CATALOG, type VehicleCatalogEntry } from './vehicleSearchCatalog'
import type { VehicleSummary } from './vehicleSummary'

export function findVehicleCatalogEntry(
  unitId: string,
  licensePlate?: string,
): VehicleCatalogEntry | null {
  return (
    VEHICLE_SEARCH_CATALOG.find(
      (entry) =>
        entry.unitNumber === unitId ||
        (licensePlate && entry.licensePlate === licensePlate),
    ) ?? null
  )
}

type VehicleDetailHoldInput = {
  code: string
  title?: string
  message?: string
}

function resolveHoldWarning(
  holdWarning: VehicleDetailHoldInput | null | undefined,
): VehicleDetailSectionsProps['holdWarning'] {
  if (!holdWarning) return null
  return {
    code: holdWarning.code,
    title: holdWarning.title,
    message: holdWarning.message,
  }
}

export function buildVehicleDetailPropsFromCatalog(
  vehicle: VehicleCatalogEntry,
): VehicleDetailSectionsProps {
  return {
    licensePlate: vehicle.licensePlate,
    make: vehicle.make,
    model: vehicle.model,
    vehicleType: vehicle.vehicleType,
    vin: vehicle.vin,
    color: vehicle.color,
    state: vehicle.state,
    carPriority: vehicle.carPriority,
    carTier: vehicle.carTier,
    holdWarning: vehicle.holdWarning ?? null,
  }
}

export function buildVehicleDetailPropsFromSummary(
  summary: VehicleSummary,
  options: {
    holdMessage?: string
    holdTitle?: string
  } = {},
): VehicleDetailSectionsProps {
  const catalog = findVehicleCatalogEntry(summary.unitId, summary.licensePlate)
  const holdWarning = summary.holdWarning
    ? {
        code: summary.holdWarning.code,
        title: options.holdTitle ?? summary.holdWarning.title,
        message: options.holdMessage ?? summary.holdWarning.message,
      }
    : catalog?.holdWarning ?? null

  return {
    licensePlate: summary.licensePlate,
    make: summary.make,
    model: summary.model,
    vehicleType: summary.vehicleType,
    vin: summary.vin,
    color: summary.color,
    state: summary.state,
    carPriority: catalog?.carPriority ?? summary.carPriority,
    carTier: catalog?.carTier ?? summary.carTier,
    holdWarning: resolveHoldWarning(holdWarning),
  }
}
