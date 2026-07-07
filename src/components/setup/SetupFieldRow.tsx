import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useId } from 'react'
import { trackProps } from '../../utils/tracking'

type SetupFieldRowProps = {
  label: string
  value?: string
  placeholder?: string
  valueDetail?: ReactNode
  onPress: () => void
  trackTag: string
  emphasized?: boolean
}

export function SetupFieldRow({
  label,
  value,
  placeholder,
  valueDetail,
  onPress,
  trackTag,
  emphasized = false,
}: SetupFieldRowProps) {
  const labelId = useId()
  const unset = !value
  const displayValue = value ?? placeholder ?? ''

  return (
    <button
      type="button"
      className={`setup-field-row${emphasized ? ' setup-field-row--emphasized' : ''}${unset ? ' setup-field-row--unset' : ''}`}
      aria-labelledby={labelId}
      aria-haspopup="dialog"
      onClick={onPress}
      {...trackProps(trackTag)}
    >
      <span className="setup-field-row__copy">
        <span id={labelId} className="setup-field-row__label">
          {label}
        </span>
        <span className="setup-field-row__value-row">
          <span
            className={`setup-field-row__value${unset ? ' setup-field-row__value--unset' : ''}`}
          >
            {displayValue}
          </span>
          {!unset ? valueDetail : null}
        </span>
      </span>
      <ChevronRight className="setup-field-row__chevron" aria-hidden />
    </button>
  )
}
