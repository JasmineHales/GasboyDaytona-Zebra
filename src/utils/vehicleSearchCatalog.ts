import type { SelectedVehicle } from '../types/vehicleSearch'
import {
  formatOwningAreaIdOption,
  normalizeOwningAreaId,
  normalizeUnitNumber,
  sanitizeOwningAreaIdInput,
  UNIT_NUMBER_LENGTH,
} from './vehicleSearchIds'
import type { VehicleProfile } from './vehicleSummary'
import { BC18351_FUEL_SIMULATION, BG215_FUEL_SIMULATION, staleMileageForOdometer, trustedMileageForOdometer, V576AE_FUEL_SIMULATION, VSA_VEHICLE } from './vehicleSummary'
import type { FuelSimulationConfig } from './vehicleSummary'
import { TRUSTED_MILEAGE_STATE } from './mileageScenarios'
import type { VehicleMileageState } from './mileageResolution'

import type { VehicleCatalogOperationalFields } from './vehicleSearchResultDisplay'

export type VehicleCatalogEntry = SelectedVehicle &
  VehicleCatalogOperationalFields & {
  displayName: string
  vehicleClass: string
  vehicleType: string
  odometerMiles: number
  vehicleStatus: string
  owningAreaId: string
  mileageState?: VehicleMileageState
  fuelSimulation?: FuelSimulationConfig
}

export const VEHICLE_SEARCH_CATALOG: VehicleCatalogEntry[] = [
  {
    vehicleId: 'veh-sil-001',
    unitNumber: '04465324',
    licensePlate: '8LAK631',
    vin: '1C4NJCEB4HD123456',
    owningArea: 'Daytona AP',
    owningAreaId: '002198',
    make: 'Jeep',
    model: 'Compass',
    year: 2024,
    color: 'Silver',
    state: 'FL',
    displayName: 'Jeep Compass',
    vehicleClass: '2WD SMALL 5 PASS SUV',
    vehicleType: 'TNC',
    odometerMiles: 28432,
    vehicleStatus: 'On Hold',
    alertKind: 'on-hold',
    holdWarning: {
      code: 'H',
      title: 'Cleaning bay hold',
      message: 'Vehicle on hold — confirm before continuing.',
    },
    carPriority: 'LOW',
    carTier: 'RESERVE',
    mileageState: staleMileageForOdometer(28432),
  },
  {
    vehicleId: 'veh-bla-001',
    unitNumber: '04465325',
    licensePlate: 'DNJ 0955',
    vin: '5YJ3E1EA1KF654321',
    owningArea: 'Daytona AP',
    owningAreaId: '002198',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    color: 'Black',
    state: 'FL',
    displayName: 'Tesla Model 3',
    vehicleClass: 'MIDSIZE',
    vehicleType: 'TNC',
    odometerMiles: 15207,
    vehicleStatus: 'In Service',
    carPriority: 'MEDIUM',
    carTier: 'PREMIUM',
    mileageState: VSA_VEHICLE.mileageState,
    fuelSimulation: VSA_VEHICLE.fuelSimulation,
  },
  {
    vehicleId: 'veh-red-001',
    unitNumber: '04465326',
    licensePlate: 'HZT-1190',
    vin: '2T1BURHE0JC789012',
    owningArea: 'Orlando AP',
    owningAreaId: '002201',
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    color: 'Red',
    state: 'FL',
    displayName: 'Toyota Corolla',
    vehicleClass: 'MIDSIZE 4 DOOR',
    vehicleType: 'Retail',
    odometerMiles: 42180,
    vehicleStatus: 'Available',
  },
  {
    vehicleId: 'veh-grn-001',
    unitNumber: '04465327',
    licensePlate: 'HZT-3375',
    vin: '1FMCU9GXXMUA34567',
    owningArea: 'Tampa AP',
    owningAreaId: '002205',
    make: 'Ford',
    model: 'Escape',
    year: 2023,
    color: 'Green',
    state: 'FL',
    displayName: 'Ford Escape',
    vehicleClass: '2WD COMPACT SUV',
    vehicleType: 'Retail',
    odometerMiles: 19844,
    vehicleStatus: 'Available',
  },
  {
    vehicleId: 'veh-blu-001',
    unitNumber: '04465328',
    licensePlate: 'GA-HZT882',
    vin: '1G1ZD5ST8JF456789',
    owningArea: 'Atlanta AP',
    owningAreaId: '002210',
    make: 'Chevrolet',
    model: 'Malibu',
    year: 2021,
    color: 'Blue',
    state: 'GA',
    displayName: 'Chevrolet Malibu',
    vehicleClass: 'FULLSIZE',
    vehicleType: 'Insurance',
    odometerMiles: 51290,
    vehicleStatus: 'On Hold',
    alertKind: 'on-hold',
    holdWarning: {
      code: 'E',
      title: 'Customer Extension',
    },
  },
  {
    vehicleId: 'veh-wht-001',
    unitNumber: '04465329',
    licensePlate: '215BG2',
    vin: '3VW2B7AJ5HM567890',
    owningArea: 'Dallas AP',
    owningAreaId: '002215',
    make: 'Volkswagen',
    model: 'Jetta',
    year: 2022,
    color: 'White',
    state: 'TX',
    displayName: 'Volkswagen Jetta',
    vehicleClass: 'COMPACT 4 DOOR',
    vehicleType: 'Retail',
    odometerMiles: 36710,
    vehicleStatus: 'On Hold',
    alertKind: 'on-hold',
    holdWarning: {
      code: 'E',
      title: 'Customer Extension',
      message: 'Vehicle on hold — confirm before continuing.',
    },
    fuelSimulation: BG215_FUEL_SIMULATION,
  },
  {
    vehicleId: 'veh-std-001',
    unitNumber: '04465330',
    licensePlate: 'BC18351',
    vin: '5NPE34AF4HH123789',
    owningArea: 'Daytona AP',
    owningAreaId: '002198',
    make: 'Hyundai',
    model: 'Santa Fe',
    year: 2023,
    color: 'Gray',
    state: 'FL',
    displayName: 'Hyundai Santa Fe',
    vehicleClass: '2WD STANDARD 5 PASS SUV',
    vehicleType: 'Retail',
    odometerMiles: 22104,
    vehicleStatus: 'Available',
    mileageState: trustedMileageForOdometer(22104),
    fuelSimulation: BC18351_FUEL_SIMULATION,
  },
  {
    vehicleId: 'veh-7suv-001',
    unitNumber: '04465331',
    licensePlate: 'V576AE',
    vin: '1FM5K8D83HGA98765',
    owningArea: 'Daytona AP',
    owningAreaId: '002198',
    make: 'Ford',
    model: 'Explorer',
    year: 2024,
    color: 'White',
    state: 'FL',
    displayName: 'Ford Explorer',
    vehicleClass: '4WD 7 PASS SUV',
    vehicleType: 'Retail',
    odometerMiles: 11890,
    vehicleStatus: 'Available',
    mileageState: staleMileageForOdometer(11890),
    fuelSimulation: V576AE_FUEL_SIMULATION,
  },
]

export type VehicleSearchFilters = {
  owningAreaId: string | null
  unitNumber: string
  make: string | null
  model: string | null
  color: string | null
  year: string | null
  licensePlate: string
  state: string | null
}

export const EMPTY_VEHICLE_SEARCH_FILTERS: VehicleSearchFilters = {
  owningAreaId: null,
  unitNumber: '',
  make: null,
  model: null,
  color: null,
  year: null,
  licensePlate: '',
  state: null,
}

export function getModelsForMake(make: string | null): string[] {
  if (!make) return []
  return [
    ...new Set(
      VEHICLE_SEARCH_CATALOG.filter((entry) => entry.make === make).map(
        (entry) => entry.model,
      ),
    ),
  ].sort()
}

export function getVehicleFilterOptions() {
  const owningAreaIds = [
    ...new Set(VEHICLE_SEARCH_CATALOG.map((v) => v.owningAreaId)),
  ]
    .map(formatOwningAreaIdOption)
    .sort()
  const states = [...new Set(VEHICLE_SEARCH_CATALOG.map((v) => v.state))].sort()
  const makes = [...new Set(VEHICLE_SEARCH_CATALOG.map((v) => v.make))].sort()
  const colors = [...new Set(VEHICLE_SEARCH_CATALOG.map((v) => v.color))].sort()
  const years = [...new Set(VEHICLE_SEARCH_CATALOG.map((v) => v.year))].sort(
    (a, b) => b - a,
  )
  return { owningAreaIds, states, makes, colors, years }
}

export function countActiveVehicleSearchFilters(filters: VehicleSearchFilters): number {
  return [
    filters.owningAreaId,
    filters.unitNumber.trim() ? filters.unitNumber : null,
    filters.make,
    filters.model,
    filters.color,
    filters.year,
    filters.licensePlate.trim() ? filters.licensePlate : null,
    filters.state,
  ].filter(Boolean).length
}

export function toSelectedVehicle(entry: VehicleCatalogEntry): SelectedVehicle {
  const {
    vehicleId,
    licensePlate,
    vin,
    unitNumber,
    owningArea,
    make,
    model,
    year,
    color,
    state,
  } = entry
  return {
    vehicleId,
    licensePlate,
    vin,
    unitNumber,
    owningArea,
    make,
    model,
    year,
    color,
    state,
  }
}

export function selectedVehicleToProfile(entry: VehicleCatalogEntry): VehicleProfile {
  const holdWarning = entry.holdWarning
    ? {
        code: entry.holdWarning.code,
        title: entry.holdWarning.title,
        message: entry.holdWarning.message ?? entry.holdWarning.title,
      }
    : entry.alertKind === 'on-hold' || entry.vehicleStatus === 'On Hold'
      ? {
          code: '',
          title: entry.vehicleStatus,
          message: entry.vehicleStatus,
        }
      : undefined

  return {
    unitId: entry.unitNumber,
    name: entry.displayName,
    vehicleClass: entry.vehicleClass,
    licensePlate: entry.licensePlate,
    make: entry.make,
    model: entry.model,
    vehicleType: entry.vehicleType,
    vin: entry.vin,
    color: entry.color,
    state: entry.state,
    odometerMiles: entry.odometerMiles,
    mileageState: entry.mileageState ?? {
      ...TRUSTED_MILEAGE_STATE,
      telematicsMiles: entry.odometerMiles,
      gasboyMiles: entry.odometerMiles,
    },
    fuelSimulation: entry.fuelSimulation,
    holdWarning,
    carPriority: entry.carPriority,
    carTier: entry.carTier,
    year: entry.year,
    notice: entry.notice,
    owningArea: entry.owningArea,
  }
}

export function findVehicleCatalogEntry(
  predicate: (entry: VehicleCatalogEntry) => boolean,
): VehicleCatalogEntry | null {
  return VEHICLE_SEARCH_CATALOG.find(predicate) ?? null
}

export function searchVehicleCatalog(
  query: string,
  filters: VehicleSearchFilters,
): VehicleCatalogEntry[] {
  const trimmed = query.trim().toLowerCase()

  return VEHICLE_SEARCH_CATALOG.filter((entry) => {
    const areaQuery = filters.owningAreaId
      ? sanitizeOwningAreaIdInput(filters.owningAreaId)
      : ''
    if (
      areaQuery &&
      entry.owningAreaId !== normalizeOwningAreaId(areaQuery) &&
      !entry.owningAreaId.includes(areaQuery)
    ) {
      return false
    }
    if (filters.state && entry.state !== filters.state) return false
    if (filters.make && entry.make !== filters.make) return false
    if (filters.model && entry.model !== filters.model) return false
    if (filters.year && String(entry.year) !== filters.year) return false
    if (filters.color && entry.color !== filters.color) return false

    const unitQuery = normalizeUnitNumber(filters.unitNumber)
    if (unitQuery && !entry.unitNumber.includes(unitQuery)) return false

    const plateQuery = filters.licensePlate.trim().toUpperCase()
    if (plateQuery && !entry.licensePlate.toUpperCase().includes(plateQuery)) return false

    if (!trimmed) return true

    const haystack = [
      entry.unitNumber,
      entry.displayName,
      entry.licensePlate,
      entry.vin,
      entry.make,
      entry.model,
      entry.vehicleType,
      entry.owningArea,
      entry.owningAreaId,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(trimmed)
  })
}

export function resolveVehicleFromScanValue(value: string): VehicleCatalogEntry | null {
  const normalizedUnit = normalizeUnitNumber(value)
  const paddedUnit =
    normalizedUnit.length > 0
      ? normalizedUnit.padStart(UNIT_NUMBER_LENGTH, '0')
      : ''
  const normalizedAreaId = normalizeOwningAreaId(value)
  const normalized = value.trim().toUpperCase()
  const normalizedPlate = normalized.replace(/[^A-Z0-9]/g, '')

  return (
    findVehicleCatalogEntry(
      (entry) => paddedUnit.length > 0 && entry.unitNumber === paddedUnit,
    ) ??
    findVehicleCatalogEntry(
      (entry) => normalizedAreaId.length > 0 && entry.owningAreaId === normalizedAreaId,
    ) ??
    findVehicleCatalogEntry((entry) => entry.licensePlate.toUpperCase() === normalized) ??
    findVehicleCatalogEntry(
      (entry) =>
        normalizedPlate.length >= 5 &&
        entry.licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate,
    ) ??
    findVehicleCatalogEntry((entry) => entry.vin.toUpperCase() === normalized)
  )
}
