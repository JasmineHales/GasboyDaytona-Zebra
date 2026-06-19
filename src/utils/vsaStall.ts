import type { FlowContext, WorkflowSection } from '../types/flow'
import type { TutorialConfig } from './tutorialSteps'
import { VSA_TUTORIAL, VSA_TUTORIAL_STEPS } from './tutorialSteps'

export function isVsaStallEnabled(
  context: Pick<FlowContext, 'vsaStallEnabled'>,
): boolean {
  return context.vsaStallEnabled ?? true
}

export function getVsaSections(
  context: Pick<FlowContext, 'vsaStallEnabled'>,
): WorkflowSection[] {
  const sections: WorkflowSection[] = ['cleaning', 'fuel']
  if (isVsaStallEnabled(context)) {
    sections.push('stall')
  }
  return sections
}

export function getVsaTutorial(
  context: Pick<FlowContext, 'vsaStallEnabled'>,
): TutorialConfig {
  if (isVsaStallEnabled(context)) return VSA_TUTORIAL

  return {
    ...VSA_TUTORIAL,
    steps: VSA_TUTORIAL_STEPS.filter((step) => step.id !== 'stall').map((step) => {
      if (step.id === 'welcome') {
        return {
          ...step,
          body: 'This tour covers cleaning and fuel steps for vehicle service advisor jobs.',
        }
      }
      if (step.id === 'complete') {
        return {
          ...step,
          body: 'Tap Complete when cleaning and fuel sections are done.',
        }
      }
      return step
    }),
  }
}
