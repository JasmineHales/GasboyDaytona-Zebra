export type TutorialPlacement = 'top' | 'bottom' | 'center'

export type TutorialStep = {
  id: string
  title: string
  body: string
  target?: string
  placement?: TutorialPlacement
  /** On mobile, keep the tooltip card at the top so lower targets stay visible. */
  mobileCard?: 'top' | 'sheet'
  openHeaderMenu?: boolean
  /** Expands a workflow accordion section before spotlighting it. */
  expandSection?: 'movement' | 'fuel' | 'cleaning' | 'stall'
  /** Renders an inline UI preview when the live target is context-dependent. */
  preview?: 'stall-photo'
}

export const HOME_TUTORIAL_STORAGE_KEY = 'remote-off.tutorial.home.v1'
export const TRANSPORT_TUTORIAL_STORAGE_KEY = 'remote-off.tutorial.transport.v1'
export const VSA_TUTORIAL_STORAGE_KEY = 'remote-off.tutorial.vsa.v1'
export const TRACKING_TUTORIAL_STORAGE_KEY = 'remote-off.tutorial.tracking.v1'

export const HOME_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Daytona',
    body: 'This quick tour covers the essentials on the home screen. Each workflow also has its own tour the first time you open it.',
    placement: 'center',
  },
  {
    id: 'header-menu',
    title: 'App menu',
    target: '[data-tutorial="header-menu"]',
    body: 'Tap the menu for session options like reporting issues and signing out.',
    placement: 'bottom',
  },
  {
    id: 'report-issue',
    title: 'Report an issue',
    target: '[data-tutorial="header-report-issue"]',
    openHeaderMenu: true,
    body: 'Use Report Issue any time something goes wrong during a workflow — pump problems, stall conflicts, or other blockers.',
    placement: 'bottom',
  },
  {
    id: 'sign-out',
    title: 'Sign out',
    target: '[data-tutorial="header-sign-out"]',
    openHeaderMenu: true,
    body: 'Sign out when you finish your shift. You can replay this home tour from the menu at any time.',
    placement: 'bottom',
  },
  {
    id: 'workflows',
    title: 'Choose a workflow',
    target: '[data-tutorial="workflows"]',
    body: 'VSA, Transport, and Click Tracking each open a dedicated screen. A separate guided tour runs the first time you enter each one.',
    placement: 'top',
  },
  {
    id: 'done',
    title: 'You\'re all set',
    body: 'Pick a workflow to begin. Open the menu later if you want to replay this tour.',
    placement: 'center',
  },
]

export const TRANSPORT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Transport workflow',
    body: 'This tour walks through movement, stall photos, and fueling for transport jobs.',
    placement: 'center',
  },
  {
    id: 'vehicle',
    title: 'Check your vehicle',
    target: '[data-tutorial="vehicle"]',
    body: 'Confirm the unit, class, and hold warnings. Odometer mileage is shown on this card.',
    placement: 'bottom',
  },
  {
    id: 'odometer',
    title: 'Odometer reading',
    target: '[data-tutorial="vehicle-odometer"]',
    body: 'Trusted mileage is prefilled automatically. If data is out of date or unavailable, enter the current reading here before completing.',
    placement: 'bottom',
  },
  {
    id: 'movement',
    title: 'Log movement first',
    target: '[data-tutorial="movement"]',
    expandSection: 'movement',
    body: 'Record a transport location or stall number. Complete movement before fueling unlocks.',
    placement: 'bottom',
    mobileCard: 'top',
  },
  {
    id: 'stall-photo',
    title: 'Report stall issues with a photo',
    preview: 'stall-photo',
    body: 'If a stall looks occupied but should be available, tap Take Photo. Your camera opens to capture the stall and surroundings.',
    placement: 'center',
  },
  {
    id: 'fuel',
    title: 'Fuel the vehicle',
    target: '[data-tutorial="fuel"]',
    expandSection: 'fuel',
    body: 'Unlock the pump, scan or enter the pump number, and finish fueling.',
    placement: 'top',
    mobileCard: 'top',
  },
  {
    id: 'complete',
    title: 'Finish the session',
    target: '[data-tutorial="complete"]',
    body: 'When every section is complete, tap Complete to close out this transport workflow.',
    placement: 'top',
    mobileCard: 'top',
  },
  {
    id: 'done',
    title: 'Transport tour complete',
    body: 'Replay this tour from the menu if you need a refresher.',
    placement: 'center',
  },
]

export const VSA_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'VSA workflow',
    body: 'This tour covers cleaning, fuel, and stall steps for vehicle service advisor jobs.',
    placement: 'center',
  },
  {
    id: 'vehicle',
    title: 'Check your vehicle',
    target: '[data-tutorial="vehicle"]',
    body: 'Review the assigned vehicle and odometer mileage before starting service.',
    placement: 'bottom',
  },
  {
    id: 'odometer',
    title: 'Odometer reading',
    target: '[data-tutorial="vehicle-odometer"]',
    body: 'Verified mileage is captured automatically. Enter the current reading if prompted before you complete the workflow.',
    placement: 'bottom',
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    target: '[data-tutorial="cleaning"]',
    expandSection: 'cleaning',
    body: 'Verify the pump, start cleaning, and mark the section complete when finished.',
    placement: 'bottom',
    mobileCard: 'top',
  },
  {
    id: 'fuel',
    title: 'Fuel',
    target: '[data-tutorial="fuel"]',
    expandSection: 'fuel',
    body: 'Scan or enter the pump, unlock remotely or on-site, and record fueling.',
    placement: 'bottom',
    mobileCard: 'top',
  },
  {
    id: 'stall',
    title: 'Stall',
    target: '[data-tutorial="stall"]',
    expandSection: 'stall',
    body: 'Stall stays locked until fueling or cleaning is complete. Once unlocked, assign a stall number and report occupancy issues with a photo if needed.',
    placement: 'top',
    mobileCard: 'top',
  },
  {
    id: 'complete',
    title: 'Finish the session',
    target: '[data-tutorial="complete"]',
    body: 'Tap Complete when cleaning, fuel, and stall sections are done.',
    placement: 'top',
    mobileCard: 'top',
  },
  {
    id: 'done',
    title: 'VSA tour complete',
    body: 'Replay this tour from the menu if you need a refresher.',
    placement: 'center',
  },
]

export const TRACKING_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Click Tracking',
    body: 'This screen shows every tracked tap in your session — useful for QA and analytics review.',
    placement: 'center',
  },
  {
    id: 'filter',
    title: 'Filter events',
    target: '[data-tutorial="tracking-filter"]',
    body: 'Search by tag, view, or screen name to find specific interactions quickly.',
    placement: 'bottom',
  },
  {
    id: 'tags',
    title: 'Top tags summary',
    target: '[data-tutorial="tracking-tags"]',
    body: 'See which actions happen most often during this session.',
    placement: 'bottom',
  },
  {
    id: 'log',
    title: 'Live event log',
    target: '[data-tutorial="tracking-log"]',
    body: 'Events appear here in real time as you tap buttons across the app.',
    placement: 'top',
  },
  {
    id: 'actions',
    title: 'Export or clear',
    target: '[data-tutorial="tracking-actions"]',
    body: 'Export a JSON log for sharing, or clear the session log to start fresh.',
    placement: 'bottom',
  },
  {
    id: 'done',
    title: 'Tracking tour complete',
    body: 'Go back and use the app — new clicks will show up here automatically.',
    placement: 'center',
  },
]

export type TutorialConfig = {
  storageKey: string
  steps: TutorialStep[]
  trackPrefix: string
}

export const TRANSPORT_TUTORIAL: TutorialConfig = {
  storageKey: TRANSPORT_TUTORIAL_STORAGE_KEY,
  steps: TRANSPORT_TUTORIAL_STEPS,
  trackPrefix: 'transport.tutorial',
}

export const VSA_TUTORIAL: TutorialConfig = {
  storageKey: VSA_TUTORIAL_STORAGE_KEY,
  steps: VSA_TUTORIAL_STEPS,
  trackPrefix: 'vsa.tutorial',
}

export const TRACKING_TUTORIAL: TutorialConfig = {
  storageKey: TRACKING_TUTORIAL_STORAGE_KEY,
  steps: TRACKING_TUTORIAL_STEPS,
  trackPrefix: 'tracking.tutorial',
}

export type TutorialForceTarget = 'home' | 'transport' | 'vsa' | 'tracking' | 'all'

const TUTORIAL_FORCE_PENDING_KEY = 'remote-off.tutorial.pending-force'

function isTutorialForceTarget(value: string | null): value is TutorialForceTarget {
  return (
    value === 'home' ||
    value === 'transport' ||
    value === 'vsa' ||
    value === 'tracking' ||
    value === 'all'
  )
}

function stripTutorialForceParamFromUrl() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('tutorial')) return
  url.searchParams.delete('tutorial')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export function consumeTutorialForceParam(): TutorialForceTarget | null {
  const fromUrl = new URLSearchParams(window.location.search).get('tutorial')

  if (isTutorialForceTarget(fromUrl)) {
    try {
      sessionStorage.setItem(TUTORIAL_FORCE_PENDING_KEY, fromUrl)
    } catch {
      // ignore
    }
    stripTutorialForceParamFromUrl()
    return fromUrl
  }

  try {
    const pending = sessionStorage.getItem(TUTORIAL_FORCE_PENDING_KEY)
    if (isTutorialForceTarget(pending)) {
      return pending
    }
  } catch {
    // ignore
  }

  return null
}

export function clearPendingTutorialForceParam() {
  try {
    sessionStorage.removeItem(TUTORIAL_FORCE_PENDING_KEY)
  } catch {
    // ignore
  }
}

export function clearAllTutorialCompletions() {
  for (const key of [
    HOME_TUTORIAL_STORAGE_KEY,
    TRANSPORT_TUTORIAL_STORAGE_KEY,
    VSA_TUTORIAL_STORAGE_KEY,
    TRACKING_TUTORIAL_STORAGE_KEY,
  ]) {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }
}

export function shouldForceTutorial(
  target: TutorialForceTarget | null,
  scope: TutorialForceTarget,
): boolean {
  if (!target) return false
  return target === scope || target === 'all'
}
