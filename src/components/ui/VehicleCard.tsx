import { AlertCircle, ChevronRight } from 'lucide-react'
import { useState, type Ref } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import type { VehicleSummary } from '../../utils/vehicleSummary'
import { trackProps } from '../../utils/tracking'
import { VehicleCardDetailsOverlay } from './VehicleCardDetailsOverlay'
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

export function VehicleCard({ summary, odometer, onReportVehicle }: VehicleCardProps) {
  const { messages, t } = useI18n()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const holdMessage = summary.holdWarning
    ? messages.vehicle.holdMessages[
        summary.holdWarning.message as keyof typeof messages.vehicle.holdMessages
      ] ?? summary.holdWarning.message
    : undefined
  const summaryLine = [summary.make, summary.model, summary.vehicleType]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="vehicle-card" data-tutorial="vehicle">
      <button
        type="button"
        className="vehicle-card__header vehicle-card__header--interactive vehicle-card__header--compact"
        aria-label={t('vehicle.viewDetailsAria', { plate: summary.licensePlate })}
        aria-expanded={detailsOpen}
        onClick={() => setDetailsOpen(true)}
        {...trackProps('vehicle-card.details.open', { unitId: summary.unitId })}
      >
        <div className="vehicle-card__header-main">
          <p className="vehicle-card__summary-title">{summary.licensePlate}</p>
          {summaryLine ? (
            <p className="vehicle-card__summary-subtitle">{summaryLine}</p>
          ) : null}
        </div>

        <div className="vehicle-card__header-meta">
          {summary.holdWarning ? (
            <span className="vehicle-search-card__hold-badge" role="status">
              {t('vehicleSearch.results.onHoldBadge')}
            </span>
          ) : null}

          <ChevronRight className="vehicle-card__expand-icon" aria-hidden />
        </div>
      </button>

      {odometer ? (
        <VehicleOdometerField
          ref={odometer.odometerRef}
          odometerReading={odometer.odometerReading}
          onOdometerChange={odometer.onOdometerChange}
          verified={odometer.verified}
          hint={odometer.hint}
          minimumMiles={odometer.minimumMiles}
        />
      ) : null}

      {onReportVehicle ? (
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
      ) : null}

      <VehicleCardDetailsOverlay
        open={detailsOpen}
        summary={summary}
        holdMessage={holdMessage}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  )
}
