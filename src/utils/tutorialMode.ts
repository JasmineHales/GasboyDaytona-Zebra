import {
  clearPersistedWorkflow,
  loadPersistedWorkflow,
  restorePersistedWorkflow,
  type PersistedWorkflow,
} from './workflowPersistence'
import {
  decrementTutorialMode,
  incrementTutorialMode,
  isTutorialModeActive,
} from './tutorialModeState'

export type { PersistedWorkflow }

export { isTutorialModeActive } from './tutorialModeState'

let workflowSnapshot: PersistedWorkflow | null = null

const restoreListeners = new Set<(snapshot: PersistedWorkflow | null) => void>()

export function enterTutorialMode(): void {
  if (!isTutorialModeActive()) {
    workflowSnapshot = loadPersistedWorkflow()
  }
  incrementTutorialMode()
}

export function exitTutorialMode(): void {
  if (!isTutorialModeActive()) return

  decrementTutorialMode()
  if (isTutorialModeActive()) return

  const snapshot = workflowSnapshot
  workflowSnapshot = null

  if (snapshot) {
    restorePersistedWorkflow(snapshot)
  } else {
    clearPersistedWorkflow()
  }

  restoreListeners.forEach((listener) => listener(snapshot))
}

export function onTutorialWorkflowRestore(
  listener: (snapshot: PersistedWorkflow | null) => void,
): () => void {
  restoreListeners.add(listener)
  return () => {
    restoreListeners.delete(listener)
  }
}
