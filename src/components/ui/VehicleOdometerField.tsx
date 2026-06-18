import { forwardRef, useId, useState } from 'react'
import { Lock } from 'lucide-react'
import { getOdometerFloorValidationError } from '../../utils/mileageResolution'
import { trackProps } from '../../utils/tracking'

type VehicleOdometerFieldProps = {
  odometerReading: string
  onOdometerChange: (value: string) => void
  verified?: boolean
  hint?: string
  minimumMiles?: number | null
}

function formatOdometerDisplay(digits: string) {
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

export const VehicleOdometerField = forwardRef<HTMLDivElement, VehicleOdometerFieldProps>(
  function VehicleOdometerField(
    { odometerReading, onOdometerChange, verified = false, hint, minimumMiles = null },
    ref,
  ) {
    const odometerId = useId()
    const hintId = `${odometerId}-hint`
    const errorId = `${odometerId}-error`
    const [odometerFocused, setOdometerFocused] = useState(false)
    const [odometerTouched, setOdometerTouched] = useState(false)

    const handleOdometerChange = (raw: string) => {
      if (verified) return
      onOdometerChange(raw.replace(/\D/g, '').slice(0, 7))
    }

    const formattedMiles = formatOdometerDisplay(odometerReading)

    if (verified) {
      return (
        <div
          ref={ref}
          className="vehicle-card__odometer vehicle-card__odometer--verified"
          data-tutorial="vehicle-odometer"
        >
          <div className="vehicle-card__odometer-compact">
            <span className="vehicle-card__odometer-compact-label">Odometer</span>
            <span className="vehicle-card__odometer-compact-value">
              {formattedMiles} mi
            </span>
            <span className="vehicle-card__odometer-verified-chip">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Verified
            </span>
          </div>
        </div>
      )
    }

    const displayValue = odometerFocused
      ? odometerReading
      : formatOdometerDisplay(odometerReading)
    const error = getOdometerFloorValidationError(odometerReading, minimumMiles, {
      showPartial: odometerTouched,
    })
    const showError = Boolean(error)
    const describedBy = [hint ? hintId : null, showError ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined

    return (
      <div
        ref={ref}
        className="vehicle-card__odometer vehicle-card__odometer--required"
        data-tutorial="vehicle-odometer"
      >
        <label htmlFor={odometerId} className="vehicle-card__odometer-label">
          Odometer
        </label>
        {hint && (
          <p id={hintId} className="vehicle-card__odometer-hint">
            {hint}
          </p>
        )}
        <div
          className={`vehicle-card__odometer-field${showError ? ' vehicle-card__odometer-field--error' : ''}`}
        >
          <input
            id={odometerId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={displayValue}
            onChange={(event) => handleOdometerChange(event.target.value)}
            onFocus={() => setOdometerFocused(true)}
            onBlur={() => {
              setOdometerFocused(false)
              setOdometerTouched(true)
            }}
            placeholder="Enter mileage"
            className="vehicle-card__odometer-input"
            aria-invalid={showError || undefined}
            aria-describedby={describedBy}
            {...trackProps('vehicle.odometer', { verified: false })}
          />
          <span id={`${odometerId}-suffix`} className="vehicle-card__odometer-suffix">
            mi
          </span>
        </div>
        {showError && error && (
          <p id={errorId} className="vehicle-card__odometer-error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
