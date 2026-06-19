import { ArrowLeftRight } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'

type FuelUnlockModeInfoProps = {
  mode: 'remote' | 'on-site'
  onSwitch?: () => void
  trackPrefix?: string
}

export function FuelUnlockModeInfo({
  mode,
  onSwitch,
  trackPrefix = 'fuel.unlock-mode',
}: FuelUnlockModeInfoProps) {
  const { messages } = useI18n()
  const copy = mode === 'remote' ? messages.fuel.unlockMode.remote : messages.fuel.unlockMode.onSite

  return (
    <div className="fuel-unlock-mode-info">
      <div className="fuel-unlock-mode-info__copy">
        <p className="fuel-unlock-mode-info__label">{copy.label}</p>
        <p className="fuel-unlock-mode-info__text">{copy.text}</p>
      </div>
      {onSwitch && (
        <button
          type="button"
          onClick={onSwitch}
          className="fuel-unlock-mode-info__switch"
          {...trackProps(`${trackPrefix}.switch`, { mode })}
        >
          <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden />
          {copy.switchLabel}
        </button>
      )}
    </div>
  )
}
