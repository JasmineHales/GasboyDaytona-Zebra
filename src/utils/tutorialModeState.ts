let tutorialDepth = 0

export function isTutorialModeActive(): boolean {
  return tutorialDepth > 0
}

export function incrementTutorialMode(): number {
  tutorialDepth += 1
  return tutorialDepth
}

export function decrementTutorialMode(): number {
  tutorialDepth = Math.max(0, tutorialDepth - 1)
  return tutorialDepth
}

export function resetTutorialModeDepth(): void {
  tutorialDepth = 0
}
