import { useI18n } from '../../i18n/I18nProvider'
import {
  formatVehicleGroupDisplayName,
  type DemandTier,
  type HighDemandVehicleGroup,
} from '../../utils/homeHighDemandGroups'

export function DemandDot({
  tier,
  label,
}: {
  tier: DemandTier
  label: string
}) {
  return (
    <span
      className={`high-demand-card__dot high-demand-card__dot--${tier}`}
      role="img"
      aria-label={label}
    />
  )
}

export function HighDemandChip({ group }: { group: HighDemandVehicleGroup }) {
  const { t } = useI18n()
  const tierLabel = t(`home.highDemand.tiers.${group.demandTier}`)
  const vehicleGroup = formatVehicleGroupDisplayName(group.vehicleGroup)

  return (
    <span
      className="high-demand-card__chip"
      aria-label={t('home.highDemand.chipTierLabel', {
        vehicleGroup,
        tier: tierLabel,
      })}
    >
      <DemandDot tier={group.demandTier} label={tierLabel} />
      <span className="high-demand-card__chip-name" aria-hidden>
        {vehicleGroup}
      </span>
    </span>
  )
}

export function HighDemandRow({ group }: { group: HighDemandVehicleGroup }) {
  const { t } = useI18n()
  const vehicleGroup = formatVehicleGroupDisplayName(group.vehicleGroup)

  return (
    <li className="high-demand-card__row">
      <DemandDot
        tier={group.demandTier}
        label={t(`home.highDemand.tiers.${group.demandTier}`)}
      />
      <span className="high-demand-card__row-name">{vehicleGroup}</span>
      <span
        className={`high-demand-card__row-need high-demand-card__row-need--${group.demandTier}`}
      >
        {t('home.highDemand.needShort', { need: String(group.demandCount) })}
      </span>
    </li>
  )
}
