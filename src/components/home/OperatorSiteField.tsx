import { useId } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  DEFAULT_OPERATOR_SITE,
  OPERATOR_SITE_CATALOG,
  type OperatorSiteId,
} from '../../utils/operatorSites'
import { trackProps } from '../../utils/tracking'

type OperatorSiteFieldProps = {
  value: string
  onChange: (site: OperatorSiteId) => void
}

export function OperatorSiteField({ value, onChange }: OperatorSiteFieldProps) {
  const groupId = useId()
  const { messages } = useI18n()
  const copy = messages.home.location

  return (
    <fieldset className="operator-site-field">
      <legend id={groupId} className="operator-site-field__legend">
        {copy.loginLabel}
      </legend>
      <p className="operator-site-field__hint">{copy.loginHint}</p>
      <div className="operator-site-field__options" role="radiogroup" aria-labelledby={groupId}>
        {OPERATOR_SITE_CATALOG.map((entry) => {
          const active = (value || DEFAULT_OPERATOR_SITE) === entry.name
          return (
            <button
              key={entry.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${entry.name}, ${entry.code}`}
              onClick={() => onChange(entry.name as OperatorSiteId)}
              className={`operator-site-field__option${active ? ' operator-site-field__option--active' : ''}`}
              {...trackProps('login.operator-site.select', { value: entry.name })}
            >
              <span className="operator-site-field__option-copy">
                <span className="operator-site-field__option-name">{entry.name}</span>
                <span className="operator-site-search__code">{entry.code}</span>
              </span>
              {active ? (
                <span className="operator-site-field__option-check" aria-hidden>
                  ✓
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
