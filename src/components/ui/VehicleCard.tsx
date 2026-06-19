import { useState, type Ref } from 'react'
import { AlertCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import type { VehicleSummary } from '../../utils/vehicleSummary'
import { trackProps } from '../../utils/tracking'
import { VehicleOdometerField } from './VehicleOdometerField'

type VehicleOdometerProps = {
  odometerReading: string
  onOdometerChange: (value: string) => void
  verified: boolean
  hint?: string
  minimumMiles?: number | null
  odometerRef?: Ref<HTMLDivElement>
}

type VehicleCardProps = {
  summary: VehicleSummary
  odometer?: VehicleOdometerProps
  onReportVehicle?: () => void
}

function DetailRow({
  label,
  value,
  chipClass,
}: {
  label: string
  value: string
  chipClass: string
}) {
  return (
    <div className="vehicle-card__detail-row">
      <span className="vehicle-card__detail-label">{label}</span>
      <span className={`fleet-chip shrink-0 text-sm font-bold ${chipClass}`}>{value}</span>
    </div>
  )
}

export function VehicleCard({ summary, odometer, onReportVehicle }: VehicleCardProps) {
  const { messages, t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const vehicleClass =
    messages.vehicle.classes[summary.vehicleClass as keyof typeof messages.vehicle.classes] ??
    summary.vehicleClass
  const holdMessage = summary.holdWarning
    ? messages.vehicle.holdMessages[
        summary.holdWarning.message as keyof typeof messages.vehicle.holdMessages
      ] ?? summary.holdWarning.message
    : undefined
  const hasDetails = Boolean(
    summary.holdWarning || summary.carPriority || summary.carTier,
  )

  return (
    <div className="vehicle-card" data-tutorial="vehicle">
      <button
        type="button"
        onClick={() => hasDetails && setExpanded((open) => !open)}
        aria-expanded={hasDetails ? expanded : undefined}
        disabled={!hasDetails}
        className={`vehicle-card__header${hasDetails ? ' vehicle-card__header--interactive' : ''}`}
        {...trackProps('vehicle-card.toggle', { expanded })}
      >
        <div className="vehicle-card__identity">
          <div className="vehicle-card__title-row">
            <span className="vehicle-card__unit">{summary.unitId}</span>
            <span className="vehicle-card__name">{summary.name}</span>
          </div>
          <p className="vehicle-card__class">{vehicleClass}</p>
        </div>

        <div className="vehicle-card__header-meta">
          {!expanded && summary.holdWarning && (
            <span className="vehicle-card__hold-badge">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              {t('vehicle.onHold')}
            </span>
          )}

          {!expanded && summary.carTier && !summary.holdWarning && (
            <span className="fleet-chip fleet-chip-info shrink-0 px-2.5 py-1 text-sm font-bold">
              {summary.carTier}
            </span>
          )}

          {hasDetails && (
            <ChevronDown
              className={`vehicle-card__chevron${expanded ? ' vehicle-card__chevron--open' : ''}`}
              aria-hidden
            />
          )}
        </div>
      </button>

      {odometer && (
        <VehicleOdometerField
          ref={odometer.odometerRef}
          odometerReading={odometer.odometerReading}
          onOdometerChange={odometer.onOdometerChange}
          verified={odometer.verified}
          hint={odometer.hint}
          minimumMiles={odometer.minimumMiles}
        />
      )}

      {onReportVehicle && (
        <button
          type="button"
          onClick={onReportVehicle}
          className="vehicle-card__report field-target"
          aria-label={t('vehicle.reportVehicleAria', {
            unitId: summary.unitId,
            name: summary.name,
          })}
          data-tutorial="vehicle-report"
          {...trackProps('vehicle.report', { unitId: summary.unitId })}
        >
          <AlertCircle className="vehicle-card__report-icon" aria-hidden />
          <span className="vehicle-card__report-label">{t('vehicle.reportVehicle')}</span>
        </button>
      )}

      {expanded && hasDetails && (
        <div className="vehicle-card__details">
          {summary.holdWarning && (
            <div className="vehicle-card__hold-notice">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="vehicle-card__hold-title">
                  {t('vehicle.holdWarning', { code: summary.holdWarning.code })}
                </p>
                <p className="vehicle-card__hold-message">{holdMessage}</p>
              </div>
            </div>
          )}

          {(summary.carPriority || summary.carTier) && (
            <div className="vehicle-card__details-panel">
              {summary.carPriority && (
                <DetailRow
                  label={t('vehicle.carPriority')}
                  value={summary.carPriority}
                  chipClass="fleet-chip-neutral"
                />
              )}
              {summary.carPriority && summary.carTier && (
                <div className="vehicle-card__details-divider" />
              )}
              {summary.carTier && (
                <DetailRow
                  label={t('vehicle.carTier')}
                  value={summary.carTier}
                  chipClass="fleet-chip-info"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
