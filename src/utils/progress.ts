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
    badgeVariant: 'active' as const,
    labelVariant: 'default' as const,
    showProgress: true,
    progressPercent: 66,
  }

  const map: Partial<Record<FuelStep, ProgressIndicatorProps>> = {
    'verify-pump': verifyPump,
    'manual-entry': verifyPump,
    'manual-entry-error': verifyPump,
    'manual-entry-filled': verifyPump,
    'pump-unavailable': verifyPump,
    'unlocking-pump': unlockingPump,
    'pump-unlocked': fuelingInProgress,
    'pump-verified': {
      step: 2,
      label: p.pumpReady,
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
    'additional-fueling': verifyPump,
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
  const enterCleanLocation = {
    step: 1,
    label: p.enterCleanLocation,
    badgeVariant: 'active' as const,
    labelVariant: 'default' as const,
    showProgress: true,
    progressPercent: 0,
    totalSteps: 4,
  }

  const map: Partial<Record<CleaningStep, ProgressIndicatorProps>> = {
    'verify-pump': enterCleanLocation,
    'manual-entry': enterCleanLocation,
    'manual-entry-filled': enterCleanLocation,
    'manual-entry-error': enterCleanLocation,
    'pump-verified': {
      step: 2,
      label: p.workstationReady,
      badgeVariant: 'active',
      labelVariant: 'default',
      showProgress: true,
      progressPercent: 33,
      totalSteps: 4,
    },
    'cleaning-in-progress': {
      step: 3,
      label: p.cleaningInProgress,
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

  return map[step] ?? enterCleanLocation
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
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 50,
    totalSteps: 2,
  }
}
