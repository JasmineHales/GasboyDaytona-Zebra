import type { SelectedVehicle } from '../types/vehicleSearch'
import type { VehicleCatalogEntry } from './vehicleSearchCatalog'
import {
  normalizeOwningAreaId,
  normalizeUnitNumber,
  OWNING_AREA_ID_LENGTH,
  sanitizeOwningAreaIdInput,
  UNIT_NUMBER_LENGTH,
  VIN_LENGTH,
} from './vehicleSearchIds'

export type ManualVehicleEntryFieldKey =
  | 'owningAreaId'
  | 'unitNumber'
  | 'make'
  | 'model'
  | 'color'
  | 'year'
  | 'licensePlate'
  | 'state'
  | 'vin'

export type ManualVehicleEntryFieldErrors = Partial<
  Record<'owningAreaId' | 'unitNumber' | 'vin', string>
>

export type ManualVehicleEntry = {
  owningAreaId: string
  unitNumber: string
  make: string
  model: string
  color: string
  year: string
  licensePlate: string
  state: string
  vin: string
}

export const EMPTY_MANUAL_VEHICLE_ENTRY: ManualVehicleEntry = {
  owningAreaId: '',
  unitNumber: '',
  make: '',
  model: '',
  color: '',
  year: '',
  licensePlate: '',
  state: '',
  vin: '',
}

function sanitizeVinInput(value: string) {
  return value.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase().slice(0, VIN_LENGTH)
}

export function isManualVehicleEntryComplete(entry: ManualVehicleEntry): boolean {
  const owningAreaDigits = sanitizeOwningAreaIdInput(entry.owningAreaId)
  const unitDigits = normalizeUnitNumber(entry.unitNumber)
  const vin = sanitizeVinInput(entry.vin)
  const yearDigits = entry.year.replace(/\D/g, '')
  const year = Number.parseInt(yearDigits, 10)
  const state = entry.state.trim()

  return (
    owningAreaDigits.length === OWNING_AREA_ID_LENGTH &&
    unitDigits.length === UNIT_NUMBER_LENGTH &&
    (vin.length === 0 || vin.length === VIN_LENGTH) &&
    entry.make.trim().length > 0 &&
    entry.model.trim().length > 0 &&
    entry.color.trim().length > 0 &&
    yearDigits.length === 4 &&
    Number.isFinite(year) &&
    year >= 1980 &&
    year <= new Date().getFullYear() + 1 &&
    entry.licensePlate.trim().length > 0 &&
    state.length === 2
  )
}

export function manualEntryToCatalogEntry(entry: ManualVehicleEntry): VehicleCatalogEntry {
  const unitNumber = normalizeUnitNumber(entry.unitNumber).padStart(UNIT_NUMBER_LENGTH, '0')
  const owningAreaId = normalizeOwningAreaId(entry.owningAreaId)
  const make = entry.make.trim()
  const model = entry.model.trim()
  const year = Number.parseInt(entry.year, 10)

  return {
    vehicleId: `manual-${unitNumber}`,
    unitNumber,
    licensePlate: entry.licensePlate.trim().toUpperCase(),
    vin: sanitizeVinInput(entry.vin) || 'UNKNOWN',
    owningArea: owningAreaId,
    owningAreaId,
    make,
    model,
    year: Number.isFinite(year) ? year : 0,
    color: entry.color.trim(),
    state: entry.state.trim().toUpperCase(),
    displayName: `${make} ${model}`.trim(),
    vehicleClass: 'MANUAL ENTRY',
    vehicleType: '—',
    odometerMiles: 0,
    vehicleStatus: 'Manual Override',
  }
}

export function manualEntryToSelectedVehicle(entry: ManualVehicleEntry): SelectedVehicle {
  const catalogEntry = manualEntryToCatalogEntry(entry)
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
  } = catalogEntry

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

export function sanitizeManualVehicleEntryPatch(
  patch: Partial<ManualVehicleEntry>,
): Partial<ManualVehicleEntry> {
  const next = { ...patch }

  if ('owningAreaId' in patch && patch.owningAreaId !== undefined) {
    next.owningAreaId = sanitizeOwningAreaIdInput(patch.owningAreaId)
  }
  if ('unitNumber' in patch && patch.unitNumber !== undefined) {
    next.unitNumber = normalizeUnitNumber(patch.unitNumber)
  }
  if ('year' in patch && patch.year !== undefined) {
    next.year = patch.year.replace(/\D/g, '').slice(0, 4)
  }
  if ('state' in patch && patch.state !== undefined) {
    next.state = patch.state.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
  }
  if ('licensePlate' in patch && patch.licensePlate !== undefined) {
    next.licensePlate = patch.licensePlate.toUpperCase()
  }
  if ('vin' in patch && patch.vin !== undefined) {
    next.vin = sanitizeVinInput(patch.vin)
  }

  return next
}

export function getManualVehicleEntryFieldErrors(
  entry: ManualVehicleEntry,
  messages: {
    owningAreaIdIncomplete: string
    unitNumberIncomplete: string
    vinIncomplete: string
  },
  options: { touchedOnly?: boolean; touched?: Partial<Record<ManualVehicleEntryFieldKey, boolean>> } = {},
): ManualVehicleEntryFieldErrors {
  const { touchedOnly = false, touched = {} } = options
  const errors: ManualVehicleEntryFieldErrors = {}

  const shouldShow = (field: ManualVehicleEntryFieldKey, hasPartialValue: boolean) => {
    if (!hasPartialValue) return false
    if (!touchedOnly) return true
    return Boolean(touched[field])
  }

  const owningAreaDigits = sanitizeOwningAreaIdInput(entry.owningAreaId)
  if (
    shouldShow('owningAreaId', owningAreaDigits.length > 0) &&
    owningAreaDigits.length < OWNING_AREA_ID_LENGTH
  ) {
    errors.owningAreaId = messages.owningAreaIdIncomplete
  }

  const unitDigits = normalizeUnitNumber(entry.unitNumber)
  if (
    shouldShow('unitNumber', unitDigits.length > 0) &&
    unitDigits.length < UNIT_NUMBER_LENGTH
  ) {
    errors.unitNumber = messages.unitNumberIncomplete
  }

  const vin = sanitizeVinInput(entry.vin)
  if (shouldShow('vin', vin.length > 0) && vin.length < VIN_LENGTH) {
    errors.vin = messages.vinIncomplete
  }

  return errors
}
