import type { FlowContext } from '../types/flow'
import { VSA_TUTORIAL } from '../utils/tutorialSteps'
import { VSA_VEHICLE } from '../utils/vehicleSummary'
import { TransportScreen } from './TransportScreen'

const VSA_SECTIONS = ['cleaning', 'fuel', 'stall'] as const

type VsaScreenProps = {
  context: FlowContext
  onAction: (action: string, payload?: string) => void
  onMovementAction: (action: string, payload?: string) => void
  onStallAction: (action: string, payload?: string) => void
  onCleaningAction: (action: string, payload?: string) => void
  onSignOut?: () => void
  forceTutorial?: boolean
}

export function VsaScreen({
  context,
  onAction,
  onMovementAction,
  onStallAction,
  onCleaningAction,
  onSignOut,
  forceTutorial = false,
}: VsaScreenProps) {
  return (
    <TransportScreen
      title="VSA"
      subtitle="Vehicle Service Attendant"
      sections={[...VSA_SECTIONS]}
      defaultExpanded={null}
      vehicleProfile={VSA_VEHICLE}
      context={context}
      onAction={onAction}
      onMovementAction={onMovementAction}
      onStallAction={onStallAction}
      onCleaningAction={onCleaningAction}
      onSignOut={onSignOut}
      tutorial={VSA_TUTORIAL}
      forceTutorial={forceTutorial}
    />
  )
}
