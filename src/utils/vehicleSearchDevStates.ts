import type { WidgetStateGroup } from './flowNavigation'
import { VEHICLE_SEARCH_CATALOG } from './vehicleSearchCatalog'
import {
  EMPTY_MANUAL_VEHICLE_ENTRY,
  type ManualVehicleEntry,
} from './vehicleSearchManualEntry'

export type VehicleSearchDevStateId =
  | 'vehicle-search:idle'
  | 'vehicle-search:query-results'
  | 'vehicle-search:no-results'
  | 'vehicle-search:scan-error'
  | 'vehicle-search:selected'
  | 'vehicle-search:manual-entry'
  | 'vehicle-search:hold-confirm'

export type VehicleSearchDevSnapshot = {
  query: string
  scanError: string | null
  manualEntryOpen: boolean
  manualEntry: ManualVehicleEntry
  selectedVehicleId: string | null
  holdConfirmOpen: boolean
}

export const VEHICLE_SEARCH_DEV_GROUPS: WidgetStateGroup[] = [
  {
    label: 'Vehicle search',
    description: 'Open Fuel, Transport, or VSA from Home to reach this screen',
    items: [
      {
        key: 'vehicle-search:idle',
        label: 'Browse fleet',
        detail: 'Scan or search to begin',
        screen: 'transport-default',
        scopes: [],
      },
      {
        key: 'vehicle-search:query-results',
        label: 'Search results',
        detail: 'Query search · multiple matches',
        screen: 'transport-default',
        scopes: [],
      },
      {
        key: 'vehicle-search:no-results',
        label: 'No results',
        detail: 'Query search · empty list',
        screen: 'transport-default',
        scopes: [],
      },
      {
        key: 'vehicle-search:scan-error',
        label: 'Scan not found',
        detail: 'Failed scan · red search field',
        screen: 'transport-default',
        scopes: [],
      },
      {
        key: 'vehicle-search:selected',
        label: 'Vehicle selected',
        detail: 'Sticky footer · ready to continue',
        screen: 'transport-default',
        scopes: [],
      },
      {
        key: 'vehicle-search:hold-confirm',
        label: 'Hold warning',
        detail: 'On-hold vehicle · confirm dialog',
        screen: 'transport-default',
        scopes: [],
      },
      {
        key: 'vehicle-search:manual-entry',
        label: 'Manual entry',
        detail: 'Vehicle not in system',
        screen: 'transport-default',
        scopes: [],
      },
    ],
  },
]

export function isVehicleSearchDevStateId(value: string): value is VehicleSearchDevStateId {
  return VEHICLE_SEARCH_DEV_GROUPS.some((group) =>
    group.items.some((item) => item.key === value),
  )
}

export function buildVehicleSearchDevSnapshot(
  stateId: VehicleSearchDevStateId,
  scanNotFoundMessage: string,
): VehicleSearchDevSnapshot {
  const sampleVehicle = VEHICLE_SEARCH_CATALOG[0] ?? null
  const holdVehicle =
    VEHICLE_SEARCH_CATALOG.find((entry) => entry.licensePlate === '8LAK631') ??
    VEHICLE_SEARCH_CATALOG.find((entry) => entry.alertKind === 'on-hold') ??
    sampleVehicle

  switch (stateId) {
    case 'vehicle-search:query-results':
      return {
        query: 'Ford',
        scanError: null,
        manualEntryOpen: false,
        manualEntry: EMPTY_MANUAL_VEHICLE_ENTRY,
        selectedVehicleId: null,
        holdConfirmOpen: false,
      }
    case 'vehicle-search:no-results':
      return {
        query: 'NOTFOUND',
        scanError: null,
        manualEntryOpen: false,
        manualEntry: EMPTY_MANUAL_VEHICLE_ENTRY,
        selectedVehicleId: null,
        holdConfirmOpen: false,
      }
    case 'vehicle-search:scan-error':
      return {
        query: 'UNKNOWN-PLATE',
        scanError: scanNotFoundMessage,
        manualEntryOpen: false,
        manualEntry: EMPTY_MANUAL_VEHICLE_ENTRY,
        selectedVehicleId: null,
        holdConfirmOpen: false,
      }
    case 'vehicle-search:selected':
      return {
        query: sampleVehicle?.licensePlate ?? 'HZT',
        scanError: null,
        manualEntryOpen: false,
        manualEntry: EMPTY_MANUAL_VEHICLE_ENTRY,
        selectedVehicleId: sampleVehicle?.vehicleId ?? null,
        holdConfirmOpen: false,
      }
    case 'vehicle-search:hold-confirm':
      return {
        query: holdVehicle?.licensePlate ?? 'GA-HZT882',
        scanError: null,
        manualEntryOpen: false,
        manualEntry: EMPTY_MANUAL_VEHICLE_ENTRY,
        selectedVehicleId: holdVehicle?.vehicleId ?? null,
        holdConfirmOpen: true,
      }
    case 'vehicle-search:manual-entry':
      return {
        query: '',
        scanError: null,
        manualEntryOpen: true,
        manualEntry: {
          ...EMPTY_MANUAL_VEHICLE_ENTRY,
          owningAreaId: '002198',
          unitNumber: '04469999',
          make: 'Jeep',
          model: 'Compass',
          color: 'Silver',
          year: '2024',
          licensePlate: 'HZT-9999',
          state: 'FL',
        },
        selectedVehicleId: null,
        holdConfirmOpen: false,
      }
    case 'vehicle-search:idle':
    default:
      return {
        query: '',
        scanError: null,
        manualEntryOpen: false,
        manualEntry: EMPTY_MANUAL_VEHICLE_ENTRY,
        selectedVehicleId: null,
        holdConfirmOpen: false,
      }
  }
}
