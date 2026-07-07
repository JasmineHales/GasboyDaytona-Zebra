import { useI18n } from '../../i18n/I18nProvider'
import type { HighDemandVehicleGroup } from '../../utils/homeHighDemandGroups'
import { formatVehicleGroupDisplayName } from '../../utils/homeHighDemandGroups'

export function VehicleHighDemandChip({ group }: { group: HighDemandVehicleGroup }) {
  const { messages, t } = useI18n()
  const vehicleGroup = formatVehicleGroupDisplayName(group.vehicleGroup)

  return (
    <span
      className="vehicle-high-demand-chip"
      aria-label={t('vehicleSearch.highDemandChipLabel', {
        vehicleGroup,
      })}
    >
      {messages.vehicleSearch.highDemandChip}
    </span>
  )
}
