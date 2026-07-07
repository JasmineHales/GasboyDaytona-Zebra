import { ChevronDown, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { slugifyTrackValue, trackProps } from '../../utils/tracking'

export type SelectFieldOption = {
  value: string
  label: string
}

type SearchableSelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectFieldOption[]
  placeholder?: string
  disabled?: boolean
  trackTag?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  normalizeInput?: (value: string) => string
}

export function SearchableSelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select',
  disabled = false,
  trackTag,
  inputMode,
  maxLength,
  normalizeInput,
}: SearchableSelectFieldProps) {
  const { messages } = useI18n()
  const inputId = useId()
  const listId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? ''

  const filteredOptions = useMemo(() => {
    const trimmed = (normalizeInput ? normalizeInput(query) : query).trim().toLowerCase()
    if (!trimmed) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(trimmed),
    )
  }, [options, query, normalizeInput])

  useEffect(() => {
    if (!open || !wrapperRef.current) return
    wrapperRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [open])

  const handleFocus = () => {
    if (disabled) return
    setOpen(true)
    setQuery(selectedLabel)
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
    setQuery('')
  }

  const handleClear = () => {
    onChange('')
    setQuery('')
    setOpen(false)
  }

  const inputValue = open ? query : selectedLabel

  return (
    <div className="vehicle-search-filter-field" ref={wrapperRef}>
      <label htmlFor={inputId} className="fleet-field__label">
        {label}
      </label>
      <div
        className={`vehicle-search-filter-field__wrapper${
          open ? ' vehicle-search-filter-field__wrapper--open' : ''
        }`}
      >
        <div
          className={`fleet-field vehicle-search-filter-field__control${
            disabled ? ' fleet-field--disabled' : ''
          }${open ? ' vehicle-search-filter-field__control--open' : ''}`}
        >
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            disabled={disabled}
            value={inputValue}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={maxLength}
            onFocus={handleFocus}
            onChange={(event) => {
              const next = normalizeInput
                ? normalizeInput(event.target.value)
                : event.target.value
              setQuery(next)
              setOpen(true)
            }}
            className="fleet-field__input vehicle-search-filter-field__input"
            {...(trackTag ? trackProps(trackTag) : {})}
          />
          {value && !disabled ? (
            <button
              type="button"
              className="vehicle-search-filter-field__clear"
              aria-label={messages.common.close}
              onClick={handleClear}
              {...trackProps(`${trackTag ?? 'vehicle-search.filter'}.clear`, {
                value: slugifyTrackValue(value),
              })}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <ChevronDown
              className="vehicle-search-filter-field__chevron"
              aria-hidden
            />
          )}
        </div>

        {open && !disabled && (
          <ul
            id={listId}
            role="listbox"
            className="vehicle-search-filter-field__list"
          >
            {filteredOptions.length === 0 ? (
              <li className="vehicle-search-filter-field__empty" role="presentation">
                {messages.vehicleSearch.filters.noMatches}
              </li>
            ) : (
              filteredOptions.map((option) => {
                const selected = option.value === value
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`vehicle-search-filter-field__option${
                        selected ? ' vehicle-search-filter-field__option--selected' : ''
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(option.value)}
                      {...trackProps(`${trackTag ?? 'vehicle-search.filter'}.choose`, {
                        value: slugifyTrackValue(option.value),
                      })}
                    >
                      {option.label}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

/** @deprecated Use SearchableSelectField */
export const SelectField = SearchableSelectField
