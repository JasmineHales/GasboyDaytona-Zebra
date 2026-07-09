import {
  Briefcase,
  CarFront,
  ClipboardCheck,
  ClipboardList,
  Fuel,
  KeyRound,
  type LucideIcon,
  Radio,
  Truck,
} from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import type { HomeWorkflowId, HomeWorkflowVariant } from '../../utils/homeWorkflows'
import { buildHomeWorkflowItems } from '../../utils/homeWorkflowCopy'
import { HomeHighDemandVehicleGroups } from './HomeHighDemandVehicleGroups'
import { WorkflowCard } from './WorkflowCard'

type HomeWorkflowListProps = {
  site: string
  onSelectVsa: () => void
  onSelectTransport: () => void
  onSelectFuel: () => void
}

const WORKFLOW_ICONS: Record<HomeWorkflowVariant, LucideIcon> = {
  vsa: ClipboardList,
  transport: Truck,
  fuel: Fuel,
  'chase-van': CarFront,
  dispatcher: Radio,
  inspection: ClipboardCheck,
  keys: KeyRound,
  'non-driving-activity': Briefcase,
  default: ClipboardList,
}

const WORKFLOW_HANDLERS: Partial<
  Record<
    HomeWorkflowId,
    keyof Pick<
      HomeWorkflowListProps,
      'onSelectVsa' | 'onSelectTransport' | 'onSelectFuel'
    >
  >
> = {
  vsa: 'onSelectVsa',
  transport: 'onSelectTransport',
  fuel: 'onSelectFuel',
}

export function HomeWorkflowList({
  site,
  onSelectVsa,
  onSelectTransport,
  onSelectFuel,
}: HomeWorkflowListProps) {
  const { messages } = useI18n()
  const items = useMemo(
    () => buildHomeWorkflowItems(messages.home.workflows),
    [messages],
  )

  const handlers = {
    onSelectVsa,
    onSelectTransport,
    onSelectFuel,
  }

  return (
    <div className="home-workflow-list">
      <HomeHighDemandVehicleGroups site={site} />

      <section className="home-workflow-group">
        <div className="home-workflow-group__items home-workflow-group__items--cards" data-tutorial="workflows">
          {items.map((item) => {
            const handlerKey = WORKFLOW_HANDLERS[item.id]
            const onClick = handlerKey ? handlers[handlerKey] : undefined
            const Icon = WORKFLOW_ICONS[item.variant]
            const disabled = Boolean(item.comingSoon)

            return (
              <WorkflowCard
                key={item.id}
                variant={item.variant}
                title={item.title}
                icon={<Icon className="home-workflow-card__icon-svg" strokeWidth={2} aria-hidden />}
                onClick={onClick ?? (() => {})}
                list
                disabled={disabled}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
