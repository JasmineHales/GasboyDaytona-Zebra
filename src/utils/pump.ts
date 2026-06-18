export function isUnavailablePump(pump: string, unavailablePumps: number[]): boolean {
  const trimmed = pump.trim()
  if (!trimmed) return false
  return unavailablePumps.includes(Number(trimmed))
}
