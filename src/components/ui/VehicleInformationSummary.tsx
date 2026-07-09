import { useI18n } from '../../i18n/I18nProvider'
import type { VehicleHoldWarning } from '../../utils/vehicleSummary'

export type VehicleInformationSummaryProps = {
  unitId: string
  licensePlate?: string
  make?: string
  model?: string
  vehicleType?: string
  name?: string
  holdWarning?: VehicleHoldWarning
  className?: string
}

export function VehicleInformationSummary({
  unitId,
  licensePlate,
  make,
  model,
  vehicleType,
  name,
  holdWarning,
  className = '',
}: VehicleInformationSummaryProps) {
  const { t } = useI18n()
  const title = licensePlate?.trim() || unitId
  const summaryLine =
    [make, model, vehicleType].filter(Boolean).join(' · ') || name?.trim() || ''

  return (
    <div
      className={`vehicle-information-summary${className ? ` ${className}` : ''}`}
      role="group"
      aria-label={
        summaryLine
          ? t('issue.reportingForVehicle', { unitId, name: summaryLine })
          : unitId
      }
    >
      <div className="vehicle-information-summary__copy">
        <p className="vehicle-information-summary__title">{title}</p>
        {summaryLine ? (
          <p className="vehicle-information-summary__subtitle">{summaryLine}</p>
        ) : null}
      </div>
      {holdWarning ? (
        <span className="vehicle-search-card__hold-badge" role="status">
          {t('vehicleSearch.results.onHoldBadge')}
        </span>
      ) : null}
    </div>
  )
}
