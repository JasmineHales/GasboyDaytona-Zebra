import { useCallback, useEffect, useState } from 'react'
import type { TutorialStep } from '../utils/tutorialSteps'

export function hasCompletedTutorial(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) === 'done'
  } catch {
    return false
  }
}

export function markTutorialComplete(storageKey: string) {
  try {
    localStorage.setItem(storageKey, 'done')
  } catch {
    // ignore storage failures in private browsing
  }
}

export function clearTutorialCompletion(storageKey: string) {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // ignore
  }
}

type UseTutorialOptions = {
  storageKey: string
  steps: TutorialStep[]
  autoStart?: boolean
  forceStart?: boolean
}

export function useTutorial({
  storageKey,
  steps,
  autoStart = true,
  forceStart = false,
}: UseTutorialOptions) {
  const [active, setActive] = useState(() => {
    if (forceStart) {
      clearTutorialCompletion(storageKey)
      return true
    }
    if (!autoStart) return false
    return !hasCompletedTutorial(storageKey)
  })
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (forceStart) {
      clearTutorialCompletion(storageKey)
      setActive(true)
      setStepIndex(0)
      return
    }

    if (!autoStart) return
    if (!hasCompletedTutorial(storageKey)) {
      setActive(true)
      setStepIndex(0)
    }
  }, [autoStart, forceStart, storageKey])

  const step = steps[stepIndex] ?? null
  const isFirst = stepIndex === 0
  const isLast = stepIndex >= steps.length - 1

  const start = useCallback(() => {
    clearTutorialCompletion(storageKey)
    setStepIndex(0)
    setActive(true)
  }, [storageKey])

  const skip = useCallback(() => {
    markTutorialComplete(storageKey)
    setActive(false)
  }, [storageKey])

  const finish = useCallback(() => {
    markTutorialComplete(storageKey)
    setActive(false)
  }, [storageKey])

  const next = useCallback(() => {
    if (isLast) {
      finish()
      return
    }
    setStepIndex((index) => index + 1)
  }, [finish, isLast])

  const back = useCallback(() => {
    setStepIndex((index) => Math.max(0, index - 1))
  }, [])

  return {
    active,
    step,
    stepIndex,
    stepCount: steps.length,
    isFirst,
    isLast,
    start,
    skip,
    next,
    back,
    finish,
  }
}
