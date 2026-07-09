import { useEffect, useId, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import {
  EMPTY_MANUAL_VEHICLE_ENTRY,
  getManualVehicleEntryFieldErrors,
  isManualVehicleEntryComplete,
  sanitizeManualVehicleEntryPatch,
  type ManualVehicleEntry,
  type ManualVehicleEntryFieldKey,
} from '../../utils/vehicleSearchManualEntry'
import {
  OWNING_AREA_ID_LENGTH,
  UNIT_NUMBER_LENGTH,
  VIN_LENGTH,
} from '../../utils/vehicleSearchIds'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { TextField } from '../ui/TextField'

type VehicleSearchManualEntryOverlayProps = {
  open: boolean
  entry: ManualVehicleEntry
  submitLabel: string
  onChange: (entry: ManualVehicleEntry) => void
  onClose: () => void
  onSubmit: () => void
}

const EMPTY_TOUCHED: Partial<Record<ManualVehicleEntryFieldKey, boolean>> = {}

export function VehicleSearchManualEntryOverlay({
  open,
  entry,
  submitLabel,
  onChange,
  onClose,
  onSubmit,
}: VehicleSearchManualEntryOverlayProps) {
  const titleId = useId()
  const { messages, t } = useI18n()
  const copy = messages.vehicleSearch.manualEntry
  const fieldCopy = messages.vehicleSearch.filters
  const [touched, setTouched] = useState(EMPTY_TOUCHED)

  const fieldErrors = useMemo(
    () =>
      getManualVehicleEntryFieldErrors(entry, copy.errors, {
        touchedOnly: true,
        touched,
      }),
    [copy.errors, entry, touched],
  )

  const canSubmit = useMemo(
    () =>
      isManualVehicleEntryComplete(entry) &&
      Object.keys(getManualVehicleEntryFieldErrors(entry, copy.errors)).length === 0,
    [copy.errors, entry],
  )

  useEffect(() => {
    if (!open) {
      setTouched(EMPTY_TOUCHED)
    }
  }, [open])

  const patch = (patch: Partial<ManualVehicleEntry>) => {
    onChange({ ...entry, ...sanitizeManualVehicleEntryPatch(patch) })
  }

  const markTouched = (field: ManualVehicleEntryFieldKey) => {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }))
  }

  const handleClearAll = () => {
    onChange(EMPTY_MANUAL_VEHICLE_ENTRY)
    setTouched(EMPTY_TOUCHED)
  }

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="vehicle-search.manual-entry.dismiss"
      labelId={titleId}
      sheetClassName="bottom-sheet-panel--fill"
    >
      <div className="vehicle-search-filters-overlay vehicle-search-manual-entry-overlay">
        <div className="shrink-0 pt-1">
          <div className="flex w-full items-center">
            <h2
              id={titleId}
              className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
            >
              {copy.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="field-target flex shrink-0 items-center justify-center rounded p-2"
              aria-label={t('common.close')}
              {...trackProps('vehicle-search.manual-entry.close')}
            >
              <X className="h-6 w-6 text-[var(--color-fleet-text)]" aria-hidden />
            </button>
          </div>
          <p className="vehicle-search-manual-entry-overlay__lead">{copy.lead}</p>
        </div>

        <div className="vehicle-search-filters-overlay__scroll app-scroll min-h-0 flex-1">
          <div className="vehicle-search-filters-sheet__grid vehicle-search-manual-entry-overlay__grid">
            <div className="vehicle-search-filter-field vehicle-search-manual-entry-overlay__field--full">
              <TextField
                label={fieldCopy.owningAreaId}
                value={entry.owningAreaId}
                error={fieldErrors.owningAreaId}
                invalid={Boolean(fieldErrors.owningAreaId)}
                onChange={(value) => patch({ owningAreaId: value })}
                onBlur={() => markTouched('owningAreaId')}
                placeholder={fieldCopy.selectOwningAreaId}
                inputMode="numeric"
                maxLength={OWNING_AREA_ID_LENGTH}
                autoComplete="off"
                onClear={() => patch({ owningAreaId: '' })}
                clearTrackTag="vehicle-search.manual-entry.owning-area-clear"
              />
            </div>
            <div className="vehicle-search-filter-field vehicle-search-manual-entry-overlay__field--full">
              <TextField
                label={fieldCopy.unitNumber}
                value={entry.unitNumber}
                error={fieldErrors.unitNumber}
                invalid={Boolean(fieldErrors.unitNumber)}
                onChange={(value) => patch({ unitNumber: value })}
                onBlur={() => markTouched('unitNumber')}
                placeholder={fieldCopy.unitNumberPlaceholder}
                inputMode="numeric"
                maxLength={UNIT_NUMBER_LENGTH}
                autoComplete="off"
                onClear={() => patch({ unitNumber: '' })}
                clearTrackTag="vehicle-search.manual-entry.unit-clear"
              />
            </div>
            <div className="vehicle-search-filter-field">
              <TextField
                label={fieldCopy.make}
                value={entry.make}
                onChange={(value) => patch({ make: value })}
                placeholder={fieldCopy.selectMake}
                autoComplete="off"
                onClear={() => patch({ make: '' })}
                clearTrackTag="vehicle-search.manual-entry.make-clear"
              />
            </div>
            <div className="vehicle-search-filter-field">
              <TextField
                label={fieldCopy.model}
                value={entry.model}
                onChange={(value) => patch({ model: value })}
                placeholder={fieldCopy.selectModel}
                autoComplete="off"
                onClear={() => patch({ model: '' })}
                clearTrackTag="vehicle-search.manual-entry.model-clear"
              />
            </div>
            <div className="vehicle-search-filter-field">
              <TextField
                label={fieldCopy.color}
                value={entry.color}
                onChange={(value) => patch({ color: value })}
                placeholder={fieldCopy.selectColor}
                autoComplete="off"
                onClear={() => patch({ color: '' })}
                clearTrackTag="vehicle-search.manual-entry.color-clear"
              />
            </div>
            <div className="vehicle-search-filter-field">
              <TextField
                label={fieldCopy.year}
                value={entry.year}
                onChange={(value) => patch({ year: value })}
                placeholder={copy.yearPlaceholder}
                inputMode="numeric"
                maxLength={4}
                autoComplete="off"
                onClear={() => patch({ year: '' })}
                clearTrackTag="vehicle-search.manual-entry.year-clear"
              />
            </div>
            <div className="vehicle-search-filter-field">
              <TextField
                label={fieldCopy.licensePlate}
                value={entry.licensePlate}
                onChange={(value) => patch({ licensePlate: value })}
                placeholder={fieldCopy.licensePlatePlaceholder}
                autoComplete="off"
                onClear={() => patch({ licensePlate: '' })}
                clearTrackTag="vehicle-search.manual-entry.plate-clear"
              />
            </div>
            <div className="vehicle-search-filter-field">
              <TextField
                label={fieldCopy.state}
                value={entry.state}
                onChange={(value) => patch({ state: value })}
                placeholder={fieldCopy.selectState}
                autoComplete="off"
                maxLength={2}
                onClear={() => patch({ state: '' })}
                clearTrackTag="vehicle-search.manual-entry.state-clear"
              />
            </div>
            <div className="vehicle-search-filter-field vehicle-search-manual-entry-overlay__vin">
              <TextField
                label={copy.vin}
                value={entry.vin}
                error={fieldErrors.vin}
                invalid={Boolean(fieldErrors.vin)}
                onChange={(value) => patch({ vin: value })}
                onBlur={() => markTouched('vin')}
                placeholder={copy.vinPlaceholder}
                hint={fieldErrors.vin ? undefined : copy.vinHint}
                autoComplete="off"
                maxLength={VIN_LENGTH}
                onClear={() => patch({ vin: '' })}
                clearTrackTag="vehicle-search.manual-entry.vin-clear"
              />
            </div>
          </div>
        </div>

        <div className="vehicle-search-filters-overlay__footer bottom-sheet-footer workflow-stack shrink-0">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated w-full"
            {...trackProps('vehicle-search.manual-entry.submit')}
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="fleet-btn fleet-btn-lg fleet-btn-outlined w-full"
            {...trackProps('vehicle-search.manual-entry.clear-all')}
          >
            {copy.clearAll}
          </button>
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
