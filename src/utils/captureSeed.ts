import type { FlowContext, WorkflowSection } from '../types/flow'
import type { WorkflowView } from './flowNavigation'
import type { VehicleSearchDevStateId } from './vehicleSearchDevStates'

export const CAPTURE_SEED_KEY = 'remote-off.capture.v1'
export const CAPTURE_UI_KEY = 'remote-off.capture.ui'

export type CaptureHomeTab =
  | 'work'
  | 'history'
  | 'performance'
  | 'challenges'
  | 'recognition'
  | 'team'

export type CaptureUiFlags = {
  showScanner?: boolean
  scannerTarget?: 'fuel' | 'cleaning'
  expandedSection?: WorkflowSection
}

export type CaptureSeed = {
  page: 'login' | 'setup' | 'home' | 'tracking' | 'workflow'
  homeTab?: CaptureHomeTab
  activeView?: WorkflowView | null
  acknowledgedSections?: WorkflowSection[]
  context?: FlowContext
  contextPatch?: Partial<FlowContext>
  vehicleSearch?: {
    workflow: WorkflowView
    devState: VehicleSearchDevStateId
  }
  ui?: CaptureUiFlags
}

export function readCaptureSeed(): CaptureSeed | null {
  try {
    const raw = sessionStorage.getItem(CAPTURE_SEED_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CaptureSeed
  } catch {
    return null
  }
}

export function readCaptureUiFlags(): CaptureUiFlags | null {
  try {
    const raw = sessionStorage.getItem(CAPTURE_UI_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CaptureUiFlags
  } catch {
    return null
  }
}

export function clearCaptureSeed(): void {
  try {
    sessionStorage.removeItem(CAPTURE_SEED_KEY)
    sessionStorage.removeItem(CAPTURE_UI_KEY)
  } catch {
    // ignore
  }
}

export function writeCaptureSeed(seed: CaptureSeed): void {
  sessionStorage.setItem(CAPTURE_SEED_KEY, JSON.stringify(seed))
  if (seed.ui) {
    sessionStorage.setItem(CAPTURE_UI_KEY, JSON.stringify(seed.ui))
  } else {
    sessionStorage.removeItem(CAPTURE_UI_KEY)
  }
}

export function consumeCaptureSeed(): CaptureSeed | null {
  if (cachedCaptureSeed === undefined) {
    cachedCaptureSeed = readCaptureSeed()
    if (cachedCaptureSeed) clearCaptureSeed()
  }
  return cachedCaptureSeed
}

let cachedCaptureSeed: CaptureSeed | null | undefined
