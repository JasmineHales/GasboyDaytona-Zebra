import type { ScreenId } from '../types/flow'
import { MILEAGE_SCENARIO_IDS, MILEAGE_SCENARIOS } from './mileageScenarios'

export type AppView = 'home' | 'vsa' | 'transport' | 'tracking'

export type WorkflowView = 'transport' | 'vsa'

export type PageNavItem = {
  key: string
  label: string
  view: AppView | 'login'
  loginVariant?: 'device' | 'browser'
}

export type WidgetStateItem = {
  key: string
  label: string
  screen: ScreenId
  /** Workflow pages where this widget preset applies. */
  scopes: WorkflowView[]
}

export type WidgetStateGroup = {
  label: string
  items: WidgetStateItem[]
}

const FUEL_REMOTE: { id: ScreenId; label: string }[] = [
  { id: 'fueling-default', label: 'Default' },
  { id: 'fueling-unlocking', label: 'Unlocking Pump' },
  { id: 'fueling-scanner', label: 'Scanner' },
  { id: 'fueling-manual-entry', label: 'Manual Entry' },
  { id: 'fueling-in-progress', label: 'Fueling In Progress' },
  { id: 'fueling-in-progress-unconfirmed', label: 'Fueling Unconfirmed' },
  { id: 'fueling-complete', label: 'Fueling Complete' },
  { id: 'fueling-additional', label: 'Additional Fueling' },
  { id: 'fueling-additional-complete', label: 'Additional Complete' },
  { id: 'fueling-pump-unavailable', label: 'Pump Unavailable' },
  { id: 'fueling-connection-lost', label: 'Connection Lost' },
  { id: 'fueling-no-response', label: 'No Response' },
  { id: 'fueling-pump-timeout', label: 'Pump Timeout' },
  { id: 'fueling-issue', label: 'Report Issue' },
  { id: 'fueling-issue-details', label: 'Issue Details' },
]

const FUEL_ON_SITE: { id: ScreenId; label: string }[] = [
  { id: 'on-site-default', label: 'Default' },
  { id: 'on-site-manual-entry', label: 'Manual Entry' },
  { id: 'on-site-pump-verified', label: 'At Pump' },
  { id: 'on-site-fueling-in-progress', label: 'Fueling In Progress' },
  { id: 'on-site-fueling-complete', label: 'Fueling Complete' },
  { id: 'on-site-missing-info', label: 'Missing Info' },
  { id: 'on-site-missing-filled', label: 'Missing Filled' },
]

const FUEL_NON_GASBOY: { id: ScreenId; label: string }[] = [
  { id: 'non-gasboy-default', label: 'Default' },
  { id: 'non-gasboy-manual-entry', label: 'Manual Entry' },
  { id: 'non-gasboy-pump-verified', label: 'At Pump' },
  { id: 'non-gasboy-fueling-in-progress', label: 'Fueling In Progress' },
  { id: 'non-gasboy-fueling-complete', label: 'Fueling Complete' },
  { id: 'non-gasboy-missing-info', label: 'Missing Info' },
  { id: 'non-gasboy-missing-filled', label: 'Missing Filled' },
]

const BOTH: WorkflowView[] = ['transport', 'vsa']
const TRANSPORT_ONLY: WorkflowView[] = ['transport']
const VSA_ONLY: WorkflowView[] = ['vsa']

function widgetItems(
  prefix: string,
  scopes: WorkflowView[],
  screens: { id: ScreenId; label: string }[],
): WidgetStateItem[] {
  return screens.map((screen) => ({
    key: `${prefix}:${screen.id}`,
    label: screen.label,
    screen: screen.id,
    scopes,
  }))
}

export const PAGE_NAV_ITEMS: PageNavItem[] = [
  { key: 'page-home-device', label: 'Home (device)', view: 'home', loginVariant: 'device' },
  { key: 'page-home-browser', label: 'Home (browser)', view: 'home', loginVariant: 'browser' },
  { key: 'page-transport', label: 'Transport', view: 'transport' },
  { key: 'page-vsa', label: 'VSA', view: 'vsa' },
  { key: 'page-tracking', label: 'Click Tracking', view: 'tracking' },
  { key: 'page-login-device', label: 'Login (device)', view: 'login', loginVariant: 'device' },
  { key: 'page-login-browser', label: 'Login (browser)', view: 'login', loginVariant: 'browser' },
]

export const WIDGET_STATE_GROUPS: WidgetStateGroup[] = [
  {
    label: 'Mileage',
    items: MILEAGE_SCENARIO_IDS.map((id) => ({
      key: `mileage:${id}`,
      label: MILEAGE_SCENARIOS[id].label,
      screen: id,
      scopes: BOTH,
    })),
  },
  {
    label: 'Transport · Overview',
    items: [
      { key: 'transport:default', label: 'Default', screen: 'transport-default', scopes: TRANSPORT_ONLY },
      { key: 'transport:complete', label: 'Complete', screen: 'transport-complete', scopes: TRANSPORT_ONLY },
      {
        key: 'transport:issue-header',
        label: 'Report Issue',
        screen: 'transport-issue-header',
        scopes: TRANSPORT_ONLY,
      },
    ],
  },
  {
    label: 'Movement · Transport',
    items: [
      {
        key: 'movement:transport:select-location',
        label: 'Select Location',
        screen: 'transport-default',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:transport:location-selected',
        label: 'Location Selected',
        screen: 'movement-transport-location-selected',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:transport:complete',
        label: 'Movement Complete',
        screen: 'movement-transport-complete',
        scopes: TRANSPORT_ONLY,
      },
    ],
  },
  {
    label: 'Movement · Stall',
    items: [
      {
        key: 'movement:stall:select-stall',
        label: 'Select Stall',
        screen: 'movement-stall-select-stall',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:stall:selected',
        label: 'Stall Selected',
        screen: 'movement-stall-complete',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:stall:verify',
        label: 'Verify Stall',
        screen: 'movement-stall-stall-verify',
        scopes: TRANSPORT_ONLY,
      },
      {
        key: 'movement:stall:issue-reported',
        label: 'Issue Reported',
        screen: 'movement-stall-issue-reported',
        scopes: TRANSPORT_ONLY,
      },
    ],
  },
  {
    label: 'Fuel · Gasboy',
    items: widgetItems('fuel-remote', BOTH, FUEL_REMOTE),
  },
  {
    label: 'Fuel · On-Site',
    items: widgetItems('on-site', BOTH, FUEL_ON_SITE),
  },
  {
    label: 'Fuel · Non-Gasboy',
    items: widgetItems('non-gasboy', BOTH, FUEL_NON_GASBOY),
  },
  {
    label: 'VSA · Overview',
    items: [
      { key: 'vsa:default', label: 'Default', screen: 'stall-default', scopes: VSA_ONLY },
      { key: 'vsa:complete', label: 'All Complete', screen: 'vsa-complete', scopes: VSA_ONLY },
      { key: 'vsa:issue-header', label: 'Report Issue', screen: 'vsa-issue-header', scopes: VSA_ONLY },
    ],
  },
  {
    label: 'Cleaning',
    items: [
      { key: 'cleaning:default', label: 'Verify Pump', screen: 'cleaning-default', scopes: VSA_ONLY },
      { key: 'cleaning:manual-entry', label: 'Manual Entry', screen: 'cleaning-manual-entry', scopes: VSA_ONLY },
      {
        key: 'cleaning:manual-filled',
        label: 'Manual Filled',
        screen: 'cleaning-manual-entry-filled',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:manual-error',
        label: 'Manual Error',
        screen: 'cleaning-manual-entry-error',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:pump-verified',
        label: 'Pump Verified',
        screen: 'cleaning-pump-verified',
        scopes: VSA_ONLY,
      },
      {
        key: 'cleaning:in-progress',
        label: 'In Progress',
        screen: 'cleaning-in-progress',
        scopes: VSA_ONLY,
      },
      { key: 'cleaning:complete', label: 'Complete', screen: 'cleaning-complete', scopes: VSA_ONLY },
    ],
  },
  {
    label: 'Stall',
    items: [
      { key: 'stall:default', label: 'Default', screen: 'stall-default', scopes: VSA_ONLY },
      { key: 'stall:complete', label: 'Complete', screen: 'stall-complete', scopes: VSA_ONLY },
      { key: 'stall:missing', label: 'Missing Image', screen: 'stall-missing', scopes: VSA_ONLY },
      {
        key: 'stall:issue-reported',
        label: 'Issue Reported',
        screen: 'stall-issue-reported',
        scopes: VSA_ONLY,
      },
    ],
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
  loginPreview: 'device' | 'browser' | null
  runtimeMode: 'browser' | 'hertz-device'
}): string {
  if (input.showLogin) {
    if (input.loginPreview === 'browser') return 'page-login-browser'
    if (input.loginPreview === 'device') return 'page-login-device'
    return input.runtimeMode === 'hertz-device'
      ? 'page-login-device'
      : 'page-login-browser'
  }

  if (input.view === 'tracking') return 'page-tracking'
  if (input.view === 'transport') return 'page-transport'
  if (input.view === 'vsa') return 'page-vsa'

  return input.runtimeMode === 'hertz-device'
    ? 'page-home-device'
    : 'page-home-browser'
}

export function resolveActiveWidgetKey(
  view: WorkflowView,
  screen: ScreenId,
): string | null {
  const matches = WIDGET_STATE_ITEMS.filter(
    (item) => item.screen === screen && item.scopes.includes(view),
  )
  return matches[0]?.key ?? null
}
