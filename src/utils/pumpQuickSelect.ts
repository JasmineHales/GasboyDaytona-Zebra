import type { FlowContext } from '../types/flow'
import type { Messages } from '../i18n/types'

export type PumpQuickSelectSource = {
  pump: string
  inProgress: boolean
}

export function getCleaningQuickSelectSource(
  context: Pick<FlowContext, 'cleaningPumpNumber' | 'cleaningStep' | 'cleaningComplete'>,
): PumpQuickSelectSource | null {
  const pump = context.cleaningPumpNumber?.trim()
  if (!pump) return null

  const inProgress = context.cleaningStep === 'cleaning-in-progress'
  const finished =
    context.cleaningStep === 'cleaning-complete' || context.cleaningComplete

  if (inProgress || finished) {
    return { pump, inProgress }
  }

  return null
}

export function getFuelQuickSelectSource(
  context: Pick<FlowContext, 'pumpNumber' | 'fuelStep' | 'fuelComplete'>,
): PumpQuickSelectSource | null {
  const pump = context.pumpNumber?.trim()
  if (!pump) return null

  const inProgress =
    context.fuelStep === 'fueling-in-progress' ||
    context.fuelStep === 'pump-unlocked' ||
    context.fuelStep === 'unlocking-pump'
  const finished =
    context.fuelStep === 'fueling-complete' ||
    context.fuelStep === 'fueling-complete-missing' ||
    context.fuelStep === 'additional-fueling-complete' ||
    context.fuelComplete

  if (inProgress || finished) {
    return { pump, inProgress }
  }

  return null
}

export function getCleaningQuickSelectHint(
  inProgress: boolean,
  copy: Messages['fuel']['quickSelect'],
): string {
  return inProgress ? copy.cleaningInProgress : copy.cleaningFinished
}

export function getFuelQuickSelectHint(
  inProgress: boolean,
  copy: Messages['fuel']['quickSelect'],
): string {
  return inProgress ? copy.fuelingInProgress : copy.fuelingFinished
}
