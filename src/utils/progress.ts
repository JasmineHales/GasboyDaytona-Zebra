import type { CleaningStep, FuelStep, MovementPhase, StallPhase } from '../types/flow'
import type { ProgressIndicatorProps } from '../components/ui/ProgressIndicator'

export function getMovementProgress(
  mode: 'transport' | 'stall',
  phase: MovementPhase,
): ProgressIndicatorProps {
  if (mode === 'transport') {
    const selected = phase === 'location-selected'
    return {
      step: selected ? 2 : 1,
      label: selected ? 'Location Selected' : 'Select Location',
      description: selected ? undefined : 'Search for a location and select one to continue',
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
      label: 'Stalling Selected - Verify Stall',
      badgeVariant: 'warning',
      labelVariant: 'warning',
      showProgress: false,
      totalSteps: 2,
    }
  }

  if (phase === 'stall-selected' || phase === 'stall-issue-reported') {
    return {
      step: 2,
      label: 'Stall Selected',
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
      totalSteps: 2,
    }
  }

  return {
    step: 1,
    label: 'Select Stall',
    description: 'Enter stall number, then confirm',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 50,
    totalSteps: 2,
  }
}

const fuelProgress: Record<FuelStep, ProgressIndicatorProps> = {
  'verify-pump': {
    step: 1,
    label: 'Verify Pump',
    description: 'Scan or enter the pump number to verify the pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
  },
  'manual-entry': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
  },
  'manual-entry-error': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
  },
  'manual-entry-filled': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
  },
  'pump-unavailable': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
  },
  'unlocking-pump': {
    step: 2,
    label: 'Unlocking Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 33,
  },
  'pump-unlocked': {
    step: 3,
    label: 'Fueling In Progress',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 66,
  },
  'pump-verified': {
    step: 2,
    label: 'Start Fueling',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 33,
  },
  'connection-lost': {
    step: 2,
    label: 'Unlocking Pump',
    badgeVariant: 'error',
    labelVariant: 'error',
    showProgress: true,
    progressPercent: 33,
  },
  'no-response': {
    step: 2,
    label: 'Unlocking Pump',
    badgeVariant: 'error',
    labelVariant: 'error',
    showProgress: true,
    progressPercent: 33,
  },
  'pump-timeout': {
    step: 2,
    label: 'Unlocking Pump',
    badgeVariant: 'error',
    labelVariant: 'error',
    showProgress: true,
    progressPercent: 33,
  },
  'fueling-in-progress': {
    step: 3,
    label: 'Fueling In Progress',
    description: 'Record gallons when you\'re done fueling',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 66,
  },
  'fueling-complete': {
    step: 4,
    label: 'Fueling Complete',
    badgeVariant: 'complete',
    labelVariant: 'complete',
    showProgress: false,
  },
  'fueling-complete-missing': {
    step: 4,
    label: 'Fueling Complete - Missing Information',
    badgeVariant: 'warning',
    labelVariant: 'warning',
    showProgress: false,
  },
  'additional-fueling': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
  },
  'additional-fueling-complete': {
    step: 4,
    label: 'Fueling Complete',
    badgeVariant: 'complete',
    labelVariant: 'complete',
    showProgress: false,
  },
}

export function getFuelProgress(step: FuelStep): ProgressIndicatorProps {
  return { totalSteps: 4, ...fuelProgress[step] }
}

const cleaningProgress: Record<CleaningStep, ProgressIndicatorProps> = {
  'verify-pump': {
    step: 1,
    label: 'Verify Pump',
    description: 'Scan or enter the pump number to verify the pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    totalSteps: 4,
  },
  'manual-entry': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    totalSteps: 4,
  },
  'manual-entry-filled': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    totalSteps: 4,
  },
  'manual-entry-error': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    totalSteps: 4,
  },
  'pump-verified': {
    step: 2,
    label: 'Start Cleaning',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 33,
    totalSteps: 4,
  },
  'cleaning-in-progress': {
    step: 3,
    label: 'Cleaning In Progress',
    description: 'Take your time — tap finish when you\'re done',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 66,
    totalSteps: 4,
  },
  'cleaning-complete': {
    step: 4,
    label: 'Cleaning Complete',
    badgeVariant: 'complete',
    labelVariant: 'complete',
    showProgress: false,
  },
}

export function getCleaningProgress(step: CleaningStep): ProgressIndicatorProps {
  return { totalSteps: 4, ...cleaningProgress[step] }
}

export function getStallProgress(phase: StallPhase): ProgressIndicatorProps {
  if (phase === 'stall-verify') {
    return {
      step: 2,
      label: 'Stalling Selected - Verify Stall',
      badgeVariant: 'warning',
      labelVariant: 'warning',
      showProgress: false,
      totalSteps: 2,
    }
  }

  if (phase === 'stall-selected' || phase === 'stall-issue-reported') {
    return {
      step: 2,
      label: 'Stall Selected',
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
      totalSteps: 2,
    }
  }

  return {
    step: 1,
    label: 'Select Stall',
    description: 'Enter stall number, then confirm',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 50,
    totalSteps: 2,
  }
}
