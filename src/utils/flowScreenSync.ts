import type { CleaningStep, FlowContext, MovementMode, MovementPhase, ScreenId, StallPhase } from '../types/flow'
import { isStallOccupied } from './movement'

export function resolveMovementScreen(
  ctx: Pick<FlowContext, 'movementMode' | 'movementPhase' | 'movementComplete' | 'location'>,
): ScreenId {
  if (ctx.movementMode === 'transport') {
    if (ctx.movementComplete) return 'movement-transport-complete'
    if (ctx.movementPhase === 'location-selected') {
      return 'movement-transport-location-selected'
    }
    return 'transport-default'
  }

  switch (ctx.movementPhase) {
    case 'stall-selected':
      return 'movement-stall-complete'
    case 'stall-verify':
      return 'movement-stall-stall-verify'
    case 'stall-issue-reported':
      return 'movement-stall-issue-reported'
    case 'select-stall':
    default:
      return 'movement-stall-select-stall'
  }
}

export function resolveCleaningScreen(step: CleaningStep): ScreenId {
  switch (step) {
    case 'manual-entry':
      return 'cleaning-manual-entry'
    case 'manual-entry-filled':
      return 'cleaning-manual-entry-filled'
    case 'manual-entry-error':
      return 'cleaning-manual-entry-error'
    case 'pump-verified':
      return 'cleaning-pump-verified'
    case 'cleaning-in-progress':
      return 'cleaning-in-progress'
    case 'cleaning-complete':
      return 'cleaning-complete'
    case 'verify-pump':
    default:
      return 'cleaning-default'
  }
}

export function resolveStallScreen(phase: StallPhase): ScreenId {
  switch (phase) {
    case 'stall-selected':
      return 'stall-complete'
    case 'stall-verify':
      return 'stall-missing'
    case 'stall-issue-reported':
      return 'stall-issue-reported'
    case 'select-stall':
    default:
      return 'stall-default'
  }
}

export function withMovementScreen<T extends FlowContext>(ctx: T): T {
  return {
    ...ctx,
    screen: resolveMovementScreen(ctx),
  }
}

export function withCleaningScreen<T extends FlowContext>(ctx: T): T {
  return {
    ...ctx,
    screen: resolveCleaningScreen(ctx.cleaningStep),
  }
}

export function withStallScreen<T extends FlowContext>(ctx: T): T {
  return {
    ...ctx,
    screen: resolveStallScreen(ctx.stallPhase),
  }
}

export function movementPhaseAfterModeChange(
  mode: MovementMode,
  prev: Pick<FlowContext, 'movementPhase' | 'location' | 'stallNumber'>,
): MovementPhase {
  if (mode === 'transport') {
    return prev.location ? 'location-selected' : 'select-location'
  }

  if (prev.movementPhase === 'stall-issue-reported') return 'stall-issue-reported'
  if (prev.movementPhase === 'stall-verify') return 'stall-verify'
  if (prev.stallNumber) {
    return isStallOccupied(prev.stallNumber) ? 'stall-verify' : 'stall-selected'
  }
  return 'select-stall'
}
