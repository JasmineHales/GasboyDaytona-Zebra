import type { FlowContext, FuelStep, FuelTransaction, SectionStatus, WorkflowSection } from '../types/flow'
import type { Messages } from '../i18n/types'
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
  fuelComplete?: boolean
  isAdditionalFueling?: boolean
  fuelTransactions?: FuelTransaction[]
}

const FUEL_REPORT_COMPLETION_CONTEXT_KEYS = [
  'fuelStep',
  'fuelComplete',
  'isAdditionalFueling',
  'fuelTransactions',
] as const satisfies readonly (keyof FuelWorkflowContext)[]

type FuelReportCompletionContext = Pick<
  import('../types/flow').FlowContext,
  (typeof FUEL_REPORT_COMPLETION_CONTEXT_KEYS)[number]
>

/** After reporting a pump issue, operator may finish transport once fuel is idle again. */
export function hasFuelPumpReportCompletionEligibility(
  context: FuelReportCompletionContext,
): boolean {
  if (isFuelWorkflowInProgress(context)) return false
  if (!context.isAdditionalFueling) return false
  if (context.fuelStep !== 'verify-pump') return false

  const transactions = context.fuelTransactions
  if (transactions.length === 0) return false

  const hasIssueTxn = transactions.some((row) => row.status === 'issue')
  const hasCompleteTxn = transactions.some((row) => row.status === 'complete')

  return hasIssueTxn && hasCompleteTxn
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

  if (
    fuelContext &&
    hasFuelPumpReportCompletionEligibility({
      fuelStep: fuelContext.fuelStep,
      fuelComplete: fuelContext.fuelComplete ?? false,
      isAdditionalFueling: fuelContext.isAdditionalFueling ?? false,
      fuelTransactions: fuelContext.fuelTransactions ?? [],
    })
  ) {
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
    return sections.includes('stall') ? ['stall'] : []
  }

  const isTransport =
    sections.includes('movement') &&
    sections.includes('fuel') &&
    !sections.includes('cleaning')

  return isTransport ? ['fuel'] : []
}

export function isVsaWorkflow(sections: WorkflowSection[]): boolean {
  return sections.includes('cleaning') && sections.includes('fuel')
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

/** Whether a section should show the Optional chip (not started yet). */
export function isSectionOptional(
  section: WorkflowSection,
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  fuelContext?: FuelWorkflowContext,
): boolean {
  const status = sectionStatus[section]

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

  if (status !== 'not-started') return false

  if (isVsaWorkflow(sections)) {
    if (section === 'stall' || VSA_PARALLEL_SECTIONS.includes(section)) {
      return true
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
  _completableSection?: WorkflowSection,
  fuelContext?: FuelWorkflowContext,
): boolean {
  const optional = new Set(getOptionalSections(sections))
  const fuelReportCompletionEligible =
    fuelContext &&
    hasFuelPumpReportCompletionEligibility({
      fuelStep: fuelContext.fuelStep,
      fuelComplete: fuelContext.fuelComplete ?? false,
      isAdditionalFueling: fuelContext.isAdditionalFueling ?? false,
      fuelTransactions: fuelContext.fuelTransactions ?? [],
    })

  return sections.some((section) => {
    const status = sectionStatus[section]
    if (status !== 'in-progress' && status !== 'missing') return false

    if (section === 'fuel' && fuelReportCompletionEligible) {
      return false
    }

    // Transport: once fuel has started, footer Complete stays disabled until fuel settles
    if (optional.has('fuel') && section === 'fuel') {
      return true
    }

    if (section === 'fuel' && fuelContext && isFuelPumpUnlockSyncPending(fuelContext)) {
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

/** Section to scroll to and expand when Complete is pressed but blocked. */
export function getSectionNeedingAttention(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  _acknowledgedSections: WorkflowSection[],
  options: {
    completableSection?: WorkflowSection
    workflowReady?: boolean
    fuelContext?: FuelWorkflowContext
    isSectionDisabled?: (section: WorkflowSection) => boolean
  } = {},
): WorkflowSection | null {
  const {
    completableSection,
    workflowReady = false,
    fuelContext,
    isSectionDisabled,
  } = options

  const isEnabled = (section: WorkflowSection) => !isSectionDisabled?.(section)

  if (
    hasBlockingSectionInProgress(
      sections,
      sectionStatus,
      completableSection,
      fuelContext,
    )
  ) {
    const blocking = sections.find((section) => {
      if (!isEnabled(section)) return false
      const status = sectionStatus[section]
      if (status !== 'in-progress' && status !== 'missing') return false
      return true
    })
    if (blocking) return blocking
  }

  if (
    sections.includes('movement') &&
    sectionStatus.movement !== 'complete' &&
    isEnabled('movement')
  ) {
    return 'movement'
  }

  if (isVsaWorkflow(sections) && !hasVsaCoreServiceComplete(sectionStatus)) {
    const next = VSA_PARALLEL_SECTIONS.find(
      (section) => isEnabled(section) && sectionStatus[section] !== 'complete',
    )
    if (next) return next
  }

  if (completableSection && isEnabled(completableSection)) {
    return completableSection
  }

  if (!workflowReady) {
    const optional = new Set(getOptionalSections(sections))
    const next = sections.find(
      (section) =>
        isEnabled(section) &&
        sectionStatus[section] !== 'complete' &&
        !(optional.has(section) && sectionStatus[section] === 'not-started'),
    )
    if (next) return next
  }

  return null
}

/** Short reason shown on a locked accordion section header. */
export function getSectionDisabledReason(
  section: WorkflowSection,
  context: Pick<
    FlowContext,
    | 'fuelComplete'
    | 'fuelStep'
    | 'isAdditionalFueling'
    | 'cleaningComplete'
    | 'cleaningStep'
  >,
  copy: Messages['workflow']['complete'],
): string | undefined {
  if (section === 'stall' && !isStallSectionUnlocked(context)) {
    return copy.finishCleaningOrFuel
  }
  return undefined
}

export function getCompleteDisabledReason(
  completableSection: WorkflowSection | undefined,
  sectionTitles: Record<WorkflowSection, string>,
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  copy: Messages['workflow']['complete'],
  odometerReading = '',
  fuelContext?: FuelWorkflowContext,
  workflowReady = false,
  mileageState?: VehicleMileageState,
  mileageOptions?: MileageResolutionOptions,
  vehicleCopy?: Pick<Messages['vehicle'], 'odometerFloorError' | 'milesUnit'>,
  locale = 'en-US',
): string | undefined {
  if (
    hasBlockingSectionInProgress(
      sections,
      sectionStatus,
      completableSection,
      fuelContext,
    )
  ) {
    return copy.finishActiveSection
  }
  if (!completableSection) {
    if (workflowReady) {
      return undefined
    }
    if (sections.includes('movement') && sectionStatus.movement !== 'complete') {
      return copy.finishMovement
    }
    if (isVsaWorkflow(sections)) {
      return sections.includes('stall')
        ? copy.finishCleaningOrFuelWithStall
        : copy.finishCleaningOrFuel
    }
    const optional = getOptionalSections(sections)
    if (optional.includes('fuel')) {
      return copy.finishMovementFuelOptional
    }
    return copy.finishSection
  }
  if (
    mileageState
      ? !hasResolvedOdometer(odometerReading, mileageState, mileageOptions)
      : !hasOdometerReading(odometerReading)
  ) {
    if (mileageState && vehicleCopy) {
      const odometerError = getOdometerValidationError(odometerReading, mileageState, vehicleCopy, {
        showPartial: true,
        locale,
      })
      if (odometerError) return odometerError
    }
    return copy.enterOdometer
  }
  return copy.acknowledgeSection.replace('{section}', sectionTitles[completableSection])
}

export function getVsaProgressCounts(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
): { completed: number; total: number } {
  const anyComplete = hasVsaCoreServiceComplete(sectionStatus)
  return { completed: anyComplete ? 1 : 0, total: 1 }
}
