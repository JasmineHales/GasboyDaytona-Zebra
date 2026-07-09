import type { FlowContext } from '../types/flow'
import { requiresManualMileageEntry } from './mileageResolution'
import {
  MILEAGE_SCENARIOS,
  TRUSTED_MILEAGE_STATE,
} from './mileageScenarios'
import { isVsaStallEnabled } from './vsaStall'

export type OdometerWidgetStateId =
  | 'verified'
  | 'manual-empty'
  | 'manual-filled'
  | 'manual-below-floor'

export const ODOMETER_WIDGET_STATES: Record<
  OdometerWidgetStateId,
  { label: string; hint: string }
> = {
  verified: {
    label: 'Verified',
    hint: 'Trusted mileage · locked chip',
  },
  'manual-empty': {
    label: 'Manual · empty',
    hint: 'Required entry · awaiting value',
  },
  'manual-filled': {
    label: 'Manual · valid',
    hint: 'Required entry · value accepted',
  },
  'manual-below-floor': {
    label: 'Manual · error',
    hint: 'Below telematics floor',
  },
}

const MANUAL_MILEAGE_STATE = MILEAGE_SCENARIOS['transport-mileage-stale'].state

export function patchForOdometerWidgetState(
  id: OdometerWidgetStateId,
): Partial<FlowContext> {
  switch (id) {
    case 'verified':
      return {
        mileageState: TRUSTED_MILEAGE_STATE,
        odometerReading: '',
      }
    case 'manual-empty':
      return {
        mileageState: MANUAL_MILEAGE_STATE,
        odometerReading: '',
      }
    case 'manual-filled':
      return {
        mileageState: MANUAL_MILEAGE_STATE,
        odometerReading: '29000',
      }
    case 'manual-below-floor':
      return {
        mileageState: MANUAL_MILEAGE_STATE,
        odometerReading: '28000',
      }
  }
}

export function resolveOdometerWidgetState(
  context: FlowContext,
): OdometerWidgetStateId {
  const gasboyExpected = context.locationType === 'gasboy'
  const manualRequired = requiresManualMileageEntry(context.mileageState, {
    gasboyMileageExpected: gasboyExpected,
  })

  if (!manualRequired) return 'verified'

  const reading = context.odometerReading.trim()
  if (!reading) return 'manual-empty'
  if (reading === '28000') return 'manual-below-floor'
  return 'manual-filled'
}

export function isGasboyLocation(context: Pick<FlowContext, 'locationType'>): boolean {
  return context.locationType === 'gasboy'
}

export function formatDevScenarioSummary(
  context: FlowContext,
  input: {
    showLogin: boolean
    showSetup?: boolean
    loginVariant: 'device' | 'browser'
    view: string
  },
): string[] {
  const lines: string[] = []

  if (input.showLogin) {
    lines.push(
      `Login · ${input.loginVariant === 'device' ? 'Zebra emulator' : 'Browser SSO'}`,
    )
    return lines
  }

  if (input.showSetup) {
    lines.push('Page · setup')
    return lines
  }

  lines.push(`Page · ${input.view}`)

  if (input.view === 'transport' || input.view === 'fuel' || input.view === 'vsa') {
    lines.push(
      isGasboyLocation(context)
        ? 'Location · Gasboy'
        : 'Location · Non-Gasboy',
    )
    if (isGasboyLocation(context)) {
      lines.push(
        context.unlockMode === 'remote'
          ? 'Unlock · Remote (in-app)'
          : 'Unlock · On-site terminal',
      )
    }
  }

  if (input.view === 'vsa') {
    lines.push(
      isVsaStallEnabled(context)
        ? 'Stall assignment · Enabled'
        : 'Stall assignment · Disabled',
    )
  }

  if (input.view === 'transport' || input.view === 'fuel' || input.view === 'vsa') {
    lines.push(`Odometer · ${ODOMETER_WIDGET_STATES[resolveOdometerWidgetState(context)].label}`)
  }

  lines.push(`Screen · ${context.screen}`)

  return lines
}

export function patchForGasboyEnabled(enabled: boolean): Partial<FlowContext> {
  if (enabled) {
    return {
      locationType: 'gasboy',
      unlockMode: 'remote',
    }
  }
  return {
    locationType: 'non-gasboy',
    unlockMode: 'on-site',
  }
}
