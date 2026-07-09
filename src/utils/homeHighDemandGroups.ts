export type DemandLevel = 'critical' | 'high' | 'moderate' | 'neutral'
export type DemandTier = 'high' | 'elevated' | 'moderate' | 'low'
export type DemandTrend = 'up' | 'down' | 'stable'
export type CoverageStatus = 'critical_shortage' | 'moderate_demand' | 'demand_covered'

export type HighDemandVehicleGroup = {
  id: string
  vehicleGroup: string
  vehicleClass: string
  demandCount: number
  availableCount: number
  reservationCount: number
  demandTier: DemandTier
  status: DemandLevel
  trend: DemandTrend
  lastUpdated: string
  mostRequested?: string[]
  openReservations?: number
  averageWaitMinutes?: number
}

/** User-facing vehicle group label — sentence case regardless of source data casing. */
export function formatVehicleGroupDisplayName(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  const lower = trimmed.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

const DAYTONA_HIGH_DEMAND: HighDemandVehicleGroup[] = [
  {
    id: 'ex-large-suv',
    vehicleGroup: '2WD EX LARGE SUV',
    vehicleClass: '2WD EX LARGE SUV',
    demandCount: 4,
    availableCount: 0,
    reservationCount: 4,
    demandTier: 'high',
    status: 'high',
    trend: 'up',
    lastUpdated: '2026-06-24T10:31:00Z',
    mostRequested: ['Airport Counter', 'Gold Counter'],
    openReservations: 4,
    averageWaitMinutes: 26,
  },
  {
    id: 'midsize',
    vehicleGroup: 'Midsize',
    vehicleClass: 'MIDSIZE',
    demandCount: 4,
    availableCount: 1,
    reservationCount: 4,
    demandTier: 'high',
    status: 'high',
    trend: 'up',
    lastUpdated: '2026-06-24T10:28:00Z',
    mostRequested: ['Airport Counter', 'Gold Counter'],
    openReservations: 4,
    averageWaitMinutes: 22,
  },
  {
    id: 'compact',
    vehicleGroup: 'COMPACT',
    vehicleClass: 'COMPACT',
    demandCount: 3,
    availableCount: 0,
    reservationCount: 3,
    demandTier: 'elevated',
    status: 'high',
    trend: 'stable',
    lastUpdated: '2026-06-24T10:25:00Z',
    mostRequested: ['Airport Counter'],
    openReservations: 3,
    averageWaitMinutes: 16,
  },
  {
    id: 'large-suv',
    vehicleGroup: 'Large SUV',
    vehicleClass: '2WD LARGE SUV',
    demandCount: 2,
    availableCount: 1,
    reservationCount: 2,
    demandTier: 'moderate',
    status: 'moderate',
    trend: 'up',
    lastUpdated: '2026-06-24T10:29:00Z',
    mostRequested: ['Gold Counter'],
    openReservations: 2,
    averageWaitMinutes: 21,
  },
  {
    id: 'small-suv',
    vehicleGroup: 'Small SUV',
    vehicleClass: '2WD SMALL 5 PASS SUV',
    demandCount: 1,
    availableCount: 0,
    reservationCount: 1,
    demandTier: 'low',
    status: 'moderate',
    trend: 'up',
    lastUpdated: '2026-06-24T10:30:00Z',
    mostRequested: ['Airport Counter'],
    openReservations: 1,
    averageWaitMinutes: 18,
  },
]

const HIGH_DEMAND_BY_SITE: Record<string, HighDemandVehicleGroup[]> = {
  Daytona: DAYTONA_HIGH_DEMAND,
  Orlando: [
    {
      id: 'midsize',
      vehicleGroup: 'Midsize',
      vehicleClass: 'MIDSIZE',
      demandCount: 5,
      availableCount: 1,
      reservationCount: 5,
      demandTier: 'high',
      status: 'critical',
      trend: 'up',
      lastUpdated: '2026-06-24T10:30:00Z',
      mostRequested: ['Airport Counter', 'Gold Counter'],
      openReservations: 5,
      averageWaitMinutes: 28,
    },
    {
      id: 'compact-suv',
      vehicleGroup: '2WD Compact SUV',
      vehicleClass: '2WD COMPACT SUV',
      demandCount: 3,
      availableCount: 1,
      reservationCount: 3,
      demandTier: 'elevated',
      status: 'high',
      trend: 'up',
      lastUpdated: '2026-06-24T10:29:00Z',
      openReservations: 3,
      averageWaitMinutes: 19,
    },
    {
      id: '7pass-suv',
      vehicleGroup: '4WD 7 Pass SUV',
      vehicleClass: '4WD 7 PASS SUV',
      demandCount: 4,
      availableCount: 0,
      reservationCount: 4,
      demandTier: 'high',
      status: 'high',
      trend: 'up',
      lastUpdated: '2026-06-24T10:27:00Z',
      openReservations: 4,
      averageWaitMinutes: 24,
    },
    {
      id: 'fullsize',
      vehicleGroup: 'Fullsize',
      vehicleClass: 'FULLSIZE',
      demandCount: 2,
      availableCount: 2,
      reservationCount: 2,
      demandTier: 'moderate',
      status: 'moderate',
      trend: 'stable',
      lastUpdated: '2026-06-24T10:21:00Z',
      openReservations: 2,
      averageWaitMinutes: 11,
    },
  ],
  'Demand Balanced': [],
}

export function getDemandTierFromNeed(need: number): DemandTier {
  if (need >= 4) return 'high'
  if (need >= 3) return 'elevated'
  if (need >= 2) return 'moderate'
  return 'low'
}

export function getDemandLevel(demandCount: number): DemandLevel {
  if (demandCount >= 5) return 'critical'
  if (demandCount >= 3) return 'high'
  if (demandCount >= 1) return 'moderate'
  return 'neutral'
}

export function getCoverageStatus(
  demandCount: number,
  availableCount: number,
): CoverageStatus {
  const gap = demandCount - availableCount
  if (gap >= 3) return 'critical_shortage'
  if (gap >= 1) return 'moderate_demand'
  return 'demand_covered'
}

export function groupNeedsAttention(group: HighDemandVehicleGroup): boolean {
  return group.demandCount > group.availableCount
}

export function isHighDemandGroup(group: HighDemandVehicleGroup): boolean {
  return group.demandTier === 'high' || group.demandTier === 'elevated'
}

export function filterHighDemandGroups(
  groups: HighDemandVehicleGroup[],
): HighDemandVehicleGroup[] {
  return groups.filter(isHighDemandGroup)
}

export function sortHighDemandGroups(
  groups: HighDemandVehicleGroup[],
): HighDemandVehicleGroup[] {
  return [...groups].sort((a, b) => {
    if (b.demandCount !== a.demandCount) return b.demandCount - a.demandCount
    if (b.reservationCount !== a.reservationCount) {
      return b.reservationCount - a.reservationCount
    }
    return a.vehicleGroup.localeCompare(b.vehicleGroup)
  })
}

export function getHighDemandGroupsForSite(site: string): HighDemandVehicleGroup[] {
  const normalized = site.trim()
  if (!normalized) return []

  const exact = HIGH_DEMAND_BY_SITE[normalized]
  if (exact) return exact

  const match = Object.entries(HIGH_DEMAND_BY_SITE).find(
    ([key]) => key.toLowerCase() === normalized.toLowerCase(),
  )
  return match?.[1] ?? DAYTONA_HIGH_DEMAND
}

export function getMatchingHighDemandGroup(
  vehicleClass: string,
  site: string,
): HighDemandVehicleGroup | null {
  return (
    filterHighDemandGroups(sortHighDemandGroups(getHighDemandGroupsForSite(site))).find((group) =>
      matchesVehicleClass(vehicleClass, group.vehicleClass),
    ) ?? null
  )
}

function matchesVehicleClass(vehicleClass: string, priorityClass: string): boolean {
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

export function getMinutesSince(iso: string, now = Date.now()): number {
  const updated = Date.parse(iso)
  if (Number.isNaN(updated)) return 0
  return Math.max(0, Math.round((now - updated) / 60_000))
}
