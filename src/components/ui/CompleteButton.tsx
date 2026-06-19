import { Check } from 'lucide-react'
import { useId } from 'react'
import { useTranslate } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'

type CompleteButtonProps = {
  disabled?: boolean
  disabledReason?: string
  onClick?: () => void
  onDisabledPress?: () => void
  trackTag?: string
}

export function CompleteButton({
  disabled = false,
  disabledReason,
  onClick,
  onDisabledPress,
  trackTag = 'workflow.complete',
}: CompleteButtonProps) {
  const t = useTranslate()
  const hintId = useId()

  return (
    <div className="workflow-stack">
      {disabled && disabledReason && (
        <p id={hintId} className="fleet-field__hint text-center">
          {disabledReason}
        </p>
      )}
      <button
        type="button"
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (disabled) {
            onDisabledPress?.()
            return
          }
          onClick?.()
        }}
        aria-describedby={disabled && disabledReason ? hintId : undefined}
        className={`fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full${
          disabled ? ' fleet-btn--aria-disabled' : ''
        }`}
        {...trackProps(trackTag)}
      >
        <Check className="h-6 w-6" aria-hidden />
        {t('common.complete')}
      </button>
    </div>
  )
}
