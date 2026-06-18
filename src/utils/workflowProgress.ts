import type { FlowContext, FuelStep, SectionStatus, WorkflowSection } from '../types/flow'
import {
  getOdometerValidationError,
  hasOdometerReading,
  hasResolvedOdometer,
  type MileageResolutionOptions,
  type VehicleMileageState,
} from './mileageResolution'

const VSA_PARALLEL_SECTIONS: WorkflowSection[] = ['cleaning', 'fuel']

export type FuelWorkflowContext = {
  fuelStep: FuelStep
  unlockMode: 'remote' | 'on-site'
  locationType: 'gasboy' | 'non-gasboy'
  fuelStartedAt?: number | null
}

const FUEL_COMPLETE_STEPS: FuelStep[] = [
  'fueling-complete',
  'additional-fueling-complete',
]

function isFuelWorkflowComplete(
  context: Pick<FlowContext, 'fuelComplete' | 'fuelStep'>,
): boolean {
  return context.fuelComplete || FUEL_COMPLETE_STEPS.includes(context.fuelStep)
}

function isFuelWorkflowInProgress(
  context: Pick<FlowContext, 'fuelComplete' | 'fuelStep' | 'isAdditionalFueling'>,
): boolean {
  if (isFuelWorkflowComplete(context)) return false
  if (context.fuelStep === 'verify-pump') return false
  if (context.fuelStep === 'additional-fueling') return false
  return true
}

function isCleaningWorkflowComplete(
  context: Pick<FlowContext, 'cleaningComplete' | 'cleaningStep'>,
): boolean {
  return context.cleaningComplete || context.cleaningStep === 'cleaning-complete'
}

function isCleaningWorkflowInProgress(
  context: Pick<FlowContext, 'cleaningStep'>,
): boolean {
  return context.cleaningStep === 'cleaning-in-progress'
}

/** VSA stall stays locked until fuel or cleaning finishes, including while either is active. */
export function isStallSectionUnlocked(
  context: Pick<
    FlowContext,
    | 'fuelComplete'
    | 'fuelStep'
    | 'isAdditionalFueling'
    | 'cleaningComplete'
    | 'cleaningStep'
  >,
): boolean {
  if (isFuelWorkflowInProgress(context) || isCleaningWorkflowInProgress(context)) {
    return false
  }
  return isFuelWorkflowComplete(context) || isCleaningWorkflowComplete(context)
}

/** Remote unlock waiting on a late Pump Unlocked status sync — should not block workflow completion. */
export function isFuelPumpUnlockSyncPending({
  fuelStep,
  unlockMode,
  locationType,
  fuelStartedAt = null,
}: FuelWorkflowContext): boolean {
  if (locationType !== 'gasboy' || unlockMode !== 'remote') {
    return false
  }

  if (fuelStep === 'unlocking-pump') {
    return true
  }

  return fuelStep === 'pump-unlocked' && fuelStartedAt == null
}

function isFuelSectionSatisfiedForFinish(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
  optionalSections: WorkflowSection[],
  fuelContext?: FuelWorkflowContext,
): boolean {
  const status = sectionStatus.fuel

  if (fuelContext && isFuelPumpUnlockSyncPending(fuelContext)) {
    return true
  }

  return isSectionSatisfiedForFinish(
    'fuel',
    status,
    acknowledgedSections,
    optionalSections,
  )
}

function isVsaFuelSectionSatisfiedForFinish(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
  fuelContext?: FuelWorkflowContext,
): boolean {
  const status = sectionStatus.fuel

  if (fuelContext && isFuelPumpUnlockSyncPending(fuelContext)) {
    return true
  }

  if (status === 'in-progress' || status === 'missing') {
    return false
  }

  if (status === 'complete') {
    return acknowledgedSections.includes('fuel')
  }

  return status === 'not-started'
}

/** Transport: fuel can be skipped when never started. VSA: stall is always skippable. */
export function getOptionalSections(sections: WorkflowSection[]): WorkflowSection[] {
  if (isVsaWorkflow(sections)) {
    return ['stall']
  }

  const isTransport =
    sections.includes('movement') &&
    sections.includes('fuel') &&
    !sections.includes('cleaning')

  return isTransport ? ['fuel'] : []
}

export function isVsaWorkflow(sections: WorkflowSection[]): boolean {
  return (
    sections.includes('cleaning') &&
    sections.includes('fuel') &&
    sections.includes('stall')
  )
}

/** Cleaning and fuel can be acknowledged independently on VSA. */
export function getParallelSections(sections: WorkflowSection[]): WorkflowSection[] {
  return isVsaWorkflow(sections) ? VSA_PARALLEL_SECTIONS : []
}

export function hasVsaCoreServiceComplete(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
): boolean {
  return VSA_PARALLEL_SECTIONS.some(
    (section) => sectionStatus[section] === 'complete',
  )
}

export function hasVsaCoreServiceAcknowledged(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
): boolean {
  return VSA_PARALLEL_SECTIONS.some(
    (section) =>
      sectionStatus[section] === 'complete' &&
      acknowledgedSections.includes(section),
  )
}

/** Whether a not-started section should show the Optional chip. */
export function isSectionOptional(
  section: WorkflowSection,
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  fuelContext?: FuelWorkflowContext,
): boolean {
  if (
    section === 'fuel' &&
    fuelContext &&
    isFuelPumpUnlockSyncPending(fuelContext)
  ) {
    if (sections.includes('movement') && sectionStatus.movement === 'complete') {
      return true
    }
    if (isVsaWorkflow(sections) && hasVsaCoreServiceComplete(sectionStatus)) {
      return true
    }
  }

  if (sectionStatus[section] !== 'not-started') return false

  if (isVsaWorkflow(sections)) {
    if (section === 'stall') return true

    if (VSA_PARALLEL_SECTIONS.includes(section)) {
      const other = VSA_PARALLEL_SECTIONS.find((s) => s !== section)!
      return sectionStatus[other] === 'complete'
    }
  }

  return getOptionalSections(sections).includes(section)
}

export function getRequiredSections(sections: WorkflowSection[]): WorkflowSection[] {
  if (isVsaWorkflow(sections)) {
    return VSA_PARALLEL_SECTIONS
  }

  const optional = new Set(getOptionalSections(sections))
  return sections.filter((section) => !optional.has(section))
}

export function canAcknowledgeSection(
  section: WorkflowSection,
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
): boolean {
  if (sections.includes('movement') && section !== 'movement') {
    if (sectionStatus.movement !== 'complete') {
      return false
    }
  }

  return true
}

export function getCompletableSection(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
): WorkflowSection | undefined {
  return sections.find(
    (section) =>
      sectionStatus[section] === 'complete' &&
      !acknowledgedSections.includes(section) &&
      canAcknowledgeSection(section, sections, sectionStatus),
  )
}

export function isSectionSatisfiedForFinish(
  section: WorkflowSection,
  status: SectionStatus,
  acknowledgedSections: WorkflowSection[],
  optionalSections: WorkflowSection[],
): boolean {
  if (optionalSections.includes(section) && status === 'not-started') {
    return true
  }

  return status === 'complete' && acknowledgedSections.includes(section)
}

function isVsaWorkflowReadyToFinish(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
  fuelContext?: FuelWorkflowContext,
): boolean {
  if (!hasVsaCoreServiceAcknowledged(sectionStatus, acknowledgedSections)) {
    return false
  }

  return sections.every((section) => {
    if (section === 'fuel') {
      return isVsaFuelSectionSatisfiedForFinish(
        sectionStatus,
        acknowledgedSections,
        fuelContext,
      )
    }

    const status = sectionStatus[section]

    if (status === 'in-progress' || status === 'missing') {
      return false
    }

    if (status === 'complete') {
      return acknowledgedSections.includes(section)
    }

    return status === 'not-started'
  })
}

export function isWorkflowReadyToFinish(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
  fuelContext?: FuelWorkflowContext,
): boolean {
  if (isVsaWorkflow(sections)) {
    return isVsaWorkflowReadyToFinish(
      sections,
      sectionStatus,
      acknowledgedSections,
      fuelContext,
    )
  }

  const optionalSections = getOptionalSections(sections)

  return sections.every((section) => {
    if (section === 'fuel') {
      return isFuelSectionSatisfiedForFinish(
        sectionStatus,
        acknowledgedSections,
        optionalSections,
        fuelContext,
      )
    }

    return isSectionSatisfiedForFinish(
      section,
      sectionStatus[section],
      acknowledgedSections,
      optionalSections,
    )
  })
}

export function hasBlockingSectionInProgress(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  completableSection?: WorkflowSection,
  fuelContext?: FuelWorkflowContext,
): boolean {
  const optional = new Set(getOptionalSections(sections))
  const parallel = new Set(getParallelSections(sections))

  return sections.some((section) => {
    const status = sectionStatus[section]
    if (status !== 'in-progress' && status !== 'missing') return false

    if (
      section === 'fuel' &&
      fuelContext &&
      isFuelPumpUnlockSyncPending(fuelContext)
    ) {
      return false
    }

    // Transport: once fuel has started, footer Complete stays disabled until fuel settles
    if (optional.has('fuel') && section === 'fuel') {
      return true
    }

    // VSA: finishing cleaning does not require fuel to be idle (and vice versa)
    if (
      completableSection &&
      parallel.has(completableSection) &&
      parallel.has(section) &&
      section !== completableSection
    ) {
      return false
    }

    return true
  })
}

export function hasWorkflowProgress(
  context: import('../types/flow').FlowContext,
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  mileageState?: VehicleMileageState,
  mileageOptions?: MileageResolutionOptions,
): boolean {
  if (
    mileageState &&
    hasResolvedOdometer(context.odometerReading, mileageState, mileageOptions)
  ) {
    return true
  }
  if (!mileageState && context.odometerReading.trim().length > 0) return true
  if (context.showIssueOverlay) return true

  return sections.some((section) => {
    const status = sectionStatus[section]
    return status === 'in-progress' || status === 'complete' || status === 'missing'
  })
}

export { hasOdometerReading } from './mileageResolution'

export function getCompleteDisabledReason(
  completableSection: WorkflowSection | undefined,
  sectionTitles: Record<WorkflowSection, string>,
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  odometerReading = '',
  fuelContext?: FuelWorkflowContext,
  workflowReady = false,
  mileageState?: VehicleMileageState,
  mileageOptions?: MileageResolutionOptions,
): string | undefined {
  if (
    hasBlockingSectionInProgress(
      sections,
      sectionStatus,
      completableSection,
      fuelContext,
    )
  ) {
    return 'Finish the active workflow section before completing.'
  }
  if (!completableSection) {
    if (workflowReady) {
      return undefined
    }
    if (sections.includes('movement') && sectionStatus.movement !== 'complete') {
      return 'Finish Movement to continue.'
    }
    if (isVsaWorkflow(sections)) {
      return 'Finish Cleaning or Fuel to continue. Other services are optional.'
    }
    const optional = getOptionalSections(sections)
    if (optional.includes('fuel')) {
      return 'Finish Movement to continue. Fuel is optional.'
    }
    return 'Finish a workflow section to continue.'
  }
  if (
    mileageState
      ? !hasResolvedOdometer(odometerReading, mileageState, mileageOptions)
      : !hasOdometerReading(odometerReading)
  ) {
    if (mileageState) {
      const odometerError = getOdometerValidationError(odometerReading, mileageState, {
        showPartial: true,
      })
      if (odometerError) return odometerError
    }
    return 'Enter odometer reading to continue.'
  }
  return `Acknowledge ${sectionTitles[completableSection]} when ready.`
}

export function getVsaProgressCounts(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
): { completed: number; total: number } {
  const anyComplete = hasVsaCoreServiceComplete(sectionStatus)
  return { completed: anyComplete ? 1 : 0, total: 1 }
}
