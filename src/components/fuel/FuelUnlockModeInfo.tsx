import { ArrowLeftRight } from 'lucide-react'
import { trackProps } from '../../utils/tracking'

type FuelUnlockModeInfoProps = {
  mode: 'remote' | 'on-site'
  onSwitch?: () => void
  trackPrefix?: string
}

const copy = {
  remote: {
    label: 'Remote unlock',
    text: 'The pump unlocks in this app when you scan or enter the number.',
    switchLabel: 'Switch to on-site terminal unlock',
  },
  'on-site': {
    label: 'On-site terminal unlock',
    text: 'Unlock at the pump terminal first, then scan or enter the number here.',
    switchLabel: 'Switch to remote unlock',
  },
} as const

export function FuelUnlockModeInfo({
  mode,
  onSwitch,
  trackPrefix = 'fuel.unlock-mode',
}: FuelUnlockModeInfoProps) {
  const { label, text, switchLabel } = copy[mode]

  return (
    <div className="fuel-unlock-mode-info">
      <div className="fuel-unlock-mode-info__copy">
        <p className="fuel-unlock-mode-info__label">{label}</p>
        <p className="fuel-unlock-mode-info__text">{text}</p>
      </div>
      {onSwitch && (
        <button
          type="button"
          onClick={onSwitch}
          className="fuel-unlock-mode-info__switch"
          {...trackProps(`${trackPrefix}.switch`, { mode })}
        >
          <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden />
          {switchLabel}
        </button>
      )}
    </div>
  )
}
