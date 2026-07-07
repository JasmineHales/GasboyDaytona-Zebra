import { ChevronDown, ChevronUp } from 'lucide-react'
import { useId } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { buildVehicleDetailPropsFromCatalog } from '../../utils/vehicleDetailDisplay'
import { slugifyTrackValue, trackProps } from '../../utils/tracking'
import type { VehicleCatalogEntry } from '../../utils/vehicleSearchCatalog'
import {
  VehicleSearchListCardExpanded,
  VehicleSearchListCardHeader,
} from './VehicleDetailSections'

type VehicleSearchResultCardProps = {
  vehicle: VehicleCatalogEntry
  selected: boolean
  expanded: boolean
  radioName: string
  onSelect: () => void
  onToggleExpand: () => void
}

export function VehicleSearchResultCard({
  vehicle,
  selected,
  expanded,
  radioName,
  onSelect,
  onToggleExpand,
}: VehicleSearchResultCardProps) {
  const { t } = useI18n()
  const detailProps = buildVehicleDetailPropsFromCatalog(vehicle)
  const detailsId = useId()
  const ChevronIcon = expanded ? ChevronUp : ChevronDown

  return (
    <article
      className={`vehicle-search-card${
        selected ? ' vehicle-search-card--selected' : ''
      }${expanded ? ' vehicle-search-card--expanded' : ''}`}
    >
      <div className="vehicle-search-card__header">
        <button
          type="button"
          role="radio"
          aria-checked={selected}
          name={radioName}
          className="vehicle-search-card__radio field-target"
          aria-label={t('vehicleSearch.results.selectVehicleAria', {
            plate: vehicle.licensePlate,
          })}
          onClick={onSelect}
          {...trackProps('vehicle-search.select-radio', {
            unit: slugifyTrackValue(vehicle.unitNumber),
          })}
        >
          <span className="vehicle-search-card__radio-mark" aria-hidden />
        </button>

        <VehicleSearchListCardHeader {...detailProps} />

        {detailProps.holdWarning ? (
          <span className="vehicle-search-card__hold-badge">
            {t('vehicleSearch.results.onHoldBadge')}
          </span>
        ) : null}

        <button
          type="button"
          className="vehicle-search-card__expand field-target"
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-label={t('vehicleSearch.results.toggleDetailsAria', {
            plate: vehicle.licensePlate,
          })}
          onClick={onToggleExpand}
          {...trackProps('vehicle-search.toggle-expand', {
            unit: slugifyTrackValue(vehicle.unitNumber),
            expanded: expanded ? 'yes' : 'no',
          })}
        >
          <ChevronIcon className="vehicle-search-card__expand-icon" aria-hidden />
        </button>
      </div>

      {expanded ? (
        <div id={detailsId}>
          <VehicleSearchListCardExpanded {...detailProps} />
        </div>
      ) : null}
    </article>
  )
}
