import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  getHighDemandGroupsForSite,
  sortHighDemandGroups,
} from '../../utils/homeHighDemandGroups'
import { HighDemandCard } from './HighDemandCard'

type HomeHighDemandVehicleGroupsProps = {
  site: string
}

export function HomeHighDemandVehicleGroups({ site }: HomeHighDemandVehicleGroupsProps) {
  const { messages } = useI18n()
  const copy = messages.home.highDemand
  const titleId = 'home-high-demand-balanced-title'

  const groups = useMemo(
    () => sortHighDemandGroups(getHighDemandGroupsForSite(site)),
    [site],
  )

  if (groups.length === 0) {
    return (
      <section
        className="high-demand-card high-demand-card--balanced"
        aria-labelledby={titleId}
        data-tutorial="high-demand-groups"
      >
        <h2 id={titleId} className="high-demand-card__balanced-title">
          {copy.balancedTitle}
        </h2>
        <p className="high-demand-card__balanced-detail">{copy.balancedDetail}</p>
      </section>
    )
  }

  return <HighDemandCard groups={groups} />
}
