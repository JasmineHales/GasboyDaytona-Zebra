type FuelUnlockModeInfoProps = {
  mode: 'remote' | 'on-site'
  onSwitch?: () => void
}

const copy = {
  remote: {
    label: 'Remote unlock',
    text: 'The pump unlocks in this app when you scan or enter the number.',
    switchLabel: 'Unlock at pump terminal instead',
  },
  'on-site': {
    label: 'On-site unlock',
    text: 'Unlock at the pump terminal first, then scan or enter the number here.',
    switchLabel: 'Unlock in app instead',
  },
} as const

export function FuelUnlockModeInfo({ mode, onSwitch }: FuelUnlockModeInfoProps) {
  const { label, text, switchLabel } = copy[mode]

  return (
    <div
      className={`fuel-unlock-mode-info fuel-unlock-mode-info--${mode}`}
    >
      <p className="fuel-unlock-mode-info__label">{label}</p>
      <p className="fuel-unlock-mode-info__text">{text}</p>
      {onSwitch && (
        <button
          type="button"
          onClick={onSwitch}
          className="fleet-btn fleet-btn-lg fleet-btn-link w-full"
        >
          {switchLabel}
        </button>
      )}
    </div>
  )
}
