import type { FlowContext } from '../types/flow'
import { VSA_VEHICLE } from '../utils/vehicleSummary'
import { TransportScreen } from './TransportScreen'

const VSA_SECTIONS = ['cleaning', 'fuel', 'stall'] as const

type VsaScreenProps = {
  context: FlowContext
  onAction: (action: string, payload?: string) => void
  onMovementAction: (action: string, payload?: string) => void
  onStallAction: (action: string, payload?: string) => void
  onCleaningAction: (action: string, payload?: string) => void
}

export function VsaScreen({
  context,
  onAction,
  onMovementAction,
  onStallAction,
  onCleaningAction,
}: VsaScreenProps) {
  return (
    <TransportScreen
      title="VSA"
      subtitle="Vehicle Service Advisor"
      sections={[...VSA_SECTIONS]}
      defaultExpanded={null}
      vehicleProfile={VSA_VEHICLE}
      context={context}
      onAction={onAction}
      onMovementAction={onMovementAction}
      onStallAction={onStallAction}
      onCleaningAction={onCleaningAction}
    />
  )
}
