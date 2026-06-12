import { useCallback, useState } from 'react'
import { isStallOccupied } from '../utils/movement'
import type {
  FlowContext,
  FuelStep,
  FuelTransaction,
  MovementMode,
  MovementPhase,
  ScreenId,
  StallPhase,
} from '../types/flow'

function buildFuelTransaction(prev: FlowContext): FuelTransaction {
  return {
    pump: prev.pumpNumber || '8',
    gallons: prev.fuelGallons || prev.fuelGallonsDispensed || '5',
    status: 'complete',
  }
}

function isManualFueling(ctx: Pick<FlowContext, 'unlockMode' | 'locationType'>) {
  return ctx.unlockMode === 'on-site' || ctx.locationType === 'non-gasboy'
}

function formatFuelFinalTime(startedAt: number | null): string {
  if (!startedAt) return '00:00:00'
  const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function manualFuelingScreen(
  suffix:
    | 'pump-unlocked'
    | 'pump-verified'
    | 'fueling-in-progress'
    | 'fueling-complete'
    | 'missing-info'
    | 'missing-filled',
  ctx: Pick<FlowContext, 'unlockMode' | 'locationType'>,
): ScreenId {
  if (ctx.unlockMode === 'on-site') {
    const map: Record<typeof suffix, ScreenId> = {
      'pump-unlocked': 'on-site-pump-unlocked',
      'pump-verified': 'on-site-pump-verified',
      'fueling-in-progress': 'on-site-fueling-in-progress',
      'fueling-complete': 'on-site-fueling-complete',
      'missing-info': 'on-site-missing-info',
      'missing-filled': 'on-site-missing-filled',
    }
    return map[suffix]
  }
  const map: Record<typeof suffix, ScreenId> = {
    'pump-unlocked': 'non-gasboy-pump-unlocked',
    'pump-verified': 'non-gasboy-pump-verified',
    'fueling-in-progress': 'non-gasboy-fueling-in-progress',
    'fueling-complete': 'non-gasboy-fueling-complete',
    'missing-info': 'non-gasboy-missing-info',
    'missing-filled': 'non-gasboy-missing-filled',
  }
  return map[suffix]
}

function appendFuelTransaction(prev: FlowContext): FuelTransaction[] {
  const entry = buildFuelTransaction(prev)
  if (prev.isAdditionalFueling && prev.fuelTransactions.length > 0) {
    return [...prev.fuelTransactions, entry]
  }
  return [entry]
}

function markLastCompleteAsIssue(transactions: FuelTransaction[]): FuelTransaction[] {
  const updated = [...transactions]
  for (let i = updated.length - 1; i >= 0; i -= 1) {
    if (updated[i].status === 'complete') {
      updated[i] = { ...updated[i], status: 'issue' }
      return updated
    }
  }
  return updated
}

function movementIsComplete(phase: MovementPhase): boolean {
  return (
    phase === 'location-selected' ||
    phase === 'stall-selected' ||
    phase === 'stall-issue-reported'
  )
}

function stallSectionIsComplete(phase: StallPhase): boolean {
  return phase === 'stall-selected' || phase === 'stall-issue-reported'
}

const INITIAL_CONTEXT: FlowContext = {
  screen: 'fueling-default',
  movementComplete: true,
  movementMode: 'transport',
  movementPhase: 'location-selected',
  location: 'Albany AP QTA',
  stallNumber: '',
  stallPhase: 'select-stall',
  stallSectionNumber: '',
  fuelComplete: false,
  stallComplete: false,
  cleaningComplete: false,
  cleaningStep: 'verify-pump',
  cleaningPumpNumber: '',
  cleaningStartedAt: null,
  cleaningFinalTime: '',
  fuelStep: 'verify-pump',
  pumpNumber: '',
  fuelGallons: '',
  fuelGallonsDispensed: '5',
  fuelFinalTime: '',
  fuelStartedAt: null,
  isAdditionalFueling: false,
  fuelTransactions: [],
  unavailablePumps: [3, 6],
  showIssueOverlay: false,
  issueDetails: '',
  issueReportSource: null,
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
    pumpNumber: '',
    fuelGallons: '',
    fuelStartedAt: null,
    isAdditionalFueling: false,
    fuelTransactions: [],
    showIssueOverlay: false,
    issueDetails: '',
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
    movementComplete: true,
    movementMode: 'transport',
    movementPhase: 'location-selected',
    location: 'Albany AP QTA',
    cleaningComplete: false,
    cleaningStep: 'verify-pump',
    cleaningPumpNumber: '',
    cleaningStartedAt: null,
    cleaningFinalTime: '',
    fuelComplete: false,
    fuelStep: 'verify-pump',
    pumpNumber: '',
    fuelGallons: '',
    fuelStartedAt: null,
    isAdditionalFueling: false,
    fuelTransactions: [],
    stallPhase: 'select-stall',
    stallSectionNumber: '',
    stallComplete: false,
    showIssueOverlay: false,
    issueDetails: '',
  },
  'stall-complete': {
    movementComplete: true,
    movementMode: 'transport',
    movementPhase: 'location-selected',
    location: 'Albany AP QTA',
    fuelComplete: true,
    stallPhase: 'stall-selected',
    stallSectionNumber: '5',
    stallComplete: true,
    fuelStep: 'fueling-complete',
    showIssueOverlay: false,
  },
  'stall-missing': {
    movementComplete: true,
    movementMode: 'transport',
    movementPhase: 'location-selected',
    location: 'Albany AP QTA',
    fuelComplete: true,
    stallPhase: 'stall-verify',
    stallSectionNumber: '5',
    stallComplete: false,
    fuelStep: 'fueling-complete',
    showIssueOverlay: false,
  },
  'stall-issue-reported': {
    movementComplete: true,
    movementMode: 'transport',
    movementPhase: 'location-selected',
    location: 'Albany AP QTA',
    fuelComplete: true,
    stallPhase: 'stall-issue-reported',
    stallSectionNumber: '5',
    stallComplete: true,
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
    pumpNumber: '8',
    fuelGallonsDispensed: '5',
    fuelTransactions: [{ pump: '8', gallons: '5', status: 'complete' }],
    showIssueOverlay: false,
  },
  'fueling-additional': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'verify-pump',
    pumpNumber: '',
    isAdditionalFueling: true,
    fuelTransactions: [{ pump: '8', gallons: '5', status: 'issue' }],
    showIssueOverlay: false,
  },
  'fueling-additional-complete': {
    movementComplete: true,
    fuelComplete: true,
    fuelStep: 'additional-fueling-complete',
    pumpNumber: '12',
    fuelGallonsDispensed: '3',
    isAdditionalFueling: true,
    fuelTransactions: [
      { pump: '8', gallons: '5', status: 'issue' },
      { pump: '12', gallons: '3', status: 'complete' },
    ],
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
    fuelStartedAt: Date.now() - 74_000,
    fuelGallons: '',
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
    fuelComplete: false,
    fuelStep: 'fueling-complete-missing',
    pumpNumber: '8',
    fuelGallons: '',
    fuelGallonsDispensed: '',
    fuelFinalTime: '00:01:14',
    stallComplete: false,
    unlockMode: 'on-site',
    locationType: 'gasboy',
    showIssueOverlay: false,
  },
  'on-site-missing-filled': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'fueling-complete-missing',
    pumpNumber: '8',
    fuelGallons: '5',
    fuelGallonsDispensed: '',
    fuelFinalTime: '00:01:14',
    stallComplete: false,
    unlockMode: 'on-site',
    locationType: 'gasboy',
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
    fuelStartedAt: Date.now() - 74_000,
    fuelGallons: '',
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
    fuelComplete: false,
    fuelStep: 'fueling-complete-missing',
    pumpNumber: '8',
    fuelGallons: '',
    fuelGallonsDispensed: '',
    fuelFinalTime: '00:01:14',
    stallComplete: false,
    locationType: 'non-gasboy',
    showIssueOverlay: false,
  },
  'non-gasboy-missing-filled': {
    movementComplete: true,
    fuelComplete: false,
    fuelStep: 'fueling-complete-missing',
    pumpNumber: '8',
    fuelGallons: '5',
    fuelGallonsDispensed: '',
    fuelFinalTime: '00:01:14',
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
    const isUnavailablePump = (pump: string, unavailablePumps: number[]) =>
      unavailablePumps.includes(Number(pump))

    setContext((prev) => {
      switch (action) {
        case 'scan-complete':
          return {
            ...prev,
            unlockMode: 'remote',
            fuelStep: 'unlocking-pump',
            pumpNumber: '5',
            screen: 'fueling-unlocking',
          }
        case 'manual-entry':
          return {
            ...prev,
            fuelStep: 'manual-entry',
            pumpNumber: '',
            screen: 'fueling-manual-entry',
          }
        case 'back-to-scan':
          return {
            ...prev,
            fuelStep: 'verify-pump',
            pumpNumber: '',
            screen: 'fueling-default',
          }
        case 'pump-change': {
          const pump = payload ?? ''
          if (isManualFueling(prev) && prev.fuelStep === 'verify-pump') {
            return {
              ...prev,
              pumpNumber: pump,
              fuelStep: 'verify-pump',
            }
          }
          if (!pump) {
            return {
              ...prev,
              pumpNumber: '',
              fuelStep: 'manual-entry',
            }
          }
          return {
            ...prev,
            pumpNumber: pump,
            fuelStep: 'manual-entry-filled',
          }
        }
        case 'clear-pump':
          if (isManualFueling(prev) && prev.fuelStep === 'verify-pump') {
            return {
              ...prev,
              pumpNumber: '',
              fuelStep: 'verify-pump',
            }
          }
          return {
            ...prev,
            pumpNumber: '',
            fuelStep: 'manual-entry',
          }
        case 'on-site-unlock':
          return {
            ...prev,
            unlockMode: 'on-site',
            fuelStep: 'fueling-in-progress',
            pumpNumber: prev.pumpNumber || '5',
            fuelStartedAt: Date.now(),
            fuelGallons: '',
            screen: 'on-site-fueling-in-progress',
          }
        case 'unlock-pump': {
          if (prev.fuelStep === 'manual-entry-error') return prev
          const pump = prev.pumpNumber.trim()
          const verifyingManualPump =
            isManualFueling(prev) &&
            (prev.fuelStep === 'verify-pump' ||
              prev.fuelStep === 'manual-entry' ||
              prev.fuelStep === 'manual-entry-filled')

          if (verifyingManualPump || prev.fuelStep === 'manual-entry' || prev.fuelStep === 'manual-entry-filled') {
            if (!pump || isUnavailablePump(pump, prev.unavailablePumps)) {
              return {
                ...prev,
                fuelStep: isManualFueling(prev) ? 'verify-pump' : 'manual-entry-error',
                pumpNumber: pump,
              }
            }
          }

          if (verifyingManualPump) {
            return {
              ...prev,
              fuelStep: 'pump-unlocked',
              pumpNumber: pump,
              screen: manualFuelingScreen('pump-unlocked', prev),
            }
          }

          return {
            ...prev,
            unlockMode: 'remote',
            fuelStep: 'unlocking-pump',
            pumpNumber: pump || prev.pumpNumber || '5',
            screen: 'fueling-unlocking',
          }
        }
        case 'cancel-unlock':
          return {
            ...prev,
            unlockMode: 'remote',
            fuelStep: 'verify-pump',
            pumpNumber: '',
            screen: 'fueling-default',
          }
        case 'start-fueling':
          return {
            ...prev,
            fuelStep: 'fueling-in-progress',
            fuelStartedAt: Date.now(),
            fuelGallons: '',
            screen: isManualFueling(prev)
              ? manualFuelingScreen('fueling-in-progress', prev)
              : 'fueling-in-progress',
          }
        case 'gallons-change': {
          const gallons = payload ?? ''
          if (prev.fuelStep === 'fueling-complete-missing') {
            return {
              ...prev,
              fuelGallons: gallons,
              screen: gallons.trim()
                ? manualFuelingScreen('missing-filled', prev)
                : manualFuelingScreen('missing-info', prev),
            }
          }
          return {
            ...prev,
            fuelGallons: gallons,
          }
        }
        case 'finish-fueling': {
          if (
            isManualFueling(prev) &&
            !prev.isAdditionalFueling &&
            !prev.fuelGallons.trim()
          ) {
            return {
              ...prev,
              fuelStep: 'fueling-complete-missing',
              fuelComplete: false,
              fuelGallonsDispensed: '',
              fuelFinalTime: formatFuelFinalTime(prev.fuelStartedAt),
              screen: manualFuelingScreen('missing-info', prev),
            }
          }

          const completeStep = prev.isAdditionalFueling
            ? 'additional-fueling-complete'
            : 'fueling-complete'
          const completeScreen = prev.isAdditionalFueling
            ? 'fueling-additional-complete'
            : isManualFueling(prev)
              ? manualFuelingScreen('fueling-complete', prev)
              : 'fueling-complete'
          return {
            ...prev,
            fuelStep: completeStep,
            fuelComplete: true,
            fuelGallonsDispensed: prev.fuelGallons || prev.fuelGallonsDispensed,
            fuelFinalTime:
              prev.fuelFinalTime || formatFuelFinalTime(prev.fuelStartedAt),
            fuelTransactions: appendFuelTransaction(prev),
            screen: completeScreen,
          }
        }
        case 'submit-missing-gallons': {
          if (!prev.fuelGallons.trim()) return prev
          return {
            ...prev,
            fuelStep: 'fueling-complete',
            fuelComplete: true,
            fuelGallonsDispensed: prev.fuelGallons,
            fuelTransactions: appendFuelTransaction(prev),
            screen: manualFuelingScreen('fueling-complete', prev),
          }
        }
        case 'report-issue':
          return {
            ...prev,
            showIssueOverlay: true,
            issueReportSource: payload === 'fuel' ? 'fuel' : 'header',
          }
        case 'close-issue':
          return {
            ...prev,
            showIssueOverlay: false,
            issueReportSource: null,
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
        case 'submit-issue': {
          const transactions =
            prev.fuelTransactions.length > 0
              ? markLastCompleteAsIssue(prev.fuelTransactions)
              : [
                  {
                    pump: prev.pumpNumber || '8',
                    gallons: prev.fuelGallonsDispensed || '5',
                    status: 'issue' as const,
                  },
                ]
          return {
            ...prev,
            showIssueOverlay: false,
            issueReportSource: null,
            isAdditionalFueling: true,
            fuelTransactions: transactions,
            fuelComplete: false,
            fuelStep: 'verify-pump',
            pumpNumber: '',
            fuelGallons: '',
            fuelStartedAt: null,
            unlockMode: 'remote',
            screen: 'fueling-additional',
          }
        }
        case 'retry':
          return {
            ...prev,
            unlockMode: 'remote',
            fuelStep: 'verify-pump',
            pumpNumber: '',
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
            fuelStep: 'fueling-in-progress',
            fuelStartedAt: Date.now(),
            screen: 'fueling-in-progress',
          }
        })
      }, 1500)

      setTimeout(() => {
        setContext((prev) => {
          if (prev.fuelStep !== 'fueling-in-progress' || prev.unlockMode !== 'remote') {
            return prev
          }
          const completeStep = prev.isAdditionalFueling
            ? 'additional-fueling-complete'
            : 'fueling-complete'
          const completeScreen = prev.isAdditionalFueling
            ? 'fueling-additional-complete'
            : 'fueling-complete'
          const gallons = prev.fuelGallons || prev.fuelGallonsDispensed || '5'
          return {
            ...prev,
            fuelStep: completeStep,
            fuelComplete: true,
            fuelGallonsDispensed: gallons,
            fuelTransactions: appendFuelTransaction(prev),
            screen: completeScreen,
          }
        })
      }, 5000)
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

  const handleCleaningAction = useCallback((action: string, payload?: string) => {
    setContext((prev) => {
      const isUnavailablePump = (pump: string) =>
        prev.unavailablePumps.includes(Number(pump))

      switch (action) {
        case 'scan-complete':
          return {
            ...prev,
            cleaningStep: 'pump-verified',
            cleaningPumpNumber: '5',
            cleaningComplete: false,
          }
        case 'manual-entry':
          return {
            ...prev,
            cleaningStep: 'manual-entry',
            cleaningPumpNumber: '',
            cleaningComplete: false,
          }
        case 'back-to-scan':
          return {
            ...prev,
            cleaningStep: 'verify-pump',
            cleaningPumpNumber: '',
            cleaningComplete: false,
          }
        case 'pump-change': {
          const pump = payload ?? ''
          if (!pump) {
            return {
              ...prev,
              cleaningPumpNumber: '',
              cleaningStep: 'manual-entry',
            }
          }
          return {
            ...prev,
            cleaningPumpNumber: pump,
            cleaningStep: 'manual-entry-filled',
          }
        }
        case 'clear-pump':
          return {
            ...prev,
            cleaningPumpNumber: '',
            cleaningStep: 'manual-entry',
          }
        case 'verify-pump': {
          const pump = prev.cleaningPumpNumber.trim()
          if (!pump || isUnavailablePump(pump)) {
            return {
              ...prev,
              cleaningStep: 'manual-entry-error',
              cleaningPumpNumber: pump,
            }
          }
          return {
            ...prev,
            cleaningStep: 'pump-verified',
            cleaningPumpNumber: pump,
          }
        }
        case 'wrong-pump':
          return {
            ...prev,
            cleaningStep: 'verify-pump',
            cleaningPumpNumber: '',
            cleaningComplete: false,
          }
        case 'start-cleaning':
          return {
            ...prev,
            cleaningStep: 'cleaning-in-progress',
            cleaningStartedAt: Date.now(),
            cleaningComplete: false,
          }
        case 'finish-cleaning': {
          const elapsed = prev.cleaningStartedAt
            ? Math.floor((Date.now() - prev.cleaningStartedAt) / 1000)
            : 74
          const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0')
          const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
          const seconds = String(elapsed % 60).padStart(2, '0')
          return {
            ...prev,
            cleaningStep: 'cleaning-complete',
            cleaningComplete: true,
            cleaningFinalTime: `${hours}:${minutes}:${seconds}`,
          }
        }
        case 'continue-cleaning':
          return {
            ...prev,
            cleaningStep: 'cleaning-in-progress',
            cleaningComplete: false,
            cleaningStartedAt: prev.cleaningStartedAt ?? Date.now(),
          }
        default:
          return prev
      }
    })
  }, [])

  const handleStallAction = useCallback((action: string, payload?: string) => {
    setContext((prev) => {
      switch (action) {
        case 'stall-select': {
          const stall = payload ?? ''
          const phase = isStallOccupied(stall) ? 'stall-verify' : 'stall-selected'
          return {
            ...prev,
            stallPhase: phase,
            stallSectionNumber: stall,
            stallComplete: stallSectionIsComplete(phase),
            screen:
              phase === 'stall-verify'
                ? 'stall-missing'
                : phase === 'stall-selected'
                  ? 'stall-complete'
                  : 'stall-default',
          }
        }
        case 'stall-clear':
          return {
            ...prev,
            stallPhase: 'select-stall',
            stallSectionNumber: '',
            stallComplete: false,
          }
        case 'take-photo':
          return {
            ...prev,
            stallPhase: 'stall-issue-reported',
            stallComplete: true,
            screen: 'stall-issue-reported',
          }
        case 'retake-photo':
          return {
            ...prev,
            stallPhase: 'stall-verify',
            stallComplete: false,
            screen: 'stall-missing',
          }
        default:
          return prev
      }
    })
  }, [])

  return {
    context,
    goToScreen,
    updateFuelStep,
    handleAction,
    handleMovementAction,
    handleStallAction,
    handleCleaningAction,
  }
}
