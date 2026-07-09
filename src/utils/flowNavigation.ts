import type { ScreenId } from '../types/flow'
import {
  ODOMETER_WIDGET_STATES,
  patchForOdometerWidgetState,
  resolveOdometerWidgetState,
  type OdometerWidgetStateId,
} from './devPanel'
import { MILEAGE_SCENARIO_IDS, MILEAGE_SCENARIOS } from './mileageScenarios'

export type AppView = 'home' | 'vsa' | 'transport' | 'fuel' | 'tracking'

export type WorkflowView = 'transport' | 'vsa' | 'fuel'

export type PageNavItem = {
  key: string
  label: string
  view: AppView | 'login' | 'setup'
}

export type WidgetStateItem = {
  key: string
  label: string
  /** Short stakeholder-facing detail shown under the label. */
  detail?: string
  screen: ScreenId
  /** Workflow pages where this widget preset applies. */
  scopes: WorkflowView[]
  /** When set, patch context instead of applying a full screen preset. */
  patch?: Partial<import('../types/flow').FlowContext>
}

export type WidgetStateGroup = {
  label: string
  description?: string
  items: WidgetStateItem[]
}

const FUEL_REMOTE: { id: ScreenId; label: string; detail?: string }[] = [
  { id: 'fueling-default', label: 'Start · Enter pump number', detail: 'Scan or enter pump number' },
  { id: 'fueling-unlocking', label: 'Turning on pump', detail: 'Stepper · in progress' },
  { id: 'fueling-scanner', label: 'Scanner open', detail: 'Camera / QR scan overlay' },
  { id: 'fueling-manual-entry', label: 'Manual pump entry', detail: 'Typed pump number' },
  { id: 'fueling-in-progress', label: 'Fueling in progress 1', detail: '60s unlock timer · remote' },
  { id: 'fueling-in-progress-unconfirmed', label: 'Fueling in progress 2', detail: 'Fuel active · timer done' },
  { id: 'fueling-complete', label: 'Fueling complete', detail: 'Gallons recorded' },
  { id: 'fueling-additional', label: 'Additional fueling', detail: 'Second fuel transaction' },
  { id: 'fueling-additional-complete', label: 'Additional complete', detail: 'All transactions done' },
  { id: 'fueling-pump-unavailable', label: 'Pump unavailable', detail: 'Error · pump offline' },
  { id: 'fueling-connection-lost', label: 'Connection lost', detail: 'Error · network' },
  { id: 'fueling-no-response', label: 'No response', detail: '15s · no pump confirmation' },
  { id: 'fueling-pump-timeout', label: 'Pump timeout', detail: 'Error · unlock expired' },
  { id: 'fueling-issue', label: 'Report issue · category', detail: 'Issue overlay · step 1' },
  { id: 'fueling-issue-details', label: 'Report issue · details', detail: 'Issue overlay · step 2' },
]

const FUEL_ON_SITE: { id: ScreenId; label: string; detail?: string }[] = [
  { id: 'on-site-default', label: 'Start · Enter pump number', detail: 'Unlock at pump terminal' },
  { id: 'on-site-manual-entry', label: 'Manual pump entry', detail: 'Typed pump number' },
  { id: 'on-site-pump-verified', label: 'At pump', detail: 'Ready to start fueling' },
  { id: 'on-site-fueling-in-progress', label: 'Fueling in progress', detail: 'Manual gallon entry' },
  { id: 'on-site-fueling-complete', label: 'Fueling complete', detail: 'Gallons recorded' },
  { id: 'on-site-missing-info', label: 'Missing gallons', detail: 'Finish fueling prompt' },
  { id: 'on-site-missing-filled', label: 'Missing gallons filled', detail: 'Gallons entered' },
]

const FUEL_NON_GASBOY: { id: ScreenId; label: string; detail?: string }[] = [
  { id: 'non-gasboy-default', label: 'Start · Enter pump number', detail: 'Non-Gasboy manual flow' },
  { id: 'non-gasboy-manual-entry', label: 'Manual pump entry', detail: 'Typed pump number' },
  { id: 'non-gasboy-pump-verified', label: 'At pump', detail: 'Ready to start fueling' },
  { id: 'non-gasboy-fueling-in-progress', label: 'Fueling in progress', detail: 'Manual gallon entry' },
  { id: 'non-gasboy-fueling-complete', label: 'Fueling complete', detail: 'Gallons recorded' },
  { id: 'non-gasboy-missing-info', label: 'Missing gallons', detail: 'Finish fueling prompt' },
  { id: 'non-gasboy-missing-filled', label: 'Missing gallons filled', detail: 'Gallons entered' },
]

const ODOMETER_SCOPES: WorkflowView[] = ['transport', 'vsa', 'fuel']
const FUEL_SCOPES: WorkflowView[] = ['transport', 'vsa', 'fuel']
const TRANSPORT_ONLY: WorkflowView[] = ['transport']
const VSA_ONLY: WorkflowView[] = ['vsa']

function widgetItems(
  prefix: string,
  scopes: WorkflowView[],
  screens: { id: ScreenId; label: string; detail?: string }[],
): WidgetStateItem[] {
  return screens.map((screen) => ({
    key: `${prefix}:${screen.id}`,
    label: screen.label,
    detail: screen.detail,
    screen: screen.id,
    scopes,
  }))
}

/** Flat page list for the dev panel — device/browser is controlled in Scenario. */
export const PAGE_NAV_ITEMS: PageNavItem[] = [
  { key: 'page-login', label: 'Login', view: 'login' },
  { key: 'page-setup', label: 'Setup', view: 'setup' },
  { key: 'page-home', label: 'Home', view: 'home' },
  { key: 'page-vsa', label: 'VSA', view: 'vsa' },
  { key: 'page-fueling', label: 'Fueling', view: 'fuel' },
  { key: 'page-transport', label: 'Transport', view: 'transport' },
  { key: 'page-tracking', label: 'Tracking', view: 'tracking' },
]

export const WIDGET_STATE_GROUPS: WidgetStateGroup[] = [
  {
    label: 'Odometer widget',
    description: 'Verified chip vs manual entry field — keeps current workflow step',
    items: (Object.keys(ODOMETER_WIDGET_STATES) as OdometerWidgetStateId[]).map((id) => ({
      key: `odometer:${id}`,
      label: ODOMETER_WIDGET_STATES[id].label,
      detail: ODOMETER_WIDGET_STATES[id].hint,
      screen: 'transport-default',
      scopes: ODOMETER_SCOPES,
      patch: patchForOdometerWidgetState(id),
    })),
  },
  {
    label: 'Transport · Session',
    description: 'Whole transport workflow presets',
    items: [
      {
        key: 'transport:default',
        label: 'Fresh session',
        detail: 'Movement + fuel not started',
        screen: 'transport-default',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'transport:complete',
        label: 'Ready to finish',
        detail: 'All sections complete',
        screen: 'transport-complete',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'transport:issue-header',
        label: 'Header report issue',
        detail: 'Issue overlay from menu',
        screen: 'transport-issue-header',
        scopes: TRANSPORT_ONLY,
      },
    ],
  },
  {
    label: 'Movement · Transport location',
    description: 'Drive vehicle to a transport destination',
    items: [
      {
        key: 'movement:transport:select-location',
        label: 'Select location',
        detail: 'Empty location field',
        screen: 'transport-default',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:transport:location-selected',
        label: 'Location selected',
        detail: 'Awaiting confirmation',
        screen: 'movement-transport-location-selected',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:transport:complete',
        label: 'Movement complete',
        detail: 'Fuel section unlocked',
        screen: 'movement-transport-complete',
        scopes: TRANSPORT_ONLY,
      },
    ],
  },
  {
    label: 'Movement · Stall assignment',
    description: 'Transport stall movement mode',
    items: [
      {
        key: 'movement:stall:select-stall',
        label: 'Select stall',
        detail: 'Stall number entry',
        screen: 'movement-stall-select-stall',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:stall:selected',
        label: 'Stall selected',
        detail: 'Movement complete',
        screen: 'movement-stall-complete',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:stall:verify',
        label: 'Verify stall',
        detail: 'Occupied · photo required',
        screen: 'movement-stall-stall-verify',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:stall:issue-reported',
        label: 'Issue reported',
        detail: 'Photo submitted',
        screen: 'movement-stall-issue-reported',
        scopes: TRANSPORT_ONLY,
      },
    ],
  },
  {
    label: 'Fuel · Gasboy unlock with device',
    description: 'Integrated pump · turn on from this app',
    items: widgetItems('fuel-remote', FUEL_SCOPES, FUEL_REMOTE),
  },
  {
    label: 'Fuel · Gasboy unlock at pump',
    description: 'Integrated pump · turn on at terminal',
    items: widgetItems('on-site', FUEL_SCOPES, FUEL_ON_SITE),
  },
  {
    label: 'Fuel · Non-Gasboy',
    description: 'Manual pump verify and gallon entry',
    items: widgetItems('non-gasboy', FUEL_SCOPES, FUEL_NON_GASBOY),
  },
  {
    label: 'VSA · Session',
    description: 'Whole VSA workflow presets',
    items: [
      {
        key: 'vsa:default',
        label: 'Fresh session',
        detail: 'Cleaning + fuel + stall',
        screen: 'stall-default',
        scopes: VSA_ONLY,
      },
      {
        key: 'vsa:no-stall',
        label: 'No stall section',
        detail: 'Cleaning + fuel only',
        screen: 'vsa-no-stall-default',
        scopes: VSA_ONLY,
      },
      {
        key: 'vsa:complete',
        label: 'All sections complete',
        detail: 'Ready to finish',
        screen: 'vsa-complete',
        scopes: VSA_ONLY,
      },
      {
        key: 'vsa:issue-header',
        label: 'Header report issue',
        detail: 'Issue overlay from menu',
        screen: 'vsa-issue-header',
        scopes: VSA_ONLY,
      },
    ],
  },
  {
    label: 'VSA · Cleaning',
    description: 'Workstation entry through cleaning complete',
    items: [
      {
        key: 'cleaning:default',
        label: 'Enter workstation',
        detail: 'Scan or enter workstation',
        screen: 'cleaning-default',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:manual-entry',
        label: 'Manual entry',
        detail: 'Empty pump field',
        screen: 'cleaning-manual-entry',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:manual-filled',
        label: 'Manual filled',
        detail: 'Pump number entered',
        screen: 'cleaning-manual-entry-filled',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:manual-error',
        label: 'Manual error',
        detail: 'Invalid pump number',
        screen: 'cleaning-manual-entry-error',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:pump-verified',
        label: 'Pump verified',
        detail: 'Ready to start cleaning',
        screen: 'cleaning-pump-verified',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:in-progress',
        label: 'Cleaning in progress',
        detail: 'Timer running',
        screen: 'cleaning-in-progress',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:complete',
        label: 'Cleaning complete',
        detail: 'Section done',
        screen: 'cleaning-complete',
        scopes: VSA_ONLY,
      },
    ],
  },
  {
    label: 'VSA · Stall assignment',
    description: 'Stall number after cleaning or fuel',
    items: [
      {
        key: 'stall:default',
        label: 'Select stall',
        detail: 'Stall section unlocked',
        screen: 'stall-default',
        scopes: VSA_ONLY,
      },
      {
        key: 'stall:complete',
        label: 'Stall complete',
        detail: 'Stall number confirmed',
        screen: 'stall-complete',
        scopes: VSA_ONLY,
      },
      {
        key: 'stall:missing',
        label: 'Verify stall',
        detail: 'Occupied · photo required',
        screen: 'stall-missing',
        scopes: VSA_ONLY,
      },
      {
        key: 'stall:issue-reported',
        label: 'Issue reported',
        detail: 'Photo submitted',
        screen: 'stall-issue-reported',
        scopes: VSA_ONLY,
      },
    ],
  },
  {
    label: 'Mileage scenarios',
    description: 'Odometer reliability states on the vehicle card',
    items: MILEAGE_SCENARIO_IDS.map((id) => ({
      key: `mileage:${id}`,
      label: MILEAGE_SCENARIOS[id].label,
      detail: 'Transport movement section',
      screen: id,
      scopes: ['transport', 'vsa', 'fuel'] as WorkflowView[],
    })),
  },
]

export const WIDGET_STATE_ITEMS = WIDGET_STATE_GROUPS.flatMap((group) => group.items)

export function widgetGroupsForView(view: WorkflowView): WidgetStateGroup[] {
  return WIDGET_STATE_GROUPS.map((group) => ({
    label: group.label,
    items: group.items.filter((item) => item.scopes.includes(view)),
  })).filter((group) => group.items.length > 0)
}

export function resolveActivePageKey(input: {
  view: AppView
  showLogin: boolean
  showSetup?: boolean
}): string {
  if (input.showLogin) return 'page-login'
  if (input.showSetup) return 'page-setup'

  if (input.view === 'tracking') return 'page-tracking'
  if (input.view === 'transport') return 'page-transport'
  if (input.view === 'fuel') return 'page-fueling'
  if (input.view === 'vsa') return 'page-vsa'

  return 'page-home'
}

export function resolveActiveWidgetKey(
  view: WorkflowView,
  screen: ScreenId,
  context?: import('../types/flow').FlowContext,
): string | null {
  if (context) {
    const odometerId = resolveOdometerWidgetState(context)
    const odometerKey = `odometer:${odometerId}`
    const odometerItem = WIDGET_STATE_ITEMS.find(
      (item) => item.key === odometerKey && item.scopes.includes(view),
    )
    if (odometerItem) return odometerKey
  }

  const matches = WIDGET_STATE_ITEMS.filter(
    (item) => item.screen === screen && item.scopes.includes(view) && !item.patch,
  )
  return matches[0]?.key ?? null
}
