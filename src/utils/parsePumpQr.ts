import { parseVehicleFromQr } from './parseVehicleScan'

export function parsePumpNumberFromQr(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  if (/^\d{1,2}$/.test(trimmed)) {
    return trimmed
  }

  try {
    const payload = JSON.parse(trimmed) as {
      pump?: string | number
      pumpNumber?: string | number
    }

    const pumpValue = payload.pumpNumber ?? payload.pump
    if (pumpValue != null) {
      const pump = String(pumpValue).replace(/\D/g, '')
      if (pump && Number.parseInt(pump, 10) >= 1 && Number.parseInt(pump, 10) <= 99) {
        return pump
      }
    }
  } catch {
    // Not JSON — continue with text parsing.
  }

  const labeledMatch = trimmed.match(/(?:pump|p)[=:/\s-]*(\d{1,2})/i)
  if (labeledMatch) {
    return labeledMatch[1]
  }

  const digits = trimmed.match(/\b(\d{1,2})\b/)
  return digits?.[1] ?? null
}

export function parseVehicleUnitFromQr(text: string): string | null {
  return parseVehicleFromQr(text)
}

export { parseVehicleFromQr, parseVehicleFromBarcode } from './parseVehicleScan'
