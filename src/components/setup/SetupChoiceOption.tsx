import { trackProps } from '../../utils/tracking'

export function SetupChoiceOption({
  active,
  label,
  hint,
  trackTag,
  trackValue,
  onSelect,
}: {
  active: boolean
  label: string
  hint: string
  trackTag: string
  trackValue: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={`language-settings-option${active ? ' language-settings-option--active' : ''}`}
      {...trackProps(trackTag, { value: trackValue })}
    >
      <span className="language-settings-option__text">
        <span className="language-settings-option__label">{label}</span>
        <span className="language-settings-option__native">{hint}</span>
      </span>
      {active ? (
        <span className="language-settings-option__check" aria-hidden>
          ✓
        </span>
      ) : null}
    </button>
  )
}
