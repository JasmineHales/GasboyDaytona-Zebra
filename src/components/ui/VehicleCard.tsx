import { AlertCircle, ChevronRight, Info } from 'lucide-react'
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
  minimumMiles?: number | null
  odometerRef?: Ref<HTMLDivElement>
}

type VehicleCardProps = {
  summary: VehicleSummary
  odometer?: VehicleOdometerProps
  onReportVehicle?: () => void
  layout?: 'combined' | 'split'
}

export function VehicleCard({
  summary,
  odometer,
  onReportVehicle,
  layout = 'combined',
}: VehicleCardProps) {
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

  const vehicleHeader = (
    <button
      type="button"
      className="workflow-vehicle-card__header"
      aria-label={t('vehicle.viewDetailsAria', { plate: summary.licensePlate })}
      aria-expanded={detailsOpen}
      onClick={() => setDetailsOpen(true)}
      {...trackProps('vehicle-card.details.open', { unitId: summary.unitId })}
    >
      <div className="workflow-vehicle-card__copy">
        <p className="workflow-vehicle-card__title">{summary.licensePlate}</p>
        {summaryLine ? (
          <p className="workflow-vehicle-card__subtitle">{summaryLine}</p>
        ) : null}
      </div>
      <div className="workflow-vehicle-card__meta">
        {summary.holdWarning ? (
          <span className="vehicle-search-card__hold-badge" role="status">
            {t('vehicleSearch.results.onHoldBadge')}
          </span>
        ) : null}
        <ChevronRight className="workflow-vehicle-card__chevron" aria-hidden strokeWidth={2} />
      </div>
    </button>
  )

  const odometerBlock = odometer ? (
    <div className="workflow-vehicle-stack__odometer" data-tutorial="vehicle-odometer">
      <div className="workflow-odometer-card__heading">
        <div className="workflow-odometer-card__title-row">
          <p className="workflow-odometer-card__title">{t('vehicle.odometer')}</p>
          {!odometer.verified ? (
            <span className="workflow-pill workflow-pill--required">{t('workflow.required')}</span>
          ) : null}
        </div>
      </div>
      <VehicleOdometerField
        ref={odometer.odometerRef}
        odometerReading={odometer.odometerReading}
        onOdometerChange={odometer.onOdometerChange}
        verified={odometer.verified}
        minimumMiles={odometer.minimumMiles}
        embedded
      />
    </div>
  ) : null

  const reportBlock = onReportVehicle ? (
    <button
      type="button"
      onClick={onReportVehicle}
      className="workflow-vehicle-stack__report field-target"
      aria-label={t('vehicle.reportVehicleAria', {
        unitId: summary.unitId,
        name: summary.name,
      })}
      data-tutorial="vehicle-report"
      {...trackProps('vehicle.report', { unitId: summary.unitId })}
    >
      <span className="workflow-report-card__icon" aria-hidden>
        <AlertCircle className="workflow-report-card__icon-svg" strokeWidth={2} />
      </span>
      <span className="workflow-report-card__label">{t('vehicle.reportVehicle')}</span>
      <ChevronRight className="workflow-report-card__chevron" aria-hidden strokeWidth={2} />
    </button>
  ) : null

  if (layout === 'split') {
    return (
      <>
        <div className="workflow-field-card workflow-vehicle-stack" data-tutorial="vehicle">
          {vehicleHeader}
          {odometerBlock ? <div className="workflow-vehicle-stack__divider" aria-hidden /> : null}
          {odometerBlock}
          {reportBlock ? <div className="workflow-vehicle-stack__divider" aria-hidden /> : null}
          {reportBlock}
        </div>
        <VehicleCardDetailsOverlay
          open={detailsOpen}
          summary={summary}
          holdMessage={holdMessage}
          onClose={() => setDetailsOpen(false)}
        />
      </>
    )
  }

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
          <Info className="vehicle-card__info-icon" aria-hidden strokeWidth={2} />
        </div>
      </button>

      {odometer ? (
        <VehicleOdometerField
          ref={odometer.odometerRef}
          odometerReading={odometer.odometerReading}
          onOdometerChange={odometer.onOdometerChange}
          verified={odometer.verified}
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
          <span className="vehicle-card__report-leading">
            <AlertCircle className="vehicle-card__report-icon" aria-hidden />
            <span className="vehicle-card__report-label">{t('vehicle.reportVehicle')}</span>
          </span>
          <ChevronRight className="vehicle-card__report-chevron" aria-hidden strokeWidth={2} />
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
