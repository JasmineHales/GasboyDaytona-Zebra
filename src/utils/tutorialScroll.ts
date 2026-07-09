const MOBILE_MAX_WIDTH = 768
const EDGE_PADDING = 16
const DEFAULT_HEADER_CLEARANCE = 56
const PIN_TOP_GAP = 8
const PIN_TOP_NUDGE = 20

export type SpotlightRect = {
  top: number
  left: number
  width: number
  height: number
}

export function getTutorialPortalRoot(): HTMLElement {
  return (
    document.getElementById('app-overlay-root') ??
    (document.querySelector('.app-shell') as HTMLElement | null) ??
    document.body
  )
}

export function measureTutorialTarget(selector?: string): SpotlightRect | null {
  if (!selector) return null
  const element = document.querySelector(selector)
  if (!element) return null
  const rect = element.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null

  const portalRoot = getTutorialPortalRoot()
  if (portalRoot === document.body) {
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    }
  }

  const rootRect = portalRoot.getBoundingClientRect()
  return {
    top: rect.top - rootRect.top,
    left: rect.left - rootRect.left,
    width: rect.width,
    height: rect.height,
  }
}

export function scheduleSpotlightMeasure(
  selector: string | undefined,
  onMeasure: (rect: SpotlightRect | null) => void,
  delays = [0, 120, 280, 480, 750, 1000],
) {
  const timeouts = delays.map((delay) =>
    window.setTimeout(() => {
      onMeasure(measureTutorialTarget(selector))
    }, delay),
  )
  return () => {
    for (const timeoutId of timeouts) {
      window.clearTimeout(timeoutId)
    }
  }
}

function getTopTutorialCardBottom(): number | null {
  const card = document.querySelector('.tutorial-card--top')
  if (!card) return null
  const bottom = card.getBoundingClientRect().bottom
  return bottom > 0 ? bottom : null
}

export function isMobileTutorialViewport() {
  const portalRoot = getTutorialPortalRoot()
  if (portalRoot !== document.body) {
    return portalRoot.getBoundingClientRect().width <= MOBILE_MAX_WIDTH
  }
  return (window.visualViewport?.width ?? window.innerWidth) <= MOBILE_MAX_WIDTH
}

export function getTutorialViewport() {
  const portalRoot = getTutorialPortalRoot()
  if (portalRoot !== document.body) {
    const rect = portalRoot.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height,
      offsetTop: 0,
      offsetLeft: 0,
    }
  }

  const visual = window.visualViewport
  return {
    width: visual?.width ?? window.innerWidth,
    height: visual?.height ?? window.innerHeight,
    offsetTop: visual?.offsetTop ?? 0,
    offsetLeft: visual?.offsetLeft ?? 0,
  }
}

export function findScrollParent(element: Element): HTMLElement | null {
  let node = element.parentElement

  while (node) {
    const style = window.getComputedStyle(node)
    const overflowY = style.overflowY
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }
    node = node.parentElement
  }

  return (document.querySelector('.app-scroll') as HTMLElement | null) ?? null
}

type ScrollTargetOptions = {
  reservedBottom?: number
  reservedTop?: number
  pinTop?: boolean
  pinTargetTop?: number
}

export function scrollTargetForTutorial(
  element: Element,
  {
    reservedBottom = 0,
    reservedTop = DEFAULT_HEADER_CLEARANCE,
    pinTop = false,
    pinTargetTop,
  }: ScrollTargetOptions,
) {
  const viewport = getTutorialViewport()
  const visibleTop = viewport.offsetTop + reservedTop + EDGE_PADDING
  const visibleBottom =
    viewport.offsetTop + viewport.height - reservedBottom - EDGE_PADDING
  const visibleHeight = Math.max(160, visibleBottom - visibleTop)

  const scrollParent = findScrollParent(element)
  if (!scrollParent) return

  if (pinTop) {
    const cardBottom = pinTargetTop ?? getTopTutorialCardBottom()
    const targetTop =
      cardBottom != null
        ? cardBottom + PIN_TOP_GAP - PIN_TOP_NUDGE
        : visibleTop + PIN_TOP_GAP

    const delta = element.getBoundingClientRect().top - targetTop
    if (Math.abs(delta) >= 2) {
      scrollParent.scrollTop += delta
    }
    return
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const rect = element.getBoundingClientRect()
    const fitsFully = rect.height <= visibleHeight

    if (fitsFully && rect.top >= visibleTop && rect.bottom <= visibleBottom) {
      break
    }

    let delta = 0
    if (!fitsFully || rect.top < visibleTop) {
      delta = rect.top - visibleTop - EDGE_PADDING
    } else if (rect.bottom > visibleBottom) {
      delta = rect.bottom - visibleBottom + EDGE_PADDING
    }

    if (Math.abs(delta) < 2) break

    scrollParent.scrollTop += delta
  }
}

export function scheduleTutorialScroll(
  element: Element,
  options: ScrollTargetOptions,
  delays = [0, 120, 280, 480, 750, 1050, 1400, 1800, 2200],
) {
  for (const delay of delays) {
    window.setTimeout(() => {
      scrollTargetForTutorial(element, options)
    }, delay)
  }
}

const HEADER_TARGET_MAX_BOTTOM = 160
const TALL_TARGET_HEIGHT = 120

export function resolveTutorialTopCard(
  step: {
    mobileCard?: 'top' | 'sheet'
    openHeaderMenu?: boolean
    openLocationPicker?: boolean
  },
  spotlight: { top: number; height: number },
  sheetHeight: number,
): boolean {
  if (step.mobileCard === 'top') return true
  if (step.mobileCard === 'sheet' || step.openHeaderMenu || step.openLocationPicker) return false
  return shouldUseTopTutorialCard(spotlight, sheetHeight)
}

export function shouldUseTopTutorialCard(
  spotlight: { top: number; height: number },
  sheetHeight: number,
) {
  if (!isMobileTutorialViewport()) return false

  const spotlightBottom = spotlight.top + spotlight.height
  if (spotlightBottom <= HEADER_TARGET_MAX_BOTTOM) {
    return false
  }

  const viewport = getTutorialViewport()
  const minGap = EDGE_PADDING * 2
  const visibleBottom = viewport.height - sheetHeight - minGap

  // Tall targets (e.g. workflow list): judge by where they start, not their full height.
  const anchorTop =
    spotlight.height > TALL_TARGET_HEIGHT ? spotlight.top : spotlight.top + spotlight.height

  return anchorTop > visibleBottom || spotlight.top > visibleBottom * 0.55
}

export function estimateMobileSheetHeight(hasPreview: boolean) {
  return hasPreview ? 320 : 240
}

export function estimateMobileTopCardHeight(hasPreview: boolean) {
  return hasPreview ? 340 : 320
}
