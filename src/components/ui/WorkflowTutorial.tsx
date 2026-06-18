import { AlertTriangle, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useOverlayFocus } from '../../hooks/useOverlayFocus'
import type { TutorialPlacement, TutorialStep } from '../../utils/tutorialSteps'
import {
  estimateMobileSheetHeight,
  estimateMobileTopCardHeight,
  findScrollParent,
  getTutorialViewport,
  isMobileTutorialViewport,
  scheduleTutorialScroll,
  scrollTargetForTutorial,
  shouldUseTopTutorialCard,
} from '../../utils/tutorialScroll'
import { trackProps } from '../../utils/tracking'
import { WorkflowNotice } from './WorkflowNotice'

type SpotlightRect = {
  top: number
  left: number
  width: number
  height: number
}

type CardLayout = {
  className: string
  style: CSSProperties
}

type WorkflowTutorialProps = {
  open: boolean
  step: TutorialStep | null
  stepIndex: number
  stepCount: number
  isFirst: boolean
  isLast: boolean
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  trackPrefix?: string
  trackView?: string
  trackScreen?: string
}

const EDGE_PADDING = 16
const DEFAULT_HEADER_CLEARANCE = 56

function measureTarget(selector?: string): SpotlightRect | null {
  if (!selector) return null
  const element = document.querySelector(selector)
  if (!element) return null
  const rect = element.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function StallPhotoPreview() {
  return (
    <WorkflowNotice
      variant="warning"
      title="Stall appears occupied"
      description="Take a photo to report the issue."
      icon={<AlertTriangle className="h-4 w-4" />}
      footer={
        <button
          type="button"
          className="fleet-btn fleet-btn-lg fleet-btn-contained-warning fleet-btn-elevated w-full"
          aria-hidden
          tabIndex={-1}
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </button>
      }
    />
  )
}

function centeredLayout(): CardLayout {
  return {
    className: 'tutorial-card--center',
    style: {},
  }
}

function mobileSheetLayout(): CardLayout {
  return {
    className: 'tutorial-card--sheet',
    style: {},
  }
}

function mobileTopLayout(): CardLayout {
  return {
    className: 'tutorial-card--top',
    style: {},
  }
}

function computeSpotlightLayout(
  spotlight: SpotlightRect,
  placement: TutorialPlacement | undefined,
  cardHeight: number,
  useTopCard: boolean,
): CardLayout {
  if (isMobileTutorialViewport()) {
    return useTopCard ? mobileTopLayout() : mobileSheetLayout()
  }

  const viewport = getTutorialViewport()
  const cardWidth = Math.min(320, viewport.width - EDGE_PADDING * 2)
  const spotlightBottom = spotlight.top + spotlight.height
  const spaceBelow = viewport.height - spotlightBottom - EDGE_PADDING
  const spaceAbove = spotlight.top - EDGE_PADDING

  let placeBelow = placement !== 'top'
  if (placeBelow && spaceBelow < cardHeight && spaceAbove > spaceBelow) {
    placeBelow = false
  } else if (!placeBelow && spaceAbove < cardHeight && spaceBelow > spaceAbove) {
    placeBelow = true
  }

  if (spaceBelow < cardHeight * 0.75 && spaceAbove < cardHeight * 0.75) {
    return mobileSheetLayout()
  }

  const cardLeft = Math.min(
    Math.max(
      EDGE_PADDING + viewport.offsetLeft,
      spotlight.left + spotlight.width / 2 - cardWidth / 2 + viewport.offsetLeft,
    ),
    viewport.offsetLeft + viewport.width - cardWidth - EDGE_PADDING,
  )

  if (placeBelow) {
    const maxTop =
      viewport.offsetTop + viewport.height - cardHeight - EDGE_PADDING
    const top = Math.min(
      maxTop,
      Math.max(
        viewport.offsetTop + EDGE_PADDING,
        spotlightBottom + EDGE_PADDING + viewport.offsetTop,
      ),
    )
    return {
      className: '',
      style: { top, left: cardLeft, width: cardWidth },
    }
  }

  const top = Math.max(
    viewport.offsetTop + EDGE_PADDING,
    spotlight.top - cardHeight - EDGE_PADDING + viewport.offsetTop,
  )
  return {
    className: '',
    style: { top, left: cardLeft, width: cardWidth },
  }
}

export function WorkflowTutorial({
  open,
  step,
  stepIndex,
  stepCount,
  isFirst,
  isLast,
  onNext,
  onBack,
  onSkip,
  trackPrefix = 'tutorial',
  trackView,
  trackScreen,
}: WorkflowTutorialProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const focusTrapRef = useOverlayFocus(open, onSkip)
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const [cardLayout, setCardLayout] = useState<CardLayout>(centeredLayout())
  const [reservedBottom, setReservedBottom] = useState(0)
  const [reservedTop, setReservedTop] = useState(0)
  const [useTopCard, setUseTopCard] = useState(false)

  const trackStepMeta = {
    step: step?.id ?? '',
    index: String(stepIndex),
  }

  const getScrollOptions = useCallback(
    (topCard: boolean, cardHeight: number) => ({
      reservedBottom:
        isMobileTutorialViewport() && !topCard ? cardHeight + EDGE_PADDING : 0,
      reservedTop: topCard
        ? cardHeight + EDGE_PADDING
        : isMobileTutorialViewport()
          ? DEFAULT_HEADER_CLEARANCE
          : 56,
      pinTop: topCard,
    }),
    [],
  )

  const scrollToTarget = useCallback(
    (selector: string | undefined, topCard: boolean, cardHeight: number) => {
      if (!selector) return
      const element = document.querySelector(selector)
      if (!element) return

      const pinElement =
        element.querySelector('[data-workflow-section-header]') ?? element
      const cardBottom =
        topCard && cardRef.current
          ? cardRef.current.getBoundingClientRect().bottom
          : undefined
      const options = {
        ...getScrollOptions(topCard, cardHeight),
        pinTargetTop: cardBottom,
      }
      scheduleTutorialScroll(pinElement, options)

      if (topCard) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            const nextBottom = cardRef.current?.getBoundingClientRect().bottom
            scrollTargetForTutorial(pinElement, {
              ...options,
              pinTargetTop: nextBottom,
            })
          })
        })
      }
    },
    [getScrollOptions],
  )

  const updateSpotlight = useCallback(() => {
    if (!open || !step?.target || step.placement === 'center') {
      setSpotlight(null)
      return
    }

    const measure = () => {
      const element = document.querySelector(step.target!)
      if (!element) {
        setSpotlight(null)
        return
      }

      const topCard =
        step.mobileCard === 'top' ||
        (step.mobileCard !== 'sheet' &&
          shouldUseTopTutorialCard(
            measureTarget(step.target) ?? { top: 0, height: 0, left: 0, width: 0 },
            estimateMobileSheetHeight(step.preview === 'stall-photo'),
          ))
      const cardHeight = topCard
        ? cardRef.current?.offsetHeight ?? estimateMobileTopCardHeight(step.preview === 'stall-photo')
        : cardRef.current?.offsetHeight ?? estimateMobileSheetHeight(step.preview === 'stall-photo')

      scrollToTarget(step.target, topCard, cardHeight)

      window.requestAnimationFrame(() => {
        setSpotlight(measureTarget(step.target))
      })
    }

    const delay = step.openHeaderMenu ? 200 : step.expandSection ? 420 : 120
    window.setTimeout(measure, delay)
  }, [open, scrollToTarget, step])

  useEffect(() => {
    updateSpotlight()
  }, [updateSpotlight])

  useEffect(() => {
    if (!open) return

    const handleLayoutChange = () => updateSpotlight()
    window.addEventListener('resize', handleLayoutChange)
    window.addEventListener('scroll', handleLayoutChange, true)
    window.visualViewport?.addEventListener('resize', handleLayoutChange)
    window.visualViewport?.addEventListener('scroll', handleLayoutChange)

    return () => {
      window.removeEventListener('resize', handleLayoutChange)
      window.removeEventListener('scroll', handleLayoutChange, true)
      window.visualViewport?.removeEventListener('resize', handleLayoutChange)
      window.visualViewport?.removeEventListener('scroll', handleLayoutChange)
    }
  }, [open, updateSpotlight])

  useLayoutEffect(() => {
    if (!open || !step) return

    if (step.placement === 'center' || !spotlight) {
      setCardLayout(centeredLayout())
      setReservedBottom(0)
      setReservedTop(0)
      setUseTopCard(false)
      return
    }

    const cardHeight =
      cardRef.current?.offsetHeight ??
      estimateMobileTopCardHeight(step.preview === 'stall-photo')
    const nextUseTopCard =
      step.mobileCard === 'top' ||
      (step.mobileCard !== 'sheet' && shouldUseTopTutorialCard(spotlight, cardHeight))

    setUseTopCard(nextUseTopCard)
    setCardLayout(computeSpotlightLayout(spotlight, step.placement, cardHeight, nextUseTopCard))

    const measuredCardHeight = cardRef.current?.offsetHeight ?? cardHeight
    const bottomReserve =
      isMobileTutorialViewport() && !nextUseTopCard
        ? measuredCardHeight + EDGE_PADDING
        : 0
    const topReserve =
      nextUseTopCard ? measuredCardHeight + EDGE_PADDING : 0

    setReservedBottom(bottomReserve)
    setReservedTop(topReserve)

    if (!nextUseTopCard) {
      scrollToTarget(step.target, false, measuredCardHeight)
    }

    window.requestAnimationFrame(() => {
      setSpotlight(measureTarget(step.target))
    })
  }, [open, scrollToTarget, step, spotlight, stepIndex])

  useEffect(() => {
    if (!open || !step?.target || step.placement === 'center' || !useTopCard) return

    const cardHeight =
      cardRef.current?.offsetHeight ??
      estimateMobileTopCardHeight(step.preview === 'stall-photo')

    const scrollAfterLayout = () => {
      scrollToTarget(step.target, true, cardHeight)
    }

    const timeoutId = window.setTimeout(scrollAfterLayout, 0)
    return () => window.clearTimeout(timeoutId)
  }, [open, scrollToTarget, step, stepIndex, useTopCard])

  useEffect(() => {
    document.documentElement.classList.toggle('tutorial-active', open)
    document.documentElement.classList.toggle('tutorial-active--top-card', open && useTopCard)
    return () => {
      document.documentElement.classList.remove('tutorial-active')
      document.documentElement.classList.remove('tutorial-active--top-card')
    }
  }, [open, useTopCard])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const scrollParent =
      findScrollParent(document.querySelector(step?.target ?? '.app-scroll') ?? document.body) ??
      (document.querySelector('.app-scroll') as HTMLElement | null)

    if (!scrollParent) return

    if (reservedBottom > 0) {
      scrollParent.style.scrollPaddingBottom = `${reservedBottom}px`
    }
    if (reservedTop > 0) {
      scrollParent.style.scrollPaddingTop = `${reservedTop}px`
    }

    return () => {
      scrollParent.style.scrollPaddingBottom = ''
      scrollParent.style.scrollPaddingTop = ''
    }
  }, [open, reservedBottom, reservedTop, step?.target])

  if (!open || !step) return null

  const isCentered = step.placement === 'center' || !spotlight
  const padding = 8
  const spotlightStyle = spotlight
    ? {
        top: spotlight.top - padding,
        left: spotlight.left - padding,
        width: spotlight.width + padding * 2,
        height: spotlight.height + padding * 2,
      }
    : null

  const layout = isCentered ? centeredLayout() : cardLayout

  return createPortal(
    <div
      className="tutorial-overlay"
      role="presentation"
      data-current-view={trackView}
      data-current-screen={trackScreen}
    >
      <div
        className={`tutorial-overlay__scrim${isCentered ? ' tutorial-overlay__scrim--full' : ''}`}
        onClick={onSkip}
        {...trackProps(`${trackPrefix}.dismiss-scrim`, trackStepMeta)}
      />

      {spotlightStyle && (
        <div
          className="tutorial-spotlight"
          style={spotlightStyle}
          aria-hidden
        />
      )}

      <div
        ref={(node) => {
          cardRef.current = node
          focusTrapRef.current = node
        }}
        className={`tutorial-card ${layout.className}`.trim()}
        style={layout.style}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-body"
      >
        <div className="tutorial-card__content">
          <div className="tutorial-card__progress" aria-hidden>
            {Array.from({ length: stepCount }, (_, index) => (
              <span
                key={index}
                className={`tutorial-card__dot${index === stepIndex ? ' tutorial-card__dot--active' : index < stepIndex ? ' tutorial-card__dot--done' : ''}`}
              />
            ))}
          </div>

          <p className="tutorial-card__eyebrow">
            Step {stepIndex + 1} of {stepCount}
          </p>
          <h2 id="tutorial-title" className="tutorial-card__title">
            {step.title}
          </h2>
          <p id="tutorial-body" className="tutorial-card__body">
            {step.body}
          </p>

          {step.preview === 'stall-photo' && <StallPhotoPreview />}
        </div>

        <div className="tutorial-card__actions">
          {!isFirst && (
            <button
              type="button"
              onClick={onBack}
              className="tutorial-card__back"
              {...trackProps(`${trackPrefix}.back`, trackStepMeta)}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onSkip}
            className="tutorial-card__skip"
            {...trackProps(`${trackPrefix}.skip`, trackStepMeta)}
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={onNext}
            className="fleet-btn fleet-btn-md fleet-btn-contained-info tutorial-card__next"
            {...trackProps(`${trackPrefix}.${isLast ? 'finish' : 'next'}`, trackStepMeta)}
          >
            {isLast ? 'Get started' : 'Next'}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
