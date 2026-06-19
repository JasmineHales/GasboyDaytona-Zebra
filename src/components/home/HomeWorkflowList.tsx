import {
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
import {
  buildHomeWorkflowGroups,
  buildHomeWorkflowItems,
} from '../../utils/homeWorkflowCopy'
import { WorkflowCard } from './WorkflowCard'

type HomeWorkflowListProps = {
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
  onSelectVsa,
  onSelectTransport,
  onSelectFuel,
}: HomeWorkflowListProps) {
  const { messages } = useI18n()
  const groups = useMemo(
    () => buildHomeWorkflowGroups(messages.home.groups),
    [messages],
  )
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
    <div className="home-workflow-list" data-tutorial="workflows">
      {groups.map((group) => {
        const groupItems = items.filter((item) => item.group === group.id)
        if (groupItems.length === 0) return null

        return (
          <section
            key={group.id}
            className="home-workflow-group"
            aria-labelledby={`home-workflow-group-${group.id}`}
          >
            <div className="home-workflow-group__header">
              <h2 id={`home-workflow-group-${group.id}`} className="home-workflow-group__title">
                {group.label}
              </h2>
              {group.description && (
                <p className="home-workflow-group__description">{group.description}</p>
              )}
            </div>
            <div className="home-workflow-group__items">
              {groupItems.map((item) => {
                const handlerKey = WORKFLOW_HANDLERS[item.id]
                const onClick = handlerKey ? handlers[handlerKey] : undefined
                const disabled = item.comingSoon || !onClick
                const Icon = WORKFLOW_ICONS[item.variant]

                return (
                  <WorkflowCard
                    key={item.id}
                    variant={item.variant}
                    title={item.title}
                    description={item.description}
                    icon={<Icon className="home-workflow-card__icon-svg" aria-hidden />}
                    onClick={onClick ?? (() => {})}
                    disabled={disabled}
                    compact
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
