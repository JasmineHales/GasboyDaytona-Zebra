export const OWNING_AREA_ID_LENGTH = 6
export const UNIT_NUMBER_LENGTH = 8
export const VIN_LENGTH = 17

export function isNumericFieldValue(value: string, length: number) {
  return /^\d*$/.test(value) && value.length <= length
}

export function sanitizeOwningAreaIdInput(value: string) {
  return value.replace(/\D/g, '').slice(0, OWNING_AREA_ID_LENGTH)
}

export function normalizeOwningAreaId(value: string) {
  const digits = sanitizeOwningAreaIdInput(value)
  return digits.length > 0 ? digits.padStart(OWNING_AREA_ID_LENGTH, '0') : ''
}

export function normalizeUnitNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, UNIT_NUMBER_LENGTH)
}

export function formatOwningAreaIdOption(id: string) {
  const digits = id.replace(/\D/g, '')
  return digits.padStart(OWNING_AREA_ID_LENGTH, '0')
}
