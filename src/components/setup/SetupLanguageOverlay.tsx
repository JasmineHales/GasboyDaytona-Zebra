import { X } from 'lucide-react'
import { useId } from 'react'
import type { AppLanguageId } from '../../utils/languageSettings'
import { useI18n } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { LanguagePickerList } from '../ui/LanguagePickerList'

type SetupLanguageOverlayProps = {
  open: boolean
  onClose: () => void
}

export function SetupLanguageOverlay({ open, onClose }: SetupLanguageOverlayProps) {
  const titleId = useId()
  const groupId = useId()
  const { language, setLanguage, messages, t } = useI18n()
  const copy = messages.setup

  const handleSelect = (languageId: AppLanguageId) => {
    setLanguage(languageId)
    onClose()
  }

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="setup.language.dismiss-backdrop"
      labelId={titleId}
    >
      <div className="bottom-sheet-body setup-language-overlay pt-2">
        <div className="flex w-full items-center">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
          >
            {copy.languageHeading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="field-target flex shrink-0 items-center justify-center rounded p-2"
            aria-label={t('common.close')}
            {...trackProps('setup.language.close')}
          >
            <X className="h-6 w-6 text-[var(--color-fleet-text)]" aria-hidden />
          </button>
        </div>
        <p className="setup-overlay__description">{copy.languageHint}</p>

        <LanguagePickerList
          labelledBy={groupId}
          value={language}
          onChange={handleSelect}
          trackTag="setup.language.select"
          autoFocusSearch
        />
        <p id={groupId} className="fleet-sr-only">
          {copy.languageHeading}
        </p>
      </div>
    </BottomSheetOverlay>
  )
}
