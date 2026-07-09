import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import {
  loadPersistedWorkflow,
  savePersistedWorkflow,
} from '../utils/workflowPersistence'
import { onTutorialWorkflowRestore } from '../utils/tutorialMode'
import { isTutorialModeActive } from '../utils/tutorialModeState'
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
import type { GallonsCaptureRecord } from '../types/gallonsCapture'
import {
  buildFlowContextForScreen,
  mergeScreenPreset,
} from '../utils/screenPresets'
import {
  movementPhaseAfterModeChange,
  resolveCleaningScreen,
  resolveMovementScreen,
  resolveStallScreen,
} from '../utils/flowScreenSync'
import { getSessionStartAt } from './useSessionElapsed'

function confirmCleaningStall(prev: FlowContext, pump: string): FlowContext {
  return {
    ...prev,
    cleaningPumpNumber: pump,
    cleaningStep: 'cleaning-complete',
    cleaningStartedAt: getSessionStartAt(),
    cleaningComplete: true,
  }
}

function fuelTransactionTime(prev: FlowContext): string {
  return formatFuelFinalTime(prev.fuelStartedAt) || prev.fuelFinalTime.trim() || '--'
}

function buildFuelTransaction(prev: FlowContext): FuelTransaction {
  return {
    pump: prev.pumpNumber || '8',
    gallons: prev.fuelGallons || prev.fuelGallonsDispensed || '5',
    status: 'complete',
    time: fuelTransactionTime(prev),
  }
}

function isFuelCompleteStep(step: FuelStep): boolean {
  return step === 'fueling-complete' || step === 'additional-fueling-complete'
}

function applyRemoteGallonSync(prev: FlowContext, gallons: string): FlowContext {
  const pump = prev.pumpNumber || '8'
  const last =
    prev.fuelTransactions.length > 0
      ? prev.fuelTransactions[prev.fuelTransactions.length - 1]
      : undefined
  const syncedEntry: FuelTransaction = {
    pump,
    gallons,
    status: 'complete',
    time:
      last?.pump === pump && last.time?.trim()
        ? last.time
        : fuelTransactionTime(prev),
  }

  let fuelTransactions: FuelTransaction[]
  if (prev.fuelTransactions.length > 0) {
    const lastIndex = prev.fuelTransactions.length - 1
    const lastEntry = prev.fuelTransactions[lastIndex]!
    if (lastEntry.pump === pump && !lastEntry.gallons.trim()) {
      fuelTransactions = [
        ...prev.fuelTransactions.slice(0, lastIndex),
        syncedEntry,
      ]
    } else {
      fuelTransactions = prev.isAdditionalFueling
        ? [...prev.fuelTransactions, syncedEntry]
        : [syncedEntry]
    }
  } else {
    fuelTransactions = [syncedEntry]
  }

  return {
    ...prev,
    fuelGallonsPending: false,
    fuelGallonsDispensed: gallons,
    fuelTransactions,
  }
}

function isManualFueling(ctx: Pick<FlowContext, 'unlockMode' | 'locationType'>) {
  return ctx.unlockMode === 'on-site' || ctx.locationType === 'non-gasboy'
}

function isRemoteGasboy(ctx: Pick<FlowContext, 'unlockMode' | 'locationType'>) {
  return ctx.locationType === 'gasboy' && ctx.unlockMode === 'remote'
}

function resetRemoteFuelTelemetry(
  ctx: FlowContext,
  patch: Partial<FlowContext> = {},
): FlowContext {
  return {
    ...ctx,
    ...patch,
    fuelPumpStatusReceived: false,
    fuelNozzleReturned: false,
  }
}

function canCompleteRemoteFueling(ctx: FlowContext): boolean {
  return (
    isRemoteGasboy(ctx) &&
    (ctx.fuelStep === 'fueling-in-progress' || ctx.fuelStep === 'pump-unlocked')
  )
}

function buildPendingFuelTransaction(
  prev: FlowContext,
): FuelTransaction {
  return {
    pump: prev.pumpNumber || '8',
    gallons: '',
    status: 'complete',
    time: fuelTransactionTime(prev),
  }
}

function mergePendingFuelTransaction(
  prev: FlowContext,
  entry: FuelTransaction,
): FuelTransaction[] {
  if (!prev.isAdditionalFueling || prev.fuelTransactions.length === 0) {
    return [entry]
  }

  const lastIndex = prev.fuelTransactions.length - 1
  const last = prev.fuelTransactions[lastIndex]

  if (last.status === 'issue' && !last.gallons.trim()) {
    return [...prev.fuelTransactions.slice(0, lastIndex), entry]
  }

  if (last.pump === entry.pump && !last.gallons.trim()) {
    return [...prev.fuelTransactions.slice(0, lastIndex), entry]
  }

  return [...prev.fuelTransactions, entry]
}

function completeRemoteWithPendingGallons(prev: FlowContext): FlowContext {
  const completeStep = prev.isAdditionalFueling
    ? 'additional-fueling-complete'
    : 'fueling-complete'
  const completeScreen = prev.isAdditionalFueling
    ? 'fueling-additional-complete'
    : 'fueling-complete'
  const pendingEntry = buildPendingFuelTransaction(prev)

  return {
    ...prev,
    fuelNozzleReturned: true,
    fuelStep: completeStep,
    fuelComplete: true,
    fuelGallonsPending: true,
    fuelGallons: '',
    fuelGallonsDispensed: '',
    fuelFinalTime: formatFuelFinalTime(prev.fuelStartedAt),
    fuelTransactions: mergePendingFuelTransaction(prev, pendingEntry),
    screen: completeScreen,
  }
}

function applyRemoteFuelingComplete(prev: FlowContext): FlowContext {
  if (!canCompleteRemoteFueling(prev)) return prev
  return completeRemoteWithPendingGallons(prev)
}

function scheduleRemoteGallonSync(setContext: Dispatch<SetStateAction<FlowContext>>) {
  if (isTutorialModeActive()) return

  window.setTimeout(() => {
    setContext((prev) => {
      if (!prev.fuelGallonsPending || !isFuelCompleteStep(prev.fuelStep)) {
        return prev
      }
      if (!isRemoteGasboy(prev)) return prev
      const gallons = prev.fuelSimGallons || prev.fuelGallons || prev.fuelGallonsDispensed || '5'
      return applyRemoteGallonSync(prev, gallons)
    })
  }, 6000)
}

let remoteFuelTelemetryToken = 0

function scheduleRemoteFuelTelemetryForContext(
  ctx: FlowContext,
  setContext: Dispatch<SetStateAction<FlowContext>>,
) {
  if (isTutorialModeActive()) return
  if (!isRemoteGasboy(ctx) || ctx.fuelSimManualCompleteOnly) return

  const token = ++remoteFuelTelemetryToken
  const pumpStatusMs = ctx.fuelSimPumpStatusDelayMs ?? 4_000
  const pumpStopMs = ctx.fuelSimPumpStopDelayMs
  const completeMs = ctx.fuelSimAutoCompleteMs ?? 16_000
  const defaultGallons = ctx.fuelSimGallons ?? '5'

  window.setTimeout(() => {
    if (token !== remoteFuelTelemetryToken) return
    setContext((current) => {
      if (current.fuelStep !== 'fueling-in-progress' || !isRemoteGasboy(current)) {
        return current
      }
      return { ...current, fuelPumpStatusReceived: true }
    })
  }, pumpStatusMs)

  if (pumpStopMs != null) {
    window.setTimeout(() => {
      if (token !== remoteFuelTelemetryToken) return
      setContext((current) => {
        if (current.fuelStep !== 'fueling-in-progress' || !isRemoteGasboy(current)) {
          return current
        }
        if (!current.fuelPumpStatusReceived) return current
        const gallons = current.fuelSimPumpStopGallons ?? '3'
        const completed = completeRemoteWithPendingGallons(current)
        return applyRemoteGallonSync(completed, gallons)
      })
    }, pumpStopMs)
    return
  }

  window.setTimeout(() => {
    if (token !== remoteFuelTelemetryToken) return
    setContext((current) => {
      if (current.fuelStep !== 'fueling-in-progress' || !isRemoteGasboy(current)) {
        return current
      }
      if (!current.fuelPumpStatusReceived) return current
      const completed = completeRemoteWithPendingGallons(current)
      const gallons =
        current.fuelSimGallons ||
        current.fuelGallons ||
        current.fuelGallonsDispensed ||
        defaultGallons
      return applyRemoteGallonSync(completed, gallons)
    })
  }, completeMs)
}

const UNLOCK_SUCCESS_MS = 1500
const UNLOCK_FAIL_MS = 15_000

function scheduleUnlockSimulation(setContext: Dispatch<SetStateAction<FlowContext>>) {
  if (isTutorialModeActive()) return

  window.setTimeout(() => {
    setContext((prev) => {
      if (prev.fuelStep !== 'unlocking-pump') return prev
      const outcome = prev.fuelSimUnlockOutcome ?? 'success'
      if (outcome !== 'success') return prev

      const next = resetRemoteFuelTelemetry(prev, {
        fuelStep: 'fueling-in-progress',
        fuelStartedAt: Date.now(),
        screen: 'fueling-in-progress',
      })
      scheduleRemoteFuelTelemetryForContext(next, setContext)
      return next
    })
  }, UNLOCK_SUCCESS_MS)

  window.setTimeout(() => {
    setContext((prev) => {
      if (prev.fuelStep !== 'unlocking-pump') return prev
      const outcome = prev.fuelSimUnlockOutcome ?? 'no-response'

      if (outcome === 'pump-timeout') {
        return {
          ...prev,
          fuelStep: 'pump-timeout',
          screen: 'fueling-pump-timeout',
        }
      }

      return {
        ...prev,
        fuelStep: 'no-response',
        screen: 'fueling-no-response',
      }
    })
  }, UNLOCK_FAIL_MS)
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
    | 'pump-verified'
    | 'fueling-in-progress'
    | 'fueling-complete'
    | 'missing-info'
    | 'missing-filled',
  ctx: Pick<FlowContext, 'unlockMode' | 'locationType'>,
): ScreenId {
  if (ctx.unlockMode === 'on-site') {
    const map: Record<typeof suffix, ScreenId> = {
      'pump-verified': 'on-site-pump-verified',
      'fueling-in-progress': 'on-site-fueling-in-progress',
      'fueling-complete': 'on-site-fueling-complete',
      'missing-info': 'on-site-missing-info',
      'missing-filled': 'on-site-missing-filled',
    }
    return map[suffix]
  }
  const map: Record<typeof suffix, ScreenId> = {
    'pump-verified': 'non-gasboy-pump-verified',
    'fueling-in-progress': 'non-gasboy-fueling-in-progress',
    'fueling-complete': 'non-gasboy-fueling-complete',
    'missing-info': 'non-gasboy-missing-info',
    'missing-filled': 'non-gasboy-missing-filled',
  }
  return map[suffix]
}

function fuelVerifyScreen(
  ctx: Pick<FlowContext, 'unlockMode' | 'locationType'>,
): ScreenId {
  if (ctx.locationType === 'non-gasboy') return 'non-gasboy-default'
  if (ctx.unlockMode === 'on-site') return 'on-site-default'
  return 'fueling-default'
}

function fuelManualEntryScreen(
  ctx: Pick<FlowContext, 'unlockMode' | 'locationType'>,
): ScreenId {
  if (ctx.locationType === 'non-gasboy') return 'non-gasboy-manual-entry'
  if (ctx.unlockMode === 'on-site') return 'on-site-manual-entry'
  return 'fueling-manual-entry'
}

function appendFuelTransaction(prev: FlowContext): FuelTransaction[] {
  return mergePendingFuelTransaction(prev, buildFuelTransaction(prev))
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

function readInitialContext(): FlowContext {
  const saved = loadPersistedWorkflow()
  return saved?.context ?? buildFlowContextForScreen('fueling-default')
}

export function useFlow() {
  const [context, setContext] = useState<FlowContext>(readInitialContext)

  useEffect(() => {
    if (isTutorialModeActive()) return
    savePersistedWorkflow({ context })
  }, [context])

  useEffect(() => {
    return onTutorialWorkflowRestore((snapshot) => {
      if (snapshot?.context) {
        setContext(snapshot.context)
      }
    })
  }, [])

  const goToScreen = useCallback((screen: ScreenId) => {
    setContext(buildFlowContextForScreen(screen))
  }, [])

  const applyWidgetState = useCallback((screen: ScreenId) => {
    setContext((prev) => mergeScreenPreset(prev, screen))
  }, [])

  const patchDevContext = useCallback((patch: Partial<FlowContext>) => {
    setContext((prev) => ({
      ...prev,
      ...patch,
    }))
  }, [])

  const updateFuelStep = useCallback((fuelStep: FuelStep, extra?: Partial<FlowContext>) => {
    setContext((prev) => ({
      ...prev,
      fuelStep,
      ...extra,
    }))
  }, [])

  const handleAction = useCallback((action: string, payload?: string) => {
    if (isTutorialModeActive()) return

    const isUnavailablePump = (pump: string, unavailablePumps: number[]) =>
      unavailablePumps.includes(Number(pump))

    setContext((prev) => {
      switch (action) {
        case 'scan-complete': {
          const scannedPump = payload?.trim()
          if (isManualFueling(prev)) {
            return {
              ...prev,
              fuelStep: 'pump-verified',
              pumpNumber:
                scannedPump || (prev.locationType === 'non-gasboy' ? '4' : '2'),
              screen: manualFuelingScreen('pump-verified', prev),
            }
          }
          return {
            ...prev,
            unlockMode: 'remote',
            fuelStep: 'unlocking-pump',
            pumpNumber: scannedPump || '5',
            screen: 'fueling-unlocking',
          }
        }
        case 'manual-entry':
          return {
            ...prev,
            fuelStep: 'manual-entry',
            pumpNumber: '',
            screen: fuelManualEntryScreen(prev),
          }
        case 'back-to-scan':
          return {
            ...prev,
            fuelStep: 'verify-pump',
            pumpNumber: '',
            screen: fuelVerifyScreen(prev),
          }
        case 'wrong-pump':
          if (
            prev.fuelStep === 'pump-verified' ||
            prev.fuelStep === 'connection-lost' ||
            prev.fuelStep === 'no-response' ||
            prev.fuelStep === 'pump-timeout'
          ) {
            return {
              ...prev,
              unlockMode: 'remote',
              fuelStep: 'verify-pump',
              pumpNumber: '',
              screen: fuelVerifyScreen(prev),
            }
          }
          return prev
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
        case 'quick-select-pump': {
          const pump = payload ?? ''.trim()
          if (!pump || isUnavailablePump(pump, prev.unavailablePumps)) {
            return {
              ...prev,
              fuelStep: 'manual-entry-error',
              pumpNumber: pump,
            }
          }
          if (isManualFueling(prev)) {
            return {
              ...prev,
              fuelStep: 'fueling-in-progress',
              pumpNumber: pump,
              fuelStartedAt: Date.now(),
              fuelPumpStatusReceived: false,
              fuelGallons: '',
              screen: manualFuelingScreen('fueling-in-progress', prev),
            }
          }
          return resetRemoteFuelTelemetry(prev, {
            unlockMode: 'remote',
            fuelStep: 'unlocking-pump',
            pumpNumber: pump,
            fuelStartedAt: null,
            screen: 'fueling-unlocking',
          })
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
            fuelStep: 'verify-pump',
            pumpNumber: '',
            fuelStartedAt: null,
            fuelGallons: '',
            screen: fuelVerifyScreen({
              unlockMode: 'on-site',
              locationType: prev.locationType,
            }),
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
              fuelStep: 'pump-verified',
              pumpNumber: pump,
              screen: manualFuelingScreen('pump-verified', prev),
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
          return resetRemoteFuelTelemetry(prev, {
            fuelStep: 'fueling-in-progress',
            fuelStartedAt: Date.now(),
            fuelGallons: '',
            screen: isManualFueling(prev)
              ? manualFuelingScreen('fueling-in-progress', prev)
              : 'fueling-in-progress',
          })
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
          const uncertainUnlockStep =
            prev.fuelStep === 'connection-lost' || prev.fuelStep === 'no-response'

          if (uncertainUnlockStep) {
            return completeRemoteWithPendingGallons(prev)
          }

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
            fuelGallonsPending: false,
            fuelGallonsDispensed: prev.fuelGallons || prev.fuelGallonsDispensed,
            fuelFinalTime:
              prev.fuelFinalTime || formatFuelFinalTime(prev.fuelStartedAt),
            fuelTransactions: appendFuelTransaction(prev),
            screen: completeScreen,
          }
        }
        case 'complete-remote-fueling': {
          return applyRemoteFuelingComplete(prev)
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
            issueReportSource:
              payload === 'fuel'
                ? 'fuel'
                : payload === 'vehicle'
                  ? 'vehicle'
                  : 'header',
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
          const pump =
            prev.pumpNumber.trim() ||
            prev.fuelTransactions.at(-1)?.pump ||
            '8'
          const gallons = prev.fuelGallonsDispensed.trim()
          const time = fuelTransactionTime(prev)

          let transactions: FuelTransaction[]
          if (prev.fuelTransactions.length > 0) {
            const lastIndex = prev.fuelTransactions.length - 1
            const last = prev.fuelTransactions[lastIndex]!
            transactions = [
              ...prev.fuelTransactions.slice(0, lastIndex),
              {
                ...last,
                pump,
                gallons: gallons || last.gallons,
                status: 'issue',
                time: time || last.time,
              },
            ]
          } else {
            transactions = [{ pump, gallons, status: 'issue', time }]
          }
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
            screen: 'fueling-additional',
          }
        }
        case 'retry':
          if (
            prev.fuelStep === 'connection-lost' ||
            prev.fuelStep === 'no-response' ||
            prev.fuelStep === 'pump-timeout'
          ) {
            const pump = prev.pumpNumber.trim() || '5'
            return resetRemoteFuelTelemetry(prev, {
              unlockMode: 'remote',
              fuelStep: 'unlocking-pump',
              pumpNumber: pump,
              screen: 'fueling-unlocking',
            })
          }
          return {
            ...prev,
            unlockMode: 'remote',
            fuelStep: 'verify-pump',
            pumpNumber: '',
            screen: 'fueling-default',
          }
        case 'odometer-change':
          return {
            ...prev,
            odometerReading: (payload ?? '').replace(/\D/g, '').slice(0, 7),
          }
        case 'complete':
          return prev
        default:
          return prev
      }
    })

    if (
      action === 'unlock-pump' ||
      action === 'scan-complete' ||
      action === 'retry' ||
      action === 'quick-select-pump'
    ) {
      scheduleUnlockSimulation(setContext)
    }

    if (action === 'complete-remote-fueling' || action === 'finish-fueling') {
      scheduleRemoteGallonSync(setContext)
    }
  }, [])

  const recordGallonsCapture = useCallback((record: GallonsCaptureRecord) => {
    if (isTutorialModeActive()) return

    setContext((prev) => ({
      ...prev,
      fuelGallonsCapture: record,
    }))
  }, [])

  const handleMovementAction = useCallback((action: string, payload?: string) => {
    if (isTutorialModeActive()) return

    setContext((prev) => {
      let next: FlowContext

      switch (action) {
        case 'mode-change': {
          const mode = payload as MovementMode
          const movementPhase = movementPhaseAfterModeChange(mode, prev)
          next = {
            ...prev,
            movementMode: mode,
            movementPhase,
            movementComplete: movementIsComplete(movementPhase),
          }
          break
        }
        case 'location-select':
          next = {
            ...prev,
            movementMode: 'transport',
            movementPhase: 'location-selected',
            location: payload ?? '',
            movementComplete: true,
          }
          break
        case 'location-clear':
          next = {
            ...prev,
            movementPhase: 'select-location',
            location: '',
            movementComplete: false,
          }
          break
        case 'stall-select': {
          const stall = payload ?? ''
          const phase = isStallOccupied(stall) ? 'stall-verify' : 'stall-selected'
          next = {
            ...prev,
            movementMode: 'stall',
            movementPhase: phase,
            stallNumber: stall,
            movementComplete: movementIsComplete(phase),
          }
          break
        }
        case 'stall-clear':
          next = {
            ...prev,
            movementPhase: 'select-stall',
            stallNumber: '',
            movementComplete: false,
          }
          break
        case 'take-photo':
          next = {
            ...prev,
            movementPhase: 'stall-issue-reported',
            movementComplete: true,
          }
          break
        case 'retake-photo':
          next = {
            ...prev,
            movementPhase: 'stall-verify',
            movementComplete: false,
          }
          break
        default:
          return prev
      }

      return {
        ...next,
        screen: resolveMovementScreen(next),
      }
    })
  }, [])

  const handleCleaningAction = useCallback((action: string, payload?: string) => {
    if (isTutorialModeActive()) return

    setContext((prev) => {
      const isUnavailablePump = (pump: string) =>
        prev.unavailablePumps.includes(Number(pump))

      let next: FlowContext

      switch (action) {
        case 'scan-complete':
          next = confirmCleaningStall(prev, payload?.trim() || '5')
          break
        case 'manual-entry':
          next = {
            ...prev,
            cleaningStep: 'manual-entry',
            cleaningPumpNumber: '',
            cleaningComplete: false,
          }
          break
        case 'back-to-scan':
          next = {
            ...prev,
            cleaningStep: 'verify-pump',
            cleaningPumpNumber: '',
            cleaningComplete: false,
          }
          break
        case 'pump-change': {
          const pump = payload ?? ''
          if (!pump) {
            next = {
              ...prev,
              cleaningPumpNumber: '',
              cleaningStep: 'manual-entry',
            }
          } else {
            next = {
              ...prev,
              cleaningPumpNumber: pump,
              cleaningStep: isUnavailablePump(pump)
                ? 'manual-entry-error'
                : 'manual-entry-filled',
            }
          }
          break
        }
        case 'quick-select-pump': {
          const pump = payload ?? ''.trim()
          if (!pump || isUnavailablePump(pump)) {
            next = {
              ...prev,
              cleaningStep: 'manual-entry-error',
              cleaningPumpNumber: pump,
            }
          } else {
            next = confirmCleaningStall(prev, pump)
          }
          break
        }
        case 'clear-pump':
          next = {
            ...prev,
            cleaningPumpNumber: '',
            cleaningStep: 'verify-pump',
            cleaningComplete: false,
            cleaningStartedAt: null,
          }
          break
        case 'verify-pump': {
          const pump = prev.cleaningPumpNumber.trim()
          if (!pump || isUnavailablePump(pump)) {
            next = {
              ...prev,
              cleaningStep: 'manual-entry-error',
              cleaningPumpNumber: pump,
            }
          } else {
            next = confirmCleaningStall(prev, pump)
          }
          break
        }
        case 'wrong-pump':
          next = {
            ...prev,
            cleaningStep: 'verify-pump',
            cleaningPumpNumber: '',
            cleaningComplete: false,
          }
          break
        case 'start-cleaning':
          next = confirmCleaningStall(prev, prev.cleaningPumpNumber.trim() || '5')
          break
        case 'finish-cleaning': {
          const elapsed = prev.cleaningStartedAt
            ? Math.floor((Date.now() - prev.cleaningStartedAt) / 1000)
            : 74
          const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0')
          const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
          const seconds = String(elapsed % 60).padStart(2, '0')
          next = {
            ...prev,
            cleaningStep: 'cleaning-complete',
            cleaningComplete: true,
            cleaningFinalTime: `${hours}:${minutes}:${seconds}`,
          }
          break
        }
        case 'continue-cleaning':
          next = {
            ...prev,
            cleaningStep: 'cleaning-complete',
            cleaningComplete: true,
            cleaningStartedAt: prev.cleaningStartedAt ?? getSessionStartAt(),
          }
          break
        default:
          return prev
      }

      return {
        ...next,
        screen: resolveCleaningScreen(next.cleaningStep),
      }
    })
  }, [])

  const handleStallAction = useCallback((action: string, payload?: string) => {
    if (isTutorialModeActive()) return

    setContext((prev) => {
      switch (action) {
        case 'stall-select': {
          const stall = payload ?? ''
          const phase: StallPhase = isStallOccupied(stall) ? 'stall-verify' : 'stall-selected'
          const next = {
            ...prev,
            stallPhase: phase,
            stallSectionNumber: stall,
            stallComplete: stallSectionIsComplete(phase),
          }
          return {
            ...next,
            screen: resolveStallScreen(phase),
          }
        }
        case 'stall-clear':
          return {
            ...prev,
            stallPhase: 'select-stall',
            stallSectionNumber: '',
            stallComplete: false,
            screen: 'stall-default',
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
    applyWidgetState,
    patchDevContext,
    updateFuelStep,
    handleAction,
    recordGallonsCapture,
    handleMovementAction,
    handleStallAction,
    handleCleaningAction,
  }
}
