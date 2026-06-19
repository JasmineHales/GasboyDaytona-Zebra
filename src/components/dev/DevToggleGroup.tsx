import { trackProps } from '../../utils/tracking'

export type DevToggleOption<T extends string> = {
  value: T
  label: string
}

type DevToggleGroupProps<T extends string> = {
  label: string
  hint?: string
  value: T
  options: DevToggleOption<T>[]
  onChange: (value: T) => void
  trackTag: string
}

export function DevToggleGroup<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
  trackTag,
}: DevToggleGroupProps<T>) {
  return (
    <div className="dev-toggle-group">
      <div className="dev-toggle-group__header">
        <p className="dev-toggle-group__label">{label}</p>
        {hint && <p className="dev-toggle-group__hint">{hint}</p>}
      </div>
      <div className="dev-toggle-group__options" role="group" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`dev-toggle-group__option${active ? ' dev-toggle-group__option--active' : ''}`}
              {...trackProps(trackTag, { value: option.value })}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
