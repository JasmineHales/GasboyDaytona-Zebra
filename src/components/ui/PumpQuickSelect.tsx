import { trackProps } from '../../utils/tracking'

type PumpQuickSelectProps = {
  pump: string
  hint: string
  onSelect: (pump: string) => void
  remoteAccent?: boolean
  trackTag?: string
}

export function PumpQuickSelect({
  pump,
  hint,
  onSelect,
  remoteAccent = false,
  trackTag = 'pump.verify.quick-select',
}: PumpQuickSelectProps) {
  return (
    <div className="pump-verify-quick-select">
      <p className="pump-verify-quick-select__label">Quick select</p>
      <button
        type="button"
        onClick={() => onSelect(pump)}
        className={`pump-verify-quick-select__option${remoteAccent ? ' pump-verify-quick-select__option--remote' : ''}`}
        {...trackProps(trackTag)}
      >
        <span className="pump-verify-quick-select__pump">Pump {pump}</span>
        <span className="pump-verify-quick-select__hint">{hint}</span>
      </button>
    </div>
  )
}
