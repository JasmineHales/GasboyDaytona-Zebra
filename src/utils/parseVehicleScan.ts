import {
  normalizeUnitNumber,
  UNIT_NUMBER_LENGTH,
} from './vehicleSearchIds'

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i
const PLATE_PATTERN = /^[A-Z0-9-]{4,12}$/i

function parseVehicleScanRaw(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const unitDigits = trimmed.replace(/\D/g, '')
  if (unitDigits.length === UNIT_NUMBER_LENGTH) {
    return unitDigits.padStart(UNIT_NUMBER_LENGTH, '0')
  }

  if (VIN_PATTERN.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  const vinMatch = trimmed.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i)
  if (vinMatch) {
    return vinMatch[1].toUpperCase()
  }

  const labeledUnit = trimmed.match(
    /(?:unit|vehicle|unitid|unitnumber)[=:/\s-]*(\d{6,8})/i,
  )
  if (labeledUnit) {
    const normalized = normalizeUnitNumber(labeledUnit[1])
    if (normalized.length > 0) {
      return normalized.padStart(UNIT_NUMBER_LENGTH, '0')
    }
  }

  const labeledVin = trimmed.match(/(?:vin)[=:/\s-]*([A-HJ-NPR-Z0-9]{17})/i)
  if (labeledVin) {
    return labeledVin[1].toUpperCase()
  }

  const labeledPlate = trimmed.match(/(?:plate|license)[=:/\s-]*([A-Z0-9-]{4,12})/i)
  if (labeledPlate) {
    return labeledPlate[1].toUpperCase()
  }

  if (PLATE_PATTERN.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  const embeddedUnit = trimmed.match(/\b(\d{8})\b/)
  if (embeddedUnit) {
    return embeddedUnit[1]
  }

  return null
}

function parseVehiclePayload(text: string): string | null {
  try {
    const payload = JSON.parse(text) as Record<string, unknown>
    for (const key of ['unitId', 'unit', 'unitNumber', 'vin', 'plate', 'licensePlate']) {
      const value = payload[key]
      if (typeof value === 'string' && value.trim()) {
        const parsed = parseVehicleScanRaw(value.trim())
        if (parsed) return parsed
      }
    }
  } catch {
    // Not JSON — continue with text parsing.
  }

  return null
}

export function parseVehicleFromQr(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  return parseVehiclePayload(trimmed) ?? parseVehicleScanRaw(trimmed)
}

export function parseVehicleFromBarcode(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  if (VIN_PATTERN.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  return parseVehicleScanRaw(trimmed) ?? (trimmed.length >= 4 ? trimmed.toUpperCase() : null)
}
