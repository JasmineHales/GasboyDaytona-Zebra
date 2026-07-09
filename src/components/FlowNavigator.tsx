import { useState } from 'react'
import type { FlowContext } from '../types/flow'
import {
  PAGE_NAV_ITEMS,
  widgetGroupsForView,
  type AppView,
  type PageNavItem,
  type WidgetStateItem,
  type WorkflowView,
} from '../utils/flowNavigation'
import { VEHICLE_SEARCH_DEV_GROUPS } from '../utils/vehicleSearchDevStates'
import { formatDevScenarioSummary } from '../utils/devPanel'
import { trackProps } from '../utils/tracking'
import { DevScenarioPanel } from './dev/DevScenarioPanel'
import { DevToggleGroup } from './dev/DevToggleGroup'
import { DevWidgetStatesPanel } from './dev/DevWidgetStatesPanel'

type DevPanelTab = 'navigate' | 'scenario' | 'states'

type FlowNavigatorProps = {
  activePageKey: string
  activeWidgetKey: string | null
  workflowView: WorkflowView | null
  context: FlowContext
  view: AppView
  showLogin: boolean
  showSetup?: boolean
  loginVariant: 'device' | 'browser'
  onSelectPage: (item: PageNavItem) => void
  onSelectWidget: (item: WidgetStateItem) => void
  onLoginVariantChange: (variant: 'device' | 'browser') => void
  onPatchContext: (patch: Partial<FlowContext>) => void
  vehicleSearchActive?: boolean
  vehicleSearchDevState?: string | null
  onVehicleSearchDevStateSelect?: (stateKey: string) => void
}

const TAB_ITEMS: { id: DevPanelTab; label: string }[] = [
  { id: 'navigate', label: 'Pages' },
  { id: 'scenario', label: 'Scenario' },
  { id: 'states', label: 'States' },
]

function activePageLabel(activePageKey: string): string {
  return PAGE_NAV_ITEMS.find((item) => item.key === activePageKey)?.label ?? 'Unknown'
}

export function FlowNavigator({
  activePageKey,
  activeWidgetKey,
  workflowView,
  context,
  view,
  showLogin,
  showSetup = false,
  loginVariant,
  onSelectPage,
  onSelectWidget,
  onLoginVariantChange,
  onPatchContext,
  vehicleSearchActive = false,
  vehicleSearchDevState = null,
  onVehicleSearchDevStateSelect,
}: FlowNavigatorProps) {
  const [tab, setTab] = useState<DevPanelTab>('navigate')
  const widgetGroups = workflowView ? widgetGroupsForView(workflowView) : []
  const stateGroups = vehicleSearchActive ? VEHICLE_SEARCH_DEV_GROUPS : widgetGroups
  const resolvedActiveWidgetKey = vehicleSearchActive
    ? vehicleSearchDevState
    : activeWidgetKey
  const summary = formatDevScenarioSummary(context, {
    showLogin,
    showSetup,
    loginVariant,
    view,
  })

  const handlePageSelect = (item: PageNavItem) => {
    onSelectPage(item)
    if (['transport', 'fuel', 'vsa'].includes(item.view)) {
      setTab('states')
    }
  }

  return (
    <aside className="dev-flow-nav hidden shrink-0 md:flex" aria-label="Dev panel">
      <div className="dev-flow-nav__sticky">
        <header className="dev-flow-nav__header">
          <p className="dev-flow-nav__eyebrow">Daytona · V3</p>
          <div className="dev-flow-nav__context">
            <p className="dev-flow-nav__context-page">{activePageLabel(activePageKey)}</p>
            {!showLogin && workflowView && (
              <p className="dev-flow-nav__context-screen">{context.screen}</p>
            )}
          </div>
        </header>

        <div className="dev-context-chips" aria-label="Current scenario">
          {summary.map((line) => (
            <span key={line} className="dev-context-chip">
              {line}
            </span>
          ))}
        </div>

        <DevToggleGroup
          label="Experience"
          hint="Zebra emulator vs browser SSO"
          value={loginVariant}
          options={[
            { value: 'device', label: 'Zebra emulator' },
            { value: 'browser', label: 'Browser' },
          ]}
          onChange={onLoginVariantChange}
          trackTag="dev.experience"
        />

        <div className="dev-tabs" role="tablist" aria-label="Dev panel sections">
          {TAB_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`dev-tabs__tab${tab === item.id ? ' dev-tabs__tab--active' : ''}`}
              onClick={() => setTab(item.id)}
              {...trackProps('dev.flow-nav.tab', { tab: item.id })}
            >
              {item.label}
              {item.id === 'states' && widgetGroups.length > 0 && (
                <span className="dev-tabs__badge">{widgetGroups.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="dev-flow-nav__body">
        {tab === 'navigate' && (
          <section aria-label="Pages">
            <p className="dev-panel-section__intro">
              Jump to a prototype page. Workflow pages open the States tab automatically.
            </p>
            <div className="dev-page-grid">
              {PAGE_NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handlePageSelect(item)}
                  className={`dev-page-button${
                    activePageKey === item.key ? ' dev-page-button--active' : ''
                  }`}
                  aria-current={activePageKey === item.key ? 'true' : undefined}
                  {...trackProps('dev.flow-nav.page', { page: item.key })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === 'scenario' && (
          <section aria-label="Scenario toggles">
            <p className="dev-panel-section__intro">
              Location settings for the current page.
            </p>
            <DevScenarioPanel
              context={context}
              view={view}
              showLogin={showLogin}
              onPatchContext={onPatchContext}
            />
          </section>
        )}

        {tab === 'states' && (
          <section aria-label="Widget states">
            <DevWidgetStatesPanel
              groups={stateGroups}
              activeWidgetKey={resolvedActiveWidgetKey}
              onSelectWidget={(item) => {
                if (vehicleSearchActive) {
                  onVehicleSearchDevStateSelect?.(item.key)
                  return
                }
                onSelectWidget(item)
              }}
            />
          </section>
        )}
      </div>
    </aside>
  )
}
