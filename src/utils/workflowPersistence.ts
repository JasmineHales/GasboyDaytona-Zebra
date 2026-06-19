import type { FlowContext, WorkflowSection } from '../types/flow'

const STORAGE_KEY = 'remote-off.workflow.v3'

export type PersistedWorkflow = {
  context: FlowContext
  acknowledgedSections: WorkflowSection[]
  activeView: 'transport' | 'vsa' | 'fuel' | null
}

export function loadPersistedWorkflow(): PersistedWorkflow | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as Partial<PersistedWorkflow>
    if (!record.context || typeof record.context !== 'object') return null
    return {
      context: record.context as FlowContext,
      acknowledgedSections: Array.isArray(record.acknowledgedSections)
        ? record.acknowledgedSections.filter(
            (item): item is WorkflowSection => typeof item === 'string',
          )
        : [],
      activeView:
        record.activeView === 'transport' ||
        record.activeView === 'vsa' ||
        record.activeView === 'fuel'
          ? record.activeView
          : null,
    }
  } catch {
    return null
  }
}

export function savePersistedWorkflow(patch: Partial<PersistedWorkflow>): void {
  try {
    const current = loadPersistedWorkflow()
    const next: PersistedWorkflow = {
      context: patch.context ?? current?.context ?? ({} as FlowContext),
      acknowledgedSections:
        patch.acknowledgedSections ?? current?.acknowledgedSections ?? [],
      activeView:
        patch.activeView !== undefined ? patch.activeView : (current?.activeView ?? null),
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private-mode errors
  }
}

export function clearPersistedWorkflow(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
