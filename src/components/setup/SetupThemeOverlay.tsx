import { useId } from 'react'
import { X } from 'lucide-react'
import type { AppThemeId } from '../../utils/themeSettings'
import { useI18n } from '../../i18n/I18nProvider'
import { useTheme } from '../../theme/ThemeProvider'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { SetupChoiceOption } from './SetupChoiceOption'

const THEME_OPTIONS: Array<{
  id: AppThemeId
  labelKey: 'themeLight' | 'themeDark'
  hintKey: 'themeLightHint' | 'themeDarkHint'
}> = [
  { id: 'light', labelKey: 'themeLight', hintKey: 'themeLightHint' },
  { id: 'dark', labelKey: 'themeDark', hintKey: 'themeDarkHint' },
]

type SetupThemeOverlayProps = {
  open: boolean
  onClose: () => void
}

export function SetupThemeOverlay({ open, onClose }: SetupThemeOverlayProps) {
  const titleId = useId()
  const groupId = useId()
  const { messages, t } = useI18n()
  const { theme, setTheme } = useTheme()
  const copy = messages.setup
  const languageCopy = messages.language

  const handleSelect = (themeId: AppThemeId) => {
    setTheme(themeId)
    onClose()
  }

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="setup.theme.dismiss-backdrop"
      labelId={titleId}
    >
      <div className="bottom-sheet-body pt-2">
        <div className="flex w-full items-center">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
          >
            {copy.themeHeading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="field-target flex shrink-0 items-center justify-center rounded p-2"
            aria-label={t('common.close')}
            {...trackProps('setup.theme.close')}
          >
            <X className="h-6 w-6 text-[var(--color-fleet-text)]" aria-hidden />
          </button>
        </div>
        <p className="setup-overlay__description">{copy.themeHint}</p>

        <div
          className="mt-4 flex flex-col gap-2"
          role="radiogroup"
          aria-labelledby={groupId}
        >
          <p id={groupId} className="fleet-sr-only">
            {copy.themeHeading}
          </p>
          {THEME_OPTIONS.map((option) => (
            <SetupChoiceOption
              key={option.id}
              active={theme === option.id}
              label={languageCopy[option.labelKey]}
              hint={languageCopy[option.hintKey]}
              trackTag="setup.theme.select"
              trackValue={option.id}
              onSelect={() => handleSelect(option.id)}
            />
          ))}
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
