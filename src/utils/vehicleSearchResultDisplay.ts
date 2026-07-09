import type { HighDemandVehicleGroup } from './homeHighDemandGroups'
import type { VehicleCatalogEntry } from './vehicleSearchCatalog'

export type VehicleSearchAlertKind =
  | 'on-hold'
  | 'do-not-rent'
  | 'inspection-required'
  | 'maintenance-hold'

export type VehicleSearchHoldWarning = {
  code: string
  title: string
  message?: string
}

export type VehicleCatalogOperationalFields = {
  alertKind?: VehicleSearchAlertKind
  holdWarning?: VehicleSearchHoldWarning
  notice?: string
  carPriority?: string
  carTier?: string
}

const ATTENTION_STATUSES: Record<string, VehicleSearchAlertKind> = {
  'On Hold': 'on-hold',
  'Do Not Rent': 'do-not-rent',
  'Inspection Required': 'inspection-required',
  'Maintenance Hold': 'maintenance-hold',
}

export function resolveVehicleAlertKind(
  entry: VehicleCatalogEntry,
): VehicleSearchAlertKind | null {
  if (entry.alertKind) return entry.alertKind
  return ATTENTION_STATUSES[entry.vehicleStatus] ?? null
}

export function vehicleEntryRequiresHoldConfirmation(
  entry: VehicleCatalogEntry,
): boolean {
  if (entry.holdWarning) return true
  return resolveVehicleAlertKind(entry) === 'on-hold'
}

export function resolveVehicleHoldWarningForConfirm(
  entry: VehicleCatalogEntry,
): VehicleSearchHoldWarning {
  if (entry.holdWarning) return entry.holdWarning
  return {
    code: '',
    title: entry.vehicleStatus,
  }
}

export function formatVinForDisplay(vin: string, maxLength = 17): string {
  const trimmed = vin.trim()
  if (!trimmed) return ''
  if (trimmed.length <= maxLength) return trimmed
  return `···${trimmed.slice(-8)}`
}

export function getHighDemandDemandLabel(
  group: HighDemandVehicleGroup | null,
): string | null {
  if (!group) return null
  if (group.status === 'critical') return 'Critical'
  if (group.status === 'high') return 'High'
  return null
}
