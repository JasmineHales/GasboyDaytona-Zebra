import { useCallback, useState } from 'react'
import { isStallOccupied } from '../utils/movement'
import type { FlowContext, FuelStep, MovementMode, MovementPhase, ScreenId } from '../types/flow'

function movementIsComplete(phase: MovementPhase): boolean {
  return (
    phase === 'location-selected' ||
    phase === 'stall-selected' ||
    phase === 'stall-issue-reported'
  )
}

const INITIAL_CONTEXT: FlowContext = {
  screen: 'fueling-default',
  movementComplete: true,
  movementMode: 'transport',
  movementPhase: 'location-selected',
  location: 'Albany AP QTA',
  stallNumber: '',
  fuelComplete: false,
  stallComplete: false,
  fuelStep: 'verify-pump',
  pumpNumber: '',
  unavailablePumps: [3, 6],
  showIssueOverlay: false,
  issueDetails: '',
  unlockMode: 'remote',
  locationType: 'gasboy',
}

const SCREEN_PRESETS: Record<ScreenId, Partial<FlowContext>> = {
  'transport-default': {
    movementComplete: false,
    movementMode: 'transport',
    movementPhase: 'select-location',
    location: '',
    stallNumber: '',
    fuelComplete: false,
    stallComplete: false,
    fuelStep: 'verify-pump',
    showIssueOverlay: false,
  },
  'transport-complete': {
    movementComplete: true,
    movementMode: 'transport',
    movementPhase: 'location-selected',
    location: 'Albany AP QTA',
    stallNumber: '',
    fuelComplete: true,
    stallComplete: true,
    fuelStep: 'fueling-complete',
    showIssueOverlay: false,
  },
  'movement-transport-complete': {
    movementComplete: true,
    movementMode: 'transport',
    movementPhase: 'location-selected',
    location: 'Albany AP QTA',
    stallNumber: '',
    fuelComplete: false,
    stallComplete: false,
    fuelStep: 'verify-pump',
    showIssueOverlay: false,
  },
  'movement-stall-complete': {
    movementComplete: true,
    movementMode: 'stall',
    movementPhase: 'stall-selected',
    location: '',
    stallNumber: '5',
    fuelComplete: false,
    stallComplete: false,
    fuelStep: 'verify-pump',
    showIssueOverlay: false,
  },
  'movement-stall-issue-reported': {
    movementComplete: true,
    movementMode: 'stall',
    movementPhase: 'stall-issue-reported',
    location: '',
    stallNumber: '5',
    fuelComplete: false,
    stallComplete: false,
    fuelStep: 'verify-pump',
    showIssueOverlay: false,
  },
  'stall-default': {
    movementComplete: false,
    movementMode: 'stall',
    movementPhase: 'select-stall',
    location: '',
    stallNumber: '',
    fuelComplete: true,
    stallComplete: false,
    fuelStep: 'fueling-complete',
    showIssueOverlay: false,
  },
  'stall-complete': {
    movementComplete: true,
    movementMode: 'stall',
    movementPhase: 'stall-selected',
    location: '',
    stallNumber: '7',
    fuelComplete: true,
    stallComplete: true,
    fuelStep: 'fueling-complete',
    showIssueOverlay: false,
  },
  'stall-missing': {
    movementComplete: false,
    movementMode: 'stall',
    movementPhase: 'stall-verify',
    location: '',
    stallNumber: '5',
    fuelComplete: true,
    stallComplete: false,
    fuelStep: 'fueling-complete',
    showIssueOverlay: false,
  },
  'fueling-default': {
    movementComplete: true,
    movementMode: 'transport',
    movementPhase: 'location-selected',
    location: 'Albany AP QTA',
    stallNumber: '',
    fuelComplete: false,
    stallComplete: false,
    fuelStep: 'verify-pump',
    unlockMode: 'remote',
    locationType: 'gasboy',
    showIssueOverlay: false,
  },
  'fueling-unlocking': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'unlocking-pump',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-scanner': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'verify-pump',
    showIssueOverlay: false,
  },
  'fueling-manual-entry': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'manual-entry',
    pumpNumber: '',
    showIssueOverlay: false,
  },
  'fueling-pump-unlocked': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'pump-unlocked',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-in-progress': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'fueling-in-progress',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-complete': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-additional': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'additional-fueling',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-additional-complete': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'additional-fueling-complete',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-pump-unavailable': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'pump-unavailable',
    showIssueOverlay: false,
  },
  'fueling-connection-lost': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'connection-lost',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-no-response': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'no-response',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-pump-timeout': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'pump-timeout',
    pumpNumber: '12',
    showIssueOverlay: false,
  },
  'fueling-issue': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '12',
    showIssueOverlay: true,
    issueDetails: '',
  },
  'fueling-issue-details': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '12',
    showIssueOverlay: true,
    issueDetails: '',
  },
  'on-site-pump-unlocked': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'pump-unlocked',
    pumpNumber: '8',
    unlockMode: 'on-site',
    locationType: 'gasboy',
    showIssueOverlay: false,
  },
  'on-site-pump-verified': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'verify-pump',
    pumpNumber: '8',
    unlockMode: 'on-site',
    locationType: 'gasboy',
    showIssueOverlay: false,
  },
  'on-site-fueling-in-progress': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'fueling-in-progress',
    pumpNumber: '8',
    unlockMode: 'on-site',
    showIssueOverlay: false,
  },
  'on-site-fueling-complete': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '8',
    unlockMode: 'on-site',
    showIssueOverlay: false,
  },
  'on-site-missing-info': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '8',
    stallComplete: false,
    unlockMode: 'on-site',
    showIssueOverlay: false,
  },
  'on-site-missing-filled': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '8',
    stallComplete: false,
    unlockMode: 'on-site',
    showIssueOverlay: false,
  },
  'non-gasboy-pump-unlocked': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'pump-unlocked',
    pumpNumber: '4',
    locationType: 'non-gasboy',
    showIssueOverlay: false,
  },
  'non-gasboy-pump-verified': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'verify-pump',
    pumpNumber: '4',
    locationType: 'non-gasboy',
    showIssueOverlay: false,
  },
  'non-gasboy-fueling-in-progress': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'fueling-in-progress',
    pumpNumber: '4',
    locationType: 'non-gasboy',
    showIssueOverlay: false,
  },
  'non-gasboy-fueling-complete': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '4',
    locationType: 'non-gasboy',
    showIssueOverlay: false,
  },
  'non-gasboy-missing-info': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '4',
    stallComplete: false,
    locationType: 'non-gasboy',
    showIssueOverlay: false,
  },
  'non-gasboy-missing-filled': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'fueling-complete',
    pumpNumber: '4',
    stallComplete: false,
    locationType: 'non-gasboy',
    showIssueOverlay: false,
  },
}

function withScreen(screen: ScreenId): FlowContext {
  return {
    ...INITIAL_CONTEXT,
    ...SCREEN_PRESETS[screen],
    screen,
  }
}

export function useFlow() {
  const [context, setContext] = useState<FlowContext>(withScreen('fueling-default'))

  const goToScreen = useCallback((screen: ScreenId) => {
    setContext(withScreen(screen))
  }, [])

  const updateFuelStep = useCallback((fuelStep: FuelStep, extra?: Partial<FlowContext>) => {
    setContext((prev) => ({
      ...prev,
      fuelStep,
      ...extra,
    }))
  }, [])

  const handleAction = useCallback((action: string, payload?: string) => {
    setContext((prev) => {
      switch (action) {
        case 'scan-complete':
          return {
            ...prev,
            fuelStep: 'unlocking-pump',
            pumpNumber: '12',
            screen: 'fueling-unlocking',
          }
        case 'manual-entry':
          return {
            ...prev,
            fuelStep: 'manual-entry',
            screen: 'fueling-manual-entry',
          }
        case 'on-site-unlock':
          return {
            ...prev,
            unlockMode: 'on-site',
            fuelStep: 'pump-unlocked',
            pumpNumber: '8',
            screen: 'on-site-pump-unlocked',
          }
        case 'unlock-pump':
          if (prev.fuelStep === 'manual-entry' || prev.fuelStep === 'manual-entry-filled') {
            return {
              ...prev,
              fuelStep: 'unlocking-pump',
              pumpNumber: prev.pumpNumber || '12',
              screen: 'fueling-unlocking',
            }
          }
          if (prev.fuelStep === 'pump-unlocked') {
            return {
              ...prev,
              fuelStep: 'fueling-in-progress',
              screen: 'fueling-in-progress',
            }
          }
          return {
            ...prev,
            fuelStep: 'unlocking-pump',
            pumpNumber: prev.pumpNumber || '12',
            screen: 'fueling-unlocking',
          }
        case 'start-fueling':
          return {
            ...prev,
            fuelStep: 'fueling-in-progress',
            screen: 'fueling-in-progress',
          }
        case 'report-issue':
          return {
            ...prev,
            showIssueOverlay: true,
            screen: 'fueling-issue',
          }
        case 'close-issue':
          return {
            ...prev,
            showIssueOverlay: false,
            screen: 'fueling-complete',
          }
        case 'select-issue':
          return {
            ...prev,
            showIssueOverlay: true,
            screen: 'fueling-issue-details',
            issueDetails: payload ?? '',
          }
        case 'issue-details':
          return {
            ...prev,
            issueDetails: payload ?? '',
          }
        case 'submit-issue':
          return {
            ...prev,
            showIssueOverlay: false,
            screen: 'fueling-complete',
          }
        case 'additional-fueling':
          return {
            ...prev,
            fuelStep: 'additional-fueling',
            fuelComplete: false,
            screen: 'fueling-additional',
          }
        case 'retry':
          return {
            ...prev,
            fuelStep: 'verify-pump',
            screen: 'fueling-default',
          }
        case 'complete':
          if (prev.fuelComplete && !prev.stallComplete) {
            return { ...prev, stallComplete: true, screen: 'stall-complete' }
          }
          return prev
        default:
          return prev
      }
    })

    if (action === 'unlock-pump' || action === 'scan-complete') {
      setTimeout(() => {
        setContext((prev) => {
          if (prev.fuelStep !== 'unlocking-pump') return prev
          return {
            ...prev,
            fuelStep: 'pump-unlocked',
            screen: 'fueling-pump-unlocked',
          }
        })
      }, 1500)
    }

    if (action === 'unlock-pump') {
      setTimeout(() => {
        setContext((prev) => {
          if (prev.fuelStep !== 'fueling-in-progress') return prev
          return {
            ...prev,
            fuelStep: 'fueling-complete',
            fuelComplete: true,
            screen: 'fueling-complete',
          }
        })
      }, 3500)
    }
  }, [])

  const handleMovementAction = useCallback((action: string, payload?: string) => {
    setContext((prev) => {
      switch (action) {
        case 'mode-change': {
          const mode = payload as MovementMode
          if (mode === 'transport') {
            const phase = prev.location ? 'location-selected' : 'select-location'
            return {
              ...prev,
              movementMode: mode,
              movementPhase: phase,
              movementComplete: movementIsComplete(phase),
            }
          }
          const phase =
            prev.movementPhase === 'stall-issue-reported'
              ? 'stall-issue-reported'
              : prev.movementPhase === 'stall-verify'
                ? 'stall-verify'
                : prev.stallNumber
                  ? isStallOccupied(prev.stallNumber)
                    ? 'stall-verify'
                    : 'stall-selected'
                  : 'select-stall'
          return {
            ...prev,
            movementMode: mode,
            movementPhase: phase,
            movementComplete: movementIsComplete(phase),
          }
        }
        case 'location-select':
          return {
            ...prev,
            movementMode: 'transport',
            movementPhase: 'location-selected',
            location: payload ?? '',
            movementComplete: true,
          }
        case 'location-clear':
          return {
            ...prev,
            movementPhase: 'select-location',
            location: '',
            movementComplete: false,
          }
        case 'stall-select': {
          const stall = payload ?? ''
          const phase = isStallOccupied(stall) ? 'stall-verify' : 'stall-selected'
          return {
            ...prev,
            movementMode: 'stall',
            movementPhase: phase,
            stallNumber: stall,
            movementComplete: movementIsComplete(phase),
          }
        }
        case 'stall-clear':
          return {
            ...prev,
            movementPhase: 'select-stall',
            stallNumber: '',
            movementComplete: false,
          }
        case 'take-photo':
          return {
            ...prev,
            movementPhase: 'stall-issue-reported',
            movementComplete: true,
          }
        case 'retake-photo':
          return {
            ...prev,
            movementPhase: 'stall-verify',
            movementComplete: false,
          }
        default:
          return prev
      }
    })
  }, [])

  return { context, goToScreen, updateFuelStep, handleAction, handleMovementAction }
}
