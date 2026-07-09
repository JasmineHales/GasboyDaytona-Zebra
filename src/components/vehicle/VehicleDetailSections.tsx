import { useI18n } from '../../i18n/I18nProvider'

export type VehicleDetailHoldWarning = {
  code: string
  title?: string
  message?: string
}

export type VehicleDetailSectionsProps = {
  licensePlate: string
  vin: string
  make: string
  model: string
  vehicleType: string
  color: string
  state: string
  holdWarning?: VehicleDetailHoldWarning | null
  carPriority?: string
  carTier?: string
}

function formatPriorityLabel(value: string): string {
  const normalized = value.trim()
  if (!normalized) return ''
  return normalized
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function priorityBadgeClass(value?: string): string {
  const normalized = value?.trim().toLowerCase() ?? ''
  if (normalized === 'low') return 'vehicle-search-card__value-badge--priority-low'
  if (normalized === 'medium') return 'vehicle-search-card__value-badge--priority-medium'
  if (normalized === 'high') return 'vehicle-search-card__value-badge--priority-high'
  return 'vehicle-search-card__value-badge--neutral'
}

function tierBadgeClass(value?: string): string {
  const normalized = value?.trim().toLowerCase() ?? ''
  if (normalized === 'reserve') return 'vehicle-search-card__value-badge--tier-reserve'
  if (normalized === 'premium') return 'vehicle-search-card__value-badge--tier-premium'
  return 'vehicle-search-card__value-badge--neutral'
}

export function VehicleSearchListCardHeader({
  licensePlate,
  vin,
}: Pick<VehicleDetailSectionsProps, 'licensePlate' | 'vin'>) {
  return (
    <div className="vehicle-search-card__identity">
      <p className="vehicle-search-card__plate">{licensePlate}</p>
      {vin ? (
        <p className="vehicle-search-card__vin" title={vin}>
          {vin}
        </p>
      ) : null}
    </div>
  )
}

export function VehicleSearchListCardExpanded({
  make,
  model,
  vehicleType,
  color,
  state,
  carPriority,
  carTier,
  holdWarning,
}: VehicleDetailSectionsProps) {
  const { messages, t } = useI18n()
  const copy = messages.vehicleSearch.results
  const makeModel = [make, model].filter(Boolean).join(' ')
  const tags = [makeModel, vehicleType, state, color].filter(Boolean)
  const holdTitle =
    holdWarning?.title ??
    (holdWarning?.code
      ? t('vehicle.holdWarning', { code: holdWarning.code })
      : null)

  const showPriorityTier = !holdWarning
  const priorityLabel = carPriority?.trim()
    ? formatPriorityLabel(carPriority)
    : copy.unsetValue
  const tierLabel = carTier?.trim() ? formatPriorityLabel(carTier) : copy.unsetValue
  const hasTags = tags.length > 0
  const hasExpandedContent = hasTags || showPriorityTier || holdWarning

  if (!hasExpandedContent) return null

  return (
    <div className="vehicle-search-card__expanded">
      {hasTags ? (
        <div className="vehicle-search-card__tags">
          {tags.map((tag) => (
            <span className="vehicle-search-card__tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {showPriorityTier || holdWarning ? (
        <div className="vehicle-search-card__metadata">
          {showPriorityTier ? (
            <>
              <div className="vehicle-search-card__meta-row">
                <span className="vehicle-search-card__meta-label">{copy.carPriority}</span>
                <span
                  className={`vehicle-search-card__value-badge ${
                    carPriority?.trim()
                      ? priorityBadgeClass(carPriority)
                      : 'vehicle-search-card__value-badge--neutral'
                  }`}
                >
                  {priorityLabel}
                </span>
              </div>
              <div className="vehicle-search-card__meta-row">
                <span className="vehicle-search-card__meta-label">{copy.carTier}</span>
                <span
                  className={`vehicle-search-card__value-badge ${
                    carTier?.trim()
                      ? tierBadgeClass(carTier)
                      : 'vehicle-search-card__value-badge--neutral'
                  }`}
                >
                  {tierLabel}
                </span>
              </div>
            </>
          ) : null}
          {holdWarning ? (
            <div className="vehicle-search-card__hold-panel" role="alert">
              <p className="vehicle-search-card__hold-heading">{copy.holdWarningHeading}</p>
              {holdTitle ? (
                <p className="vehicle-search-card__hold-title">{holdTitle}</p>
              ) : null}
              {holdWarning.message ? (
                <p className="vehicle-search-card__hold-message">{holdWarning.message}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
