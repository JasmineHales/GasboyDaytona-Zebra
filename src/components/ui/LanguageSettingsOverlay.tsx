import { useId } from 'react'
import { X } from 'lucide-react'
import type { AppThemeId } from '../../utils/themeSettings'
import { useI18n } from '../../i18n/I18nProvider'
import { useTheme } from '../../theme/ThemeProvider'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from './BottomSheetOverlay'
import { LanguagePickerList } from './LanguagePickerList'

type LanguageSettingsOverlayProps = {
  open: boolean
  onClose: () => void
}

const THEME_OPTIONS: Array<{
  id: AppThemeId
  labelKey: 'themeLight' | 'themeDark'
  hintKey: 'themeLightHint' | 'themeDarkHint'
}> = [
  { id: 'light', labelKey: 'themeLight', hintKey: 'themeLightHint' },
  { id: 'dark', labelKey: 'themeDark', hintKey: 'themeDarkHint' },
]

function SettingsSegmentGroup<T extends string | boolean>({
  labelledBy,
  options,
  value,
  onChange,
  trackTag,
  formatTrackValue,
}: {
  labelledBy: string
  options: Array<{ id: T; label: string }>
  value: T
  onChange: (id: T) => void
  trackTag: string
  formatTrackValue: (id: T) => string
}) {
  return (
    <div className="settings-segment-group fleet-mode-tab-group" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((option) => {
        const active = value === option.id
        return (
          <button
            key={String(option.id)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={`settings-segment fleet-mode-tab${active ? ' fleet-mode-tab--active' : ''}`}
            {...trackProps(trackTag, { value: formatTrackValue(option.id) })}
          >
            <span className="text-base font-semibold">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function LanguageSettingsOverlay({ open, onClose }: LanguageSettingsOverlayProps) {
  const titleId = useId()
  const appearanceGroupId = useId()
  const fieldModeGroupId = useId()
  const languageGroupId = useId()
  const { language, setLanguage, messages, t } = useI18n()
  const { theme, setTheme, fieldMode, setFieldMode } = useTheme()
  const copy = messages.language

  const FIELD_MODE_OPTIONS = [
    { id: false as const, labelKey: 'fieldModeOff' as const, hintKey: 'fieldModeOffHint' as const },
    { id: true as const, labelKey: 'fieldModeOn' as const, hintKey: 'fieldModeOnHint' as const },
  ]

  const activeThemeHint =
    copy[THEME_OPTIONS.find((option) => option.id === theme)!.hintKey]
  const activeFieldModeHint =
    copy[FIELD_MODE_OPTIONS.find((option) => option.id === fieldMode)!.hintKey]

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={onClose}
      dismissTrackTag="language-settings.dismiss-backdrop"
      labelId={titleId}
    >
      <div className="bottom-sheet-body settings-overlay pt-2">
        <div className="settings-overlay__header">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
          >
            {copy.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="field-target flex shrink-0 items-center justify-center rounded p-2"
            aria-label={t('common.close')}
            {...trackProps('language-settings.close')}
          >
            <X className="h-6 w-6 text-[var(--color-fleet-text)]" aria-hidden />
          </button>
        </div>

        <div className="settings-overlay__sections">
          <section className="settings-section" aria-labelledby={appearanceGroupId}>
            <h3 id={appearanceGroupId} className="settings-section__heading">
              {copy.appearanceHeading}
            </h3>
            <SettingsSegmentGroup
              labelledBy={appearanceGroupId}
              value={theme}
              onChange={setTheme}
              trackTag="settings.theme.select"
              formatTrackValue={(id) => id}
              options={THEME_OPTIONS.map((option) => ({
                id: option.id,
                label: copy[option.labelKey],
              }))}
            />
            <p className="settings-section__hint">{activeThemeHint}</p>
          </section>

          <section className="settings-section" aria-labelledby={fieldModeGroupId}>
            <h3 id={fieldModeGroupId} className="settings-section__heading">
              {copy.fieldModeHeading}
            </h3>
            <SettingsSegmentGroup
              labelledBy={fieldModeGroupId}
              value={fieldMode}
              onChange={setFieldMode}
              trackTag="settings.field-mode.select"
              formatTrackValue={(id) => String(id)}
              options={FIELD_MODE_OPTIONS.map((option) => ({
                id: option.id,
                label: copy[option.labelKey],
              }))}
            />
            <p className="settings-section__hint">{activeFieldModeHint}</p>
          </section>

          <section
            className="settings-section settings-section--language"
            aria-labelledby={languageGroupId}
          >
            <h3 id={languageGroupId} className="settings-section__heading">
              {copy.languageHeading}
            </h3>
            <LanguagePickerList
              labelledBy={languageGroupId}
              value={language}
              onChange={setLanguage}
              trackTag="language-settings.select"
            />
          </section>
        </div>

        <div className="bottom-sheet-footer settings-overlay__footer pt-4">
          <button
            type="button"
            onClick={onClose}
            className="fleet-btn fleet-btn-lg fleet-btn-contained-brand w-full"
            {...trackProps('language-settings.done')}
          >
            {t('language.done')}
          </button>
        </div>
      </div>
    </BottomSheetOverlay>
  )
}
