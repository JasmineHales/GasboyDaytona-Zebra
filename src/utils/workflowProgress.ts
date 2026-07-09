import type { FlowContext, FuelStep, FuelTransaction, SectionStatus, WorkflowSection } from '../types/flow'
import type { Messages } from '../i18n/types'
import {
  getOdometerValidationError,
  hasOdometerReading,
  hasResolvedOdometer,
  type MileageResolutionOptions,
  type VehicleMileageState,
} from './mileageResolution'

export type WorkflowKind = 'transport' | 'vsa' | 'fuel'

const VSA_CORE_SECTIONS: WorkflowSection[] = ['cleaning', 'fuel']

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

/** Transport: fuel can be skipped when never started. VSA: fuel and stall are skippable. */
export function getOptionalSections(
  sections: WorkflowSection[],
  workflowKind?: WorkflowKind,
): WorkflowSection[] {
  if (isVsaWorkflow(sections, workflowKind)) {
    const optional: WorkflowSection[] = ['fuel']
    if (sections.includes('stall')) optional.push('stall')
    return optional
  }

  const isTransport =
    sections.includes('movement') &&
    sections.includes('fuel') &&
    !sections.includes('cleaning')

  return isTransport ? ['fuel'] : []
}

export function isVsaWorkflow(
  sections: WorkflowSection[],
  workflowKind?: WorkflowKind,
): boolean {
  if (workflowKind === 'vsa') return true
  if (workflowKind === 'fuel' || workflowKind === 'transport') return false
  return sections.includes('cleaning') || (sections.includes('stall') && !sections.includes('movement'))
}

/** Fuel (and legacy cleaning) can be acknowledged independently on VSA. */
export function getParallelSections(
  sections: WorkflowSection[],
  workflowKind?: WorkflowKind,
): WorkflowSection[] {
  return isVsaWorkflow(sections, workflowKind) ? VSA_CORE_SECTIONS : []
}

export function hasVsaCoreServiceComplete(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
): boolean {
  return VSA_CORE_SECTIONS.some(
    (section) => sectionStatus[section] === 'complete',
  )
}

export function hasVsaCoreServiceAcknowledged(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
): boolean {
  return VSA_CORE_SECTIONS.some(
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
  workflowKind?: WorkflowKind,
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
    if (isVsaWorkflow(sections, workflowKind) && hasVsaCoreServiceComplete(sectionStatus)) {
      return true
    }
  }

  if (status !== 'not-started') return false

  if (isVsaWorkflow(sections, workflowKind)) {
    if (section === 'stall' || section === 'fuel') {
      return true
    }
  }

  return getOptionalSections(sections, workflowKind).includes(section)
}

/** Accordion header chip — required sections awaiting input use the mileage-style Required badge. */
export function shouldShowSectionRequiredChip(
  section: WorkflowSection,
  sectionOptional: boolean,
  status: SectionStatus,
  workflowKind?: WorkflowKind,
): boolean {
  if (sectionOptional || status === 'complete' || status === 'missing') return false
  if (status === 'in-progress') {
    return workflowKind === 'vsa' && section === 'cleaning'
  }
  return true
}

export function getRequiredSections(
  sections: WorkflowSection[],
  workflowKind?: WorkflowKind,
): WorkflowSection[] {
  if (isVsaWorkflow(sections, workflowKind)) {
    return []
  }

  const optional = new Set(getOptionalSections(sections, workflowKind))
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
  const optionalSections = getOptionalSections(sections, 'vsa')

  return sections.every((section) => {
    if (section === 'fuel' && fuelContext && isFuelPumpUnlockSyncPending(fuelContext)) {
      return true
    }

    return isSectionSatisfiedForFinish(
      section,
      sectionStatus[section],
      acknowledgedSections,
      optionalSections,
    )
  })
}

export function isWorkflowReadyToFinish(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
  fuelContext?: FuelWorkflowContext,
  workflowKind?: WorkflowKind,
): boolean {
  if (isVsaWorkflow(sections, workflowKind)) {
    return isVsaWorkflowReadyToFinish(
      sections,
      sectionStatus,
      acknowledgedSections,
      fuelContext,
    )
  }

  const optionalSections = getOptionalSections(sections, workflowKind)

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
  workflowKind?: WorkflowKind,
): boolean {
  const optional = new Set(getOptionalSections(sections, workflowKind))
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

    // Optional service sections block Complete once started.
    if (optional.has(section) && (section === 'fuel' || section === 'cleaning')) {
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
    workflowKind?: WorkflowKind
  } = {},
): WorkflowSection | null {
  const {
    completableSection,
    workflowReady = false,
    fuelContext,
    isSectionDisabled,
    workflowKind,
  } = options

  const isEnabled = (section: WorkflowSection) => !isSectionDisabled?.(section)

  if (
    hasBlockingSectionInProgress(
      sections,
      sectionStatus,
      completableSection,
      fuelContext,
      workflowKind,
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

  if (completableSection && isEnabled(completableSection)) {
    return completableSection
  }

  if (!workflowReady) {
    const optional = new Set(getOptionalSections(sections, workflowKind))
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

export function hasDefiniteGasboyFuelingRecorded(
  context: Pick<
    FlowContext,
    'fuelComplete' | 'fuelStep' | 'fuelTransactions' | 'fuelGallonsDispensed'
  >,
): boolean {
  if (context.fuelComplete) return true
  if (
    context.fuelStep === 'fueling-complete' ||
    context.fuelStep === 'additional-fueling-complete'
  ) {
    return true
  }
  if (context.fuelGallonsDispensed.trim().length > 0) return true
  return context.fuelTransactions.some((row) => row.status === 'complete')
}

/** Gasboy fuel was recorded but the workflow Complete step was not acknowledged yet. */
export function shouldRequireFuelCompleteBeforeExit(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
  context: Pick<
    FlowContext,
    'locationType' | 'fuelComplete' | 'fuelStep' | 'fuelTransactions' | 'fuelGallonsDispensed'
  >,
): boolean {
  if (context.locationType !== 'gasboy') return false
  if (!sections.includes('fuel')) return false
  if (!hasDefiniteGasboyFuelingRecorded(context)) return false
  if (sectionStatus.fuel !== 'complete') return false
  return !acknowledgedSections.includes('fuel')
}

function isGasboyFuelSessionBlockingExit(
  context: Pick<
    FlowContext,
    'locationType' | 'fuelComplete' | 'fuelStep' | 'isAdditionalFueling'
  >,
): boolean {
  if (context.locationType !== 'gasboy') return false
  return isFuelWorkflowInProgress(context)
}

/** Block workflow exit while Gasboy fuel is active or awaiting workflow completion. */
export function getGasboyFuelExitBlockMode(
  sections: WorkflowSection[],
  sectionStatus: Record<WorkflowSection, SectionStatus>,
  acknowledgedSections: WorkflowSection[],
  context: Pick<
    FlowContext,
    | 'locationType'
    | 'fuelComplete'
    | 'fuelStep'
    | 'fuelTransactions'
    | 'fuelGallonsDispensed'
    | 'isAdditionalFueling'
  >,
): 'complete-fuel' | 'fuel-in-progress' | null {
  if (context.locationType !== 'gasboy') return null
  if (!sections.includes('fuel')) return null

  if (
    shouldRequireFuelCompleteBeforeExit(
      sections,
      sectionStatus,
      acknowledgedSections,
      context,
    )
  ) {
    return 'complete-fuel'
  }

  if (isGasboyFuelSessionBlockingExit(context)) {
    return 'fuel-in-progress'
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
  workflowKind?: WorkflowKind,
): string | undefined {
  if (
    hasBlockingSectionInProgress(
      sections,
      sectionStatus,
      completableSection,
      fuelContext,
      workflowKind,
    )
  ) {
    return copy.finishActiveSection
  }
  if (!completableSection && !workflowReady) {
    if (sections.includes('movement') && sectionStatus.movement !== 'complete') {
      return copy.finishMovement
    }
    if (isVsaWorkflow(sections, workflowKind)) {
      const optional = getOptionalSections(sections, workflowKind)
      const pendingRequired = sections.some(
        (section) =>
          !optional.includes(section) &&
          sectionStatus[section] !== 'complete' &&
          sectionStatus[section] !== 'not-started',
      )
      if (pendingRequired) {
        return sections.includes('stall')
          ? copy.finishFuelWithStall
          : copy.finishFuel
      }
      return copy.finishSection
    }
    const optional = getOptionalSections(sections, workflowKind)
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
  if (!completableSection) {
    return undefined
  }
  return copy.acknowledgeSection.replace('{section}', sectionTitles[completableSection])
}

export function getVsaProgressCounts(
  sectionStatus: Record<WorkflowSection, SectionStatus>,
): { completed: number; total: number } {
  const anyComplete = hasVsaCoreServiceComplete(sectionStatus)
  return { completed: anyComplete ? 1 : 0, total: 1 }
}
