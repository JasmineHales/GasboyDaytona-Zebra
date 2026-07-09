import { Info, Smartphone } from 'lucide-react'
import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { ManualEntryKeypadIcon } from '../icons/WorkflowStrokeIcons'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import { FuelUnlockModeHelpOverlay } from './FuelUnlockModeHelpOverlay'

export type FuelUnlockMode = 'remote' | 'on-site'

type FuelUnlockModeInfoProps = {
  mode: FuelUnlockMode
  onModeChange?: (mode: FuelUnlockMode) => void
  trackPrefix?: string
}

export function FuelUnlockModeInfo({
  mode,
  onModeChange,
  trackPrefix = 'fuel.unlock-mode',
}: FuelUnlockModeInfoProps) {
  const { messages } = useI18n()
  const copy = messages.fuel.unlockMode
  const labelId = useId()
  const [helpOpen, setHelpOpen] = useState(false)

  const options: { id: FuelUnlockMode; label: string; icon: ReactNode }[] = [
    {
      id: 'remote',
      label: copy.remote.label,
      icon: <Smartphone className="fleet-mode-tab__icon" aria-hidden />,
    },
    {
      id: 'on-site',
      label: copy.onSite.label,
      icon: <ManualEntryKeypadIcon className="fleet-mode-tab__icon" />,
    },
  ]

  return (
    <>
      <div className="fuel-unlock-mode">
        <div className="fuel-unlock-mode__label-row">
          <p className="fuel-unlock-mode__label" id={labelId}>
            {copy.groupLabel}
          </p>
          <button
            type="button"
            className="fuel-unlock-mode__info-btn"
            aria-label={copy.infoAriaLabel}
            onClick={() => setHelpOpen(true)}
            {...trackProps(`${trackPrefix}.info.open`)}
          >
            <Info className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="fleet-mode-tab-group" role="group" aria-labelledby={labelId}>
          {options.map((option) => {
            const active = mode === option.id

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (!active) onModeChange?.(option.id)
                }}
                className={[
                  'fleet-mode-tab',
                  option.id === 'remote' ? 'fleet-mode-tab--remote' : 'fleet-mode-tab--on-site',
                  active ? 'fleet-mode-tab--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                {...trackProps(`${trackPrefix}.select`, { mode: option.id })}
              >
                {option.icon}
                <span className="fleet-mode-tab__label">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <FuelUnlockModeHelpOverlay
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        trackPrefix={trackPrefix}
      />
    </>
  )
}
