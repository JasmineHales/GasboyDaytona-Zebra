import type { CleaningStep, FuelStep, MovementPhase, StallPhase } from '../types/flow'
import type { ProgressIndicatorProps } from '../components/ui/ProgressIndicator'
import type { Messages } from '../i18n/types'

type ProgressMessages = Messages['progress']

export function getMovementProgress(
  mode: 'transport' | 'stall',
  phase: MovementPhase,
  p: ProgressMessages,
): ProgressIndicatorProps {
  if (mode === 'transport') {
    const selected = phase === 'location-selected'
    return {
      step: selected ? 2 : 1,
      label: selected ? p.locationSelected : p.selectLocation,
      description: selected ? undefined : p.selectLocationDesc,
      badgeVariant: selected ? 'complete' : 'active',
      labelVariant: selected ? 'complete' : 'default',
      showProgress: !selected,
      progressPercent: 50,
      totalSteps: 2,
    }
  }

  if (phase === 'stall-verify') {
    return {
      step: 2,
      label: p.stallVerify,
      badgeVariant: 'warning',
      labelVariant: 'warning',
      showProgress: false,
      totalSteps: 2,
    }
  }

  if (phase === 'stall-selected' || phase === 'stall-issue-reported') {
    return {
      step: 2,
      label: p.stallSelected,
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
      totalSteps: 2,
    }
  }

  return {
    step: 1,
    label: p.selectStall,
    description: p.selectStallDesc,
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 50,
    totalSteps: 2,
  }
}

function fuelProgressForStep(step: FuelStep, p: ProgressMessages): ProgressIndicatorProps {
  const verifyPump = {
    step: 1,
    label: p.verifyPump,
    description: p.verifyPumpDesc,
    badgeVariant: 'active' as const,
    labelVariant: 'default' as const,
    showProgress: true,
    progressPercent: 0,
  }

  const unlockingPump = {
    step: 2,
    label: p.unlockingPump,
    badgeVariant: 'active' as const,
    labelVariant: 'default' as const,
    showProgress: true,
    progressPercent: 33,
  }

  const unlockingPumpError = { ...unlockingPump, badgeVariant: 'error' as const, labelVariant: 'error' as const }

  const fuelingInProgress = {
    step: 3,
    label: p.fuelingInProgress,
    description: p.fuelingInProgressDesc,
    badgeVariant: 'active' as const,
    labelVariant: 'default' as const,
    showProgress: true,
    progressPercent: 66,
  }

  const map: Partial<Record<FuelStep, ProgressIndicatorProps>> = {
    'verify-pump': verifyPump,
    'manual-entry': { ...verifyPump, description: undefined },
    'manual-entry-error': { ...verifyPump, description: undefined },
    'manual-entry-filled': { ...verifyPump, description: undefined },
    'pump-unavailable': { ...verifyPump, description: undefined },
    'unlocking-pump': unlockingPump,
    'pump-unlocked': fuelingInProgress,
    'pump-verified': {
      step: 2,
      label: p.startFueling,
      badgeVariant: 'active',
      labelVariant: 'default',
      showProgress: true,
      progressPercent: 33,
    },
    'connection-lost': unlockingPumpError,
    'no-response': unlockingPumpError,
    'pump-timeout': unlockingPumpError,
    'fueling-in-progress': fuelingInProgress,
    'fueling-complete': {
      step: 4,
      label: p.fuelingComplete,
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
    },
    'fueling-complete-missing': {
      step: 4,
      label: p.fuelingCompleteMissing,
      badgeVariant: 'warning',
      labelVariant: 'warning',
      showProgress: false,
    },
    'additional-fueling': { ...verifyPump, description: undefined },
    'additional-fueling-complete': {
      step: 4,
      label: p.fuelingComplete,
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
    },
  }

  return map[step] ?? verifyPump
}

export function getFuelProgress(step: FuelStep, p: ProgressMessages): ProgressIndicatorProps {
  return { totalSteps: 4, ...fuelProgressForStep(step, p) }
}

function cleaningProgressForStep(
  step: CleaningStep,
  p: ProgressMessages,
): ProgressIndicatorProps {
  const verifyPump = {
    step: 1,
    label: p.verifyPump,
    description: p.verifyPumpDesc,
    badgeVariant: 'active' as const,
    labelVariant: 'default' as const,
    showProgress: true,
    progressPercent: 0,
    totalSteps: 4,
  }

  const map: Partial<Record<CleaningStep, ProgressIndicatorProps>> = {
    'verify-pump': verifyPump,
    'manual-entry': { ...verifyPump, description: undefined },
    'manual-entry-filled': { ...verifyPump, description: undefined },
    'manual-entry-error': { ...verifyPump, description: undefined },
    'pump-verified': {
      step: 2,
      label: p.startCleaning,
      badgeVariant: 'active',
      labelVariant: 'default',
      showProgress: true,
      progressPercent: 33,
      totalSteps: 4,
    },
    'cleaning-in-progress': {
      step: 3,
      label: p.cleaningInProgress,
      description: p.cleaningInProgressDesc,
      badgeVariant: 'active',
      labelVariant: 'default',
      showProgress: true,
      progressPercent: 66,
      totalSteps: 4,
    },
    'cleaning-complete': {
      step: 4,
      label: p.cleaningComplete,
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
      totalSteps: 4,
    },
  }

  return map[step] ?? verifyPump
}

export function getCleaningProgress(step: CleaningStep, p: ProgressMessages): ProgressIndicatorProps {
  return cleaningProgressForStep(step, p)
}

export function getStallProgress(phase: StallPhase, p: ProgressMessages): ProgressIndicatorProps {
  if (phase === 'stall-verify') {
    return {
      step: 2,
      label: p.stallVerify,
      badgeVariant: 'warning',
      labelVariant: 'warning',
      showProgress: false,
      totalSteps: 2,
    }
  }

  if (phase === 'stall-selected' || phase === 'stall-issue-reported') {
    return {
      step: 2,
      label: p.stallSelected,
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
      totalSteps: 2,
    }
  }

  return {
    step: 1,
    label: p.selectStall,
    description: p.selectStallDesc,
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 50,
    totalSteps: 2,
  }
}
