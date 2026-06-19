import type { FlowContext } from '../types/flow'
import { isVsaStallEnabled } from './vsaStall'

export function isGasboyLocation(context: Pick<FlowContext, 'locationType'>): boolean {
  return context.locationType === 'gasboy'
}

export function formatDevScenarioSummary(
  context: FlowContext,
  input: {
    showLogin: boolean
    loginVariant: 'device' | 'browser'
    view: string
  },
): string[] {
  if (input.showLogin) {
    return [
      `Login · ${input.loginVariant === 'device' ? 'Hertz device' : 'Browser SSO'}`,
    ]
  }

  const lines: string[] = [`Page · ${input.view}`]

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
