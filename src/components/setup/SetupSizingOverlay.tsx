import { useId } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useTheme } from '../../theme/ThemeProvider'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { SetupChoiceOption } from './SetupChoiceOption'

const SIZING_OPTIONS = [
  { id: false as const, labelKey: 'fieldModeOff' as const, hintKey: 'fieldModeOffHint' as const },
  { id: true as const, labelKey: 'fieldModeOn' as const, hintKey: 'fieldModeOnHint' as const },
]

type SetupSizingOverlayProps = {
  open: boolean
  onClose: () => void
}

export function SetupSizingOverlay({ open, onClose }: SetupSizingOverlayProps) {
  const titleId = useId()
  const groupId = useId()
  const { messages, t } = useI18n()
  const { fieldMode, setFieldMode } = useTheme()
  const copy = messages.setup
  const languageCopy = messages.language

  const handleSelect = (enabled: boolean) => {
    setFieldMode(enabled)
    onClose()
  }

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="setup.sizing.dismiss-backdrop"
      labelId={titleId}
    >
      <div className="bottom-sheet-body pt-2">
        <div className="flex w-full items-center">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
          >
            {copy.sizingHeading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="field-target flex shrink-0 items-center justify-center rounded p-2"
            aria-label={t('common.close')}
            {...trackProps('setup.sizing.close')}
          >
            <X className="h-6 w-6 text-[var(--color-fleet-text)]" aria-hidden />
          </button>
        </div>
        <p className="setup-overlay__description">{copy.sizingHint}</p>

        <div
          className="mt-4 flex flex-col gap-2"
          role="radiogroup"
          aria-labelledby={groupId}
        >
          <p id={groupId} className="fleet-sr-only">
            {copy.sizingHeading}
          </p>
          {SIZING_OPTIONS.map((option) => (
            <SetupChoiceOption
              key={String(option.id)}
              active={fieldMode === option.id}
              label={languageCopy[option.labelKey]}
              hint={languageCopy[option.hintKey]}
              trackTag="setup.sizing.select"
              trackValue={String(option.id)}
              onSelect={() => handleSelect(option.id)}
            />
          ))}
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
