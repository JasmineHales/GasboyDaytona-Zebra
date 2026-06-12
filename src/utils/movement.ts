const OCCUPIED_STALLS = new Set(['5'])

export function isStallOccupied(stallNumber: string) {
  return OCCUPIED_STALLS.has(stallNumber)
}
