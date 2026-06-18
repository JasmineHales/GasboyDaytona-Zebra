import { BarChart3, ClipboardList, Truck } from 'lucide-react'
import { WorkflowCard } from './WorkflowCard'

type HomeWorkflowListProps = {
  onSelectVsa: () => void
  onSelectTransport: () => void
  onOpenTracking?: () => void
  showTracking?: boolean
}

export function HomeWorkflowList({
  onSelectVsa,
  onSelectTransport,
  onOpenTracking,
  showTracking = import.meta.env.DEV,
}: HomeWorkflowListProps) {
  return (
    <div className="app-main-bottom" data-tutorial="workflows">
      <WorkflowCard
        variant="vsa"
        title="VSA"
        description="Start service workflow"
        icon={<ClipboardList className="h-7 w-7" />}
        onClick={onSelectVsa}
      />
      <WorkflowCard
        variant="transport"
        title="Transport"
        description="Start transport"
        icon={<Truck className="h-7 w-7" />}
        onClick={onSelectTransport}
      />
      {showTracking && onOpenTracking && (
        <WorkflowCard
          variant="tracking"
          title="Click Tracking"
          description="View session analytics"
          icon={<BarChart3 className="h-7 w-7" />}
          onClick={onOpenTracking}
        />
      )}
    </div>
  )
}
