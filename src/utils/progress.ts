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
      badgeVariant: selected ? 'complete' : 'active',
      labelVariant: selected ? 'complete' : 'default',
      showProgress: !selected,
      progressPercent: 50,
      progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
      stepText: 'Step 2 of 2',
    }
  }

  if (phase === 'stall-verify') {
    return {
      step: 2,
      label: 'Stalling Selected - Verify Stall',
      badgeVariant: 'warning',
      labelVariant: 'warning',
      showProgress: false,
    }
  }

  if (phase === 'stall-selected' || phase === 'stall-issue-reported') {
    return {
      step: 2,
      label: 'Stall Selected',
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
    }
  }

  return {
    step: 1,
    label: 'Select Stall',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 50,
    progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
    stepText: 'Step 2 of 2',
  }
}

const fuelProgress: Record<FuelStep, ProgressIndicatorProps> = {
  'verify-pump': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
  },
  'manual-entry': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
  },
  'manual-entry-error': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
  },
  'manual-entry-filled': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
  },
  'pump-unavailable': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
  },
  'unlocking-pump': {
    step: 2,
    label: 'Unlocking Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 33,
    progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
  },
  'pump-unlocked': {
    step: 3,
    label: 'Fueling In Progress',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 66,
    progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
  },
  'pump-verified': {
    step: 2,
    label: 'Start Fueling',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 33,
    progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
  },
  'connection-lost': {
    step: 2,
    label: 'Unlocking Pump',
    badgeVariant: 'error',
    labelVariant: 'error',
    showProgress: true,
    progressPercent: 33,
    progressFillClass: 'bg-[var(--color-fleet-text-red)]',
  },
  'no-response': {
    step: 2,
    label: 'Unlocking Pump',
    badgeVariant: 'error',
    labelVariant: 'error',
    showProgress: true,
    progressPercent: 33,
    progressFillClass: 'bg-[var(--color-fleet-text-red)]',
  },
  'pump-timeout': {
    step: 2,
    label: 'Unlocking Pump',
    badgeVariant: 'error',
    labelVariant: 'error',
    showProgress: true,
    progressPercent: 33,
    progressFillClass: 'bg-[var(--color-fleet-text-red)]',
  },
  'fueling-in-progress': {
    step: 3,
    label: 'Fueling In Progress',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 66,
    progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
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
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
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
  return fuelProgress[step]
}

const cleaningProgress: Record<CleaningStep, ProgressIndicatorProps> = {
  'verify-pump': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
    stepText: 'Step 1 of 4',
  },
  'manual-entry': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
    stepText: 'Step 1 of 4',
  },
  'manual-entry-filled': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
    stepText: 'Step 1 of 4',
  },
  'manual-entry-error': {
    step: 1,
    label: 'Verify Pump',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 0,
    progressFillClass: 'bg-[var(--color-fleet-primary-200)]',
    stepText: 'Step 1 of 4',
  },
  'pump-verified': {
    step: 2,
    label: 'Start Cleaning',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 33,
    progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
    stepText: 'Step 2 of 4',
  },
  'cleaning-in-progress': {
    step: 3,
    label: 'Cleaning In Progress',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 66,
    progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
    stepText: 'Step 3 of 4',
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
  return cleaningProgress[step]
}

export function getStallProgress(phase: StallPhase): ProgressIndicatorProps {
  if (phase === 'stall-verify') {
    return {
      step: 2,
      label: 'Stalling Selected - Verify Stall',
      badgeVariant: 'warning',
      labelVariant: 'warning',
      showProgress: false,
    }
  }

  if (phase === 'stall-selected' || phase === 'stall-issue-reported') {
    return {
      step: 2,
      label: 'Stall Selected',
      badgeVariant: 'complete',
      labelVariant: 'complete',
      showProgress: false,
    }
  }

  return {
    step: 1,
    label: 'Select Stall',
    badgeVariant: 'active',
    labelVariant: 'default',
    showProgress: true,
    progressPercent: 50,
    progressFillClass: 'bg-[var(--color-fleet-positive-500)]',
    stepText: 'Step 2 of 2',
  }
}
