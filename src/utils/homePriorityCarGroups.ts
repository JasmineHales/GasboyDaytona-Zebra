import {
  getHighDemandGroupsForSite,
  filterHighDemandGroups,
  sortHighDemandGroups,
  type HighDemandVehicleGroup,
} from './homeHighDemandGroups'

export type PriorityVehicleClass = {
  vehicleClass: string
  waitingCount: number
  tone: 'high' | 'medium'
}

function toPriorityVehicleClass(group: HighDemandVehicleGroup): PriorityVehicleClass {
  return {
    vehicleClass: group.vehicleClass,
    waitingCount: group.demandCount,
    tone:
      group.status === 'critical' || group.status === 'high' ? 'high' : 'medium',
  }
}

export function getPriorityVehicleClassesForSite(site: string): PriorityVehicleClass[] {
  return filterHighDemandGroups(sortHighDemandGroups(getHighDemandGroupsForSite(site))).map(
    toPriorityVehicleClass,
  )
}

/** @deprecated Use getPriorityVehicleClassesForSite */
export function getPriorityCarGroupsForSite(site: string): PriorityVehicleClass[] {
  return getPriorityVehicleClassesForSite(site)
}

export function vehicleClassMatchesPriority(
  vehicleClass: string,
  priorityClass: string,
): boolean {
  const vehicle = vehicleClass.trim().toUpperCase()
  const priority = priorityClass.trim().toUpperCase()
  if (!vehicle || !priority) return false

  return (
    vehicle === priority ||
    vehicle.startsWith(`${priority} `) ||
    vehicle.includes(` ${priority} `) ||
    vehicle.endsWith(` ${priority}`)
  )
}

export function isPriorityVehicleClass(
  vehicleClass: string,
  site: string,
): boolean {
  return getPriorityVehicleClassesForSite(site).some((group) =>
    vehicleClassMatchesPriority(vehicleClass, group.vehicleClass),
  )
}

export function getMatchingPriorityClass(
  vehicleClass: string,
  site: string,
): PriorityVehicleClass | null {
  return (
    getPriorityVehicleClassesForSite(site).find((group) =>
      vehicleClassMatchesPriority(vehicleClass, group.vehicleClass),
    ) ?? null
  )
}
