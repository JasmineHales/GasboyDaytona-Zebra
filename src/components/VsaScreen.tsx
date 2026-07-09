import { useMemo } from 'react'
import type { FlowContext } from '../types/flow'
import { useI18n } from '../i18n/I18nProvider'
import { getVsaSections, getVsaTutorial } from '../utils/vsaStall'
import { VSA_VEHICLE, type VehicleProfile } from '../utils/vehicleSummary'
import { TransportScreen } from './TransportScreen'

type VsaScreenProps = {
  context: FlowContext
  vehicleProfile?: VehicleProfile
  site?: string
  onAction: (action: string, payload?: string) => void
  onMovementAction: (action: string, payload?: string) => void
  onStallAction: (action: string, payload?: string) => void
  onCleaningAction: (action: string, payload?: string) => void
  onSignOut?: () => void
  forceTutorial?: boolean
}

export function VsaScreen({
  context,
  vehicleProfile = VSA_VEHICLE,
  site,
  onAction,
  onMovementAction,
  onStallAction,
  onCleaningAction,
  onSignOut,
  forceTutorial = false,
}: VsaScreenProps) {
  const { messages } = useI18n()
  const sections = useMemo(() => getVsaSections(context), [context.vsaStallEnabled])
  const tutorial = useMemo(() => getVsaTutorial(context), [context.vsaStallEnabled])

  return (
    <TransportScreen
      title={messages.workflow.vsa.title}
      sections={sections}
      defaultExpanded="cleaning"
      vehicleProfile={vehicleProfile}
      site={site}
      workflowFinishId="vsa"
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
