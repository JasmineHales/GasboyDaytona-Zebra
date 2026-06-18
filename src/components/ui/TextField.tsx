import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { trackProps } from '../../utils/tracking'

type TextFieldProps = {
  label?: string
  hint?: string
  error?: string
  invalid?: boolean
  value: string
  onChange?: (value: string) => void
  onClear?: () => void
  clearTrackTag?: string
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
  | 'aria-label'
>

export function TextField({
  label,
  hint,
  error,
  invalid = false,
  value,
  onChange,
  onClear,
  clearTrackTag = 'field.clear',
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
  'aria-label': ariaLabel,
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
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
      {label && (
        <label
          htmlFor={inputId}
          id={readOnly ? `${inputId}-label` : undefined}
          className="fleet-field__label"
        >
          {label}
        </label>
      )}
      {hint && (
        <p id={hintId} className="fleet-field__hint">
          {hint}
        </p>
      )}

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
          <span
            className="fleet-field__value"
            id={inputId}
            aria-labelledby={label ? `${inputId}-label` : undefined}
          >
            {value}
          </span>
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            role={role}
            value={value}
            placeholder={placeholder}
            inputMode={inputMode}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            disabled={disabled}
            aria-invalid={hasErrorState || undefined}
            aria-describedby={describedBy}
            aria-label={!label ? ariaLabel : undefined}
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
            aria-label={`Clear ${label ?? 'field'}`}
            {...trackProps(clearTrackTag)}
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

      {error && (
        <p id={errorId} className="fleet-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

type TextAreaFieldProps = {
  label?: string
  hint?: string
  error?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  clearTrackTag?: string
  placeholder?: string
  className?: string
  rows?: number
}

export function TextAreaField({
  label,
  hint,
  error,
  value,
  onChange,
  onClear,
  clearTrackTag = 'field.clear',
  placeholder,
  className = '',
  rows = 8,
}: TextAreaFieldProps) {
  const inputId = useId()
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const hasErrorState = Boolean(error)
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
      {label && (
        <label htmlFor={inputId} className="fleet-field__label">
          {label}
        </label>
      )}
      {hint && (
        <p id={hintId} className="fleet-field__hint">
          {hint}
        </p>
      )}
      <div className={`fleet-field fleet-field--textarea${hasErrorState ? ' fleet-field--error' : ''}`}>
        <textarea
          id={inputId}
          value={value}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={hasErrorState || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className="fleet-field__textarea"
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="field-target absolute top-3 right-3 flex shrink-0 items-center justify-center"
            aria-label={`Clear ${label ?? 'field'}`}
            {...trackProps(clearTrackTag)}
          >
            <X className="h-5 w-5 text-[var(--color-fleet-info)]" />
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="fleet-field__error" role="alert">
          {error}
        </p>
      )}
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
