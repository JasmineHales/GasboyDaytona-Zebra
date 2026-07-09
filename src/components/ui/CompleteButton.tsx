import { Check } from 'lucide-react'
import { useTranslate } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'

type CompleteButtonProps = {
  disabled?: boolean
  onClick?: () => void
  trackTag?: string
  /** Links to footer hint explaining why Complete is blocked. */
  ariaDescribedBy?: string
}

export function CompleteButton({
  disabled = false,
  onClick,
  trackTag = 'workflow.complete',
  ariaDescribedBy,
}: CompleteButtonProps) {
  const t = useTranslate()

  return (
    <button
      type="button"
      aria-disabled={disabled ? true : undefined}
      aria-describedby={ariaDescribedBy}
      onClick={onClick}
      className={`fleet-btn fleet-btn-lg fleet-btn-contained-brand fleet-btn-complete w-full${
        disabled ? ' fleet-btn--aria-disabled' : ''
      }`}
      {...trackProps(trackTag)}
    >
      <Check className="h-6 w-6" strokeWidth={2} aria-hidden />
      {t('common.complete')}
    </button>
  )
}
