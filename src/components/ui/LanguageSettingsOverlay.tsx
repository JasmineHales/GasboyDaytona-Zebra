import { useId } from 'react'
import type { AppLanguageId } from '../../utils/languageSettings'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from './BottomSheetOverlay'

type LanguageSettingsOverlayProps = {
  open: boolean
  onClose: () => void
}

const LANGUAGE_IDS: AppLanguageId[] = ['en', 'es', 'fr']

export function LanguageSettingsOverlay({ open, onClose }: LanguageSettingsOverlayProps) {
  const titleId = useId()
  const { language, setLanguage, messages, t } = useI18n()

  const handleSelect = (next: AppLanguageId) => {
    setLanguage(next)
  }

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="language-settings.dismiss-backdrop"
      labelId={titleId}
    >
      <div className="flex min-h-0 flex-col px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <h2
          id={titleId}
          className="text-left text-lg font-bold text-[var(--color-fleet-text)]"
        >
          {t('language.title')}
        </h2>
        <p className="mt-1 text-sm font-medium text-[var(--color-fleet-text-secondary)]">
          {t('language.description')}
        </p>

        <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-labelledby={titleId}>
          {LANGUAGE_IDS.map((languageId) => {
            const active = language === languageId
            return (
              <button
                key={languageId}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleSelect(languageId)}
                className={`language-settings-option${active ? ' language-settings-option--active' : ''}`}
                {...trackProps('language-settings.select', { language: languageId })}
              >
                <span className="language-settings-option__text">
                  <span className="language-settings-option__label">
                    {messages.language.names[languageId]}
                  </span>
                  <span className="language-settings-option__native">
                    {messages.language.native[languageId]}
                  </span>
                </span>
                {active && (
                  <span className="language-settings-option__check" aria-hidden>
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="fleet-btn fleet-btn-lg fleet-btn-contained-info mt-5 w-full"
          {...trackProps('language-settings.done')}
        >
          {t('language.done')}
        </button>
      </div>
    </BottomSheetOverlay>
  )
}
