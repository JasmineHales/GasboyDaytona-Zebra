import { forwardRef, useId, useState } from 'react'
import { Lock } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { localeForLanguage } from '../../i18n/localeFormat'
import { getOdometerFloorValidationError } from '../../utils/mileageResolution'
import { trackProps } from '../../utils/tracking'

type VehicleOdometerFieldProps = {
  odometerReading: string
  onOdometerChange: (value: string) => void
  verified?: boolean
  minimumMiles?: number | null
  /** Inside workflow-odometer-card — heading rendered by parent. */
  embedded?: boolean
}

function formatOdometerDisplay(digits: string, locale: string) {
  if (!digits) return ''
  return Number(digits).toLocaleString(locale)
}

export const VehicleOdometerField = forwardRef<HTMLDivElement, VehicleOdometerFieldProps>(
  function VehicleOdometerField(
    {
      odometerReading,
      onOdometerChange,
      verified = false,
      minimumMiles = null,
      embedded = false,
    },
    ref,
  ) {
    const { language, messages, t } = useI18n()
    const locale = localeForLanguage(language)
    const vehicleCopy = messages.vehicle
    const odometerId = useId()
    const errorId = `${odometerId}-error`
    const [odometerFocused, setOdometerFocused] = useState(false)
    const [odometerTouched, setOdometerTouched] = useState(() => {
      if (verified) return false
      const error = getOdometerFloorValidationError(odometerReading, minimumMiles, vehicleCopy, {
        showPartial: true,
        locale,
      })
      return Boolean(error)
    })

    const handleOdometerChange = (raw: string) => {
      if (verified) return
      onOdometerChange(raw.replace(/\D/g, '').slice(0, 7))
    }

    const formattedMiles = formatOdometerDisplay(odometerReading, locale)

    if (verified) {
      return (
        <div
          ref={ref}
          className={`vehicle-card__odometer vehicle-card__odometer--verified${embedded ? ' vehicle-card__odometer--embedded' : ''}`}
        >
          <div className="vehicle-card__odometer-compact">
            {!embedded ? (
              <span className="vehicle-card__odometer-compact-label">{t('vehicle.odometer')}</span>
            ) : null}
            <span className="vehicle-card__odometer-compact-value">
              {formattedMiles} {vehicleCopy.milesUnit}
            </span>
            <span className="vehicle-card__odometer-verified-chip">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {t('vehicle.verified')}
            </span>
          </div>
        </div>
      )
    }

    const displayValue = odometerFocused
      ? odometerReading
      : formatOdometerDisplay(odometerReading, locale)
    const error = getOdometerFloorValidationError(odometerReading, minimumMiles, vehicleCopy, {
      showPartial: odometerTouched,
      locale,
    })
    const showError = Boolean(error)
    const describedBy = showError ? errorId : undefined

    return (
      <div
        ref={ref}
        className={`vehicle-card__odometer vehicle-card__odometer--required${embedded ? ' vehicle-card__odometer--embedded' : ''}`}
      >
        {!embedded ? (
          <div className="vehicle-card__odometer-heading">
            <label htmlFor={odometerId} className="vehicle-card__odometer-label">
              {t('vehicle.odometer')}
            </label>
            <span className="vehicle-card__odometer-required-chip">{t('workflow.required')}</span>
          </div>
        ) : null}
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
            placeholder={t('vehicle.enterMileage')}
            className="vehicle-card__odometer-input"
            aria-invalid={showError || undefined}
            aria-describedby={describedBy}
            {...trackProps('vehicle.odometer', { verified: false })}
          />
          <span id={`${odometerId}-suffix`} className="vehicle-card__odometer-suffix">
            {vehicleCopy.milesUnit}
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
