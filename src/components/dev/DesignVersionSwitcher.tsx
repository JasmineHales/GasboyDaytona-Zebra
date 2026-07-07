import { DESIGN_VERSIONS, type DesignVersion } from '../../utils/designVersion'
import { trackProps } from '../../utils/tracking'

type DesignVersionSwitcherProps = {
  designVersion: DesignVersion
  onDesignVersionChange: (version: DesignVersion) => void
  compact?: boolean
  className?: string
}

export function DesignVersionSwitcher({
  designVersion,
  onDesignVersionChange,
  compact = false,
  className = '',
}: DesignVersionSwitcherProps) {
  return (
    <div
      className={`dev-design-switcher${compact ? ' dev-design-switcher--compact' : ''}${className ? ` ${className}` : ''}`}
      role="group"
      aria-label="Design version"
    >
      {!compact ? (
        <p className="dev-design-switcher__label">Design version</p>
      ) : null}
      <div className="dev-design-switcher__buttons">
        {DESIGN_VERSIONS.map((version) => (
          <button
            key={version}
            type="button"
            className={`dev-design-switcher__button${
              designVersion === version ? ' dev-design-switcher__button--active' : ''
            }`}
            aria-pressed={designVersion === version}
            onClick={() => onDesignVersionChange(version)}
            {...trackProps('dev.flow-nav.design-version', { version })}
          >
            {version.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
