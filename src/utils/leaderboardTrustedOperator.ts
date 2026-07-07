export type OperatorQualityFlags = {
  hasOverfill: boolean
  hasDuplicateScan: boolean
  hasIncorrectFuelEntry: boolean
  hasSuspiciousTime: boolean
  hasInvalidCleaningDuration: boolean
}

/** Trusted Operator is earned when the operator avoids all quality issues. */
export function isTrustedOperator(flags: OperatorQualityFlags): boolean {
  return !(
    flags.hasOverfill ||
    flags.hasDuplicateScan ||
    flags.hasIncorrectFuelEntry ||
    flags.hasSuspiciousTime ||
    flags.hasInvalidCleaningDuration
  )
}
