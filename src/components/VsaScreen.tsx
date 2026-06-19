import { useMemo } from 'react'
import type { FlowContext } from '../types/flow'
import { getVsaSections, getVsaTutorial } from '../utils/vsaStall'
import { VSA_VEHICLE } from '../utils/vehicleSummary'
import { TransportScreen } from './TransportScreen'

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
  const sections = useMemo(() => getVsaSections(context), [context.vsaStallEnabled])
  const tutorial = useMemo(() => getVsaTutorial(context), [context.vsaStallEnabled])

  return (
    <TransportScreen
      title="VSA"
      subtitle="Vehicle Service Attendant"
      sections={sections}
      defaultExpanded={null}
      vehicleProfile={VSA_VEHICLE}
      context={context}
      onAction={onAction}
      onMovementAction={onMovementAction}
      onStallAction={onStallAction}
      onCleaningAction={onCleaningAction}
      onSignOut={onSignOut}
      tutorial={tutorial}
      forceTutorial={forceTutorial}
    />
  )
}
