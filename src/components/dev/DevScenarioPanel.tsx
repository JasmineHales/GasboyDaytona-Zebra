import type { FlowContext } from '../../types/flow'
import type { AppView } from '../../utils/flowNavigation'
import { isGasboyLocation, patchForGasboyEnabled } from '../../utils/devPanel'
import { isVsaStallEnabled } from '../../utils/vsaStall'
import { DevToggleGroup } from './DevToggleGroup'

type DevScenarioPanelProps = {
  context: FlowContext
  view: AppView
  showLogin: boolean
  onPatchContext: (patch: Partial<FlowContext>) => void
}

export function DevScenarioPanel({
  context,
  view,
  showLogin,
  onPatchContext,
}: DevScenarioPanelProps) {
  const showFuelLocation =
    !showLogin && (view === 'transport' || view === 'fuel' || view === 'vsa')
  const showUnlockMode = showFuelLocation && isGasboyLocation(context)
  const showStallToggle = !showLogin && view === 'vsa'

  return (
    <div className="dev-scenario-panel">
      {showFuelLocation && (
        <DevToggleGroup
          label="Gasboy location"
          hint="Integrated pumps vs manual non-Gasboy"
          value={isGasboyLocation(context) ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          onChange={(value) => onPatchContext(patchForGasboyEnabled(value === 'yes'))}
          trackTag="dev.scenario.gasboy"
        />
      )}

      {showUnlockMode && (
        <DevToggleGroup
          label="Pump unlock"
          hint="Remote in-app vs on-site terminal"
          value={context.unlockMode}
          options={[
            { value: 'remote', label: 'Remote' },
            { value: 'on-site', label: 'On-site' },
          ]}
          onChange={(value) =>
            onPatchContext({ unlockMode: value as FlowContext['unlockMode'] })
          }
          trackTag="dev.scenario.unlock"
        />
      )}

      {showStallToggle && (
        <DevToggleGroup
          label="VSA stall"
          hint="Show stall section on VSA page"
          value={isVsaStallEnabled(context) ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          onChange={(value) => onPatchContext({ vsaStallEnabled: value === 'yes' })}
          trackTag="dev.scenario.vsa-stall"
        />
      )}
    </div>
  )
}
