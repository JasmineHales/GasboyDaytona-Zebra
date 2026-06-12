import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'

type TextFieldProps = {
  label?: string
  hint?: string
  error?: string
  invalid?: boolean
  value: string
  onChange?: (value: string) => void
  onClear?: () => void
  startIcon?: LucideIcon
  endAdornment?: ReactNode
  readOnly?: boolean
  className?: string
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'placeholder'
  | 'inputMode'
  | 'type'
  | 'autoComplete'
  | 'autoFocus'
  | 'onBlur'
  | 'onKeyDown'
  | 'id'
  | 'name'
  | 'disabled'
  | 'role'
>

export function TextField({
  label,
  hint,
  error,
  invalid = false,
  value,
  onChange,
  onClear,
  startIcon: StartIcon,
  endAdornment,
  readOnly = false,
  className = '',
  placeholder,
  inputMode,
  type = 'text',
  autoComplete,
  autoFocus,
  onBlur,
  onKeyDown,
  id,
  name,
  disabled,
  role,
}: TextFieldProps) {
  const hasErrorState = Boolean(error || invalid)
  const canClear = Boolean(onClear || onChange)
  const showClear = Boolean(canClear && value && !disabled)

  const handleClear = () => {
    if (onClear) {
      onClear()
      return
    }
    onChange?.('')
  }

  return (
    <div className={`workflow-stack ${className}`}>
      {label && <p className="fleet-field__label">{label}</p>}
      {hint && <p className="fleet-field__hint">{hint}</p>}

      <div
        className={`fleet-field ${hasErrorState ? 'fleet-field--error' : ''} ${
          disabled ? 'fleet-field--disabled' : ''
        }`}
      >
        {StartIcon && (
          <StartIcon
            className="h-5 w-5 shrink-0 text-[var(--color-fleet-text-secondary)]"
            aria-hidden
          />
        )}

        {readOnly ? (
          <span className="fleet-field__value">{value}</span>
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            role={role}
            value={value}
            placeholder={placeholder}
            inputMode={inputMode}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            className="fleet-field__input"
          />
        )}

        {endAdornment}

        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="field-target flex shrink-0 items-center justify-center"
            aria-label="Clear"
          >
            <X
              className={`h-5 w-5 ${
                hasErrorState
                  ? 'text-[var(--color-fleet-text-red)]'
                  : 'text-[var(--color-fleet-info)]'
              }`}
            />
          </button>
        )}
      </div>

      {error && <p className="fleet-field__error">{error}</p>}
    </div>
  )
}

type TextAreaFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  rows?: number
}

export function TextAreaField({
  label,
  value,
  onChange,
  onClear,
  placeholder,
  className = '',
  rows = 8,
}: TextAreaFieldProps) {
  const showClear = Boolean(value)

  const handleClear = () => {
    if (onClear) {
      onClear()
      return
    }
    onChange('')
  }

  return (
    <div className={`workflow-stack ${className}`}>
      {label && <p className="fleet-field__label">{label}</p>}
      <div className="fleet-field fleet-field--textarea">
        <textarea
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="fleet-field__textarea"
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="field-target absolute top-3 right-3 flex shrink-0 items-center justify-center"
            aria-label="Clear"
          >
            <X className="h-5 w-5 text-[var(--color-fleet-info)]" />
          </button>
        )}
      </div>
    </div>
  )
}

export function textFieldKeySubmit(
  event: KeyboardEvent<HTMLInputElement>,
  onSubmit: (value: string) => void,
) {
  if (event.key !== 'Enter') return
  const value = event.currentTarget.value.trim()
  if (value) onSubmit(value)
}
