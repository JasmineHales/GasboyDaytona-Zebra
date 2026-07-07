import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { useTheme } from '../theme/ThemeProvider'
import { getAppLanguageEntry } from '../utils/appLanguageCatalog'
import { INITIAL_SETUP_DEFAULTS } from '../utils/initialSetup'
import { getOperatorSiteEntry } from '../utils/operatorSiteCatalog'
import { recordRecentOperatorSite } from '../utils/recentOperatorSites'
import type { OperatorSiteId } from '../utils/operatorSites'
import { trackProps } from '../utils/tracking'
import { OperatorSiteOverlay } from './home/OperatorSiteOverlay'
import { SetupFieldRow } from './setup/SetupFieldRow'
import { SetupLanguageOverlay } from './setup/SetupLanguageOverlay'
import { SetupSizingOverlay } from './setup/SetupSizingOverlay'
import { SetupThemeOverlay } from './setup/SetupThemeOverlay'
import { StatusBar } from './ui/StatusBar'

type InitialSetupScreenProps = {
  onComplete: (site: OperatorSiteId) => void
  /** Reset language, appearance, and sizing to first-time defaults. */
  applyDefaults?: boolean
}

type SetupOverlay = 'location' | 'language' | 'theme' | 'sizing'

export function InitialSetupScreen({
  onComplete,
  applyDefaults = false,
}: InitialSetupScreenProps) {
  const { language, messages, setLanguage } = useI18n()
  const { theme, fieldMode, setTheme, setFieldMode } = useTheme()
  const copy = messages.setup
  const languageCopy = messages.language
  const locationCopy = messages.home.location
  const [site, setSite] = useState<OperatorSiteId | null>(null)
  const [activeOverlay, setActiveOverlay] = useState<SetupOverlay | null>(null)

  useEffect(() => {
    if (!applyDefaults) return
    setLanguage(INITIAL_SETUP_DEFAULTS.language)
    setTheme(INITIAL_SETUP_DEFAULTS.theme)
    setFieldMode(INITIAL_SETUP_DEFAULTS.fieldMode)
  }, [applyDefaults, setLanguage, setTheme, setFieldMode])

  const siteEntry = site ? getOperatorSiteEntry(site) : undefined
  const themeLabel =
    theme === 'dark' ? languageCopy.themeDark : languageCopy.themeLight
  const sizingLabel = fieldMode ? languageCopy.fieldModeOn : languageCopy.fieldModeOff
  const canContinue = site !== null

  const handleSiteSelect = (nextSite: string) => {
    setSite(nextSite as OperatorSiteId)
    recordRecentOperatorSite(nextSite)
  }

  return (
    <div className="initial-setup-screen">
      <StatusBar />

      <main id="main-content" className="initial-setup-screen__main app-scroll">
        <div className="initial-setup-screen__hero">
          <p className="initial-setup-screen__brand-name">Hertz</p>
        </div>

        <div className="initial-setup-screen__panel">
          <div className="initial-setup-screen__card">
            <h1 className="initial-setup-screen__title">{copy.title}</h1>
            <p className="initial-setup-screen__subtitle">{copy.subtitle}</p>

            <div className="initial-setup-screen__fields">
              <SetupFieldRow
                label={locationCopy.loginLabel}
                value={site ?? undefined}
                placeholder={copy.locationPlaceholder}
                valueDetail={
                  siteEntry ? (
                    <span className="operator-site-search__code setup-field-row__code">
                      {siteEntry.code}
                    </span>
                  ) : null
                }
                onPress={() => setActiveOverlay('location')}
                trackTag="setup.location.open"
                emphasized
              />

              <SetupFieldRow
                label={copy.languageHeading}
                value={getAppLanguageEntry(language)?.nativeLabel ?? languageCopy.names.en}
                onPress={() => setActiveOverlay('language')}
                trackTag="setup.language.open"
              />

              <SetupFieldRow
                label={copy.themeHeading}
                value={themeLabel}
                onPress={() => setActiveOverlay('theme')}
                trackTag="setup.theme.open"
              />

              <SetupFieldRow
                label={copy.sizingHeading}
                value={sizingLabel}
                onPress={() => setActiveOverlay('sizing')}
                trackTag="setup.sizing.open"
              />
            </div>

            {!canContinue ? (
              <p className="initial-setup-screen__continue-hint" role="status">
                {copy.continueRequiresLocation}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => site && onComplete(site)}
              disabled={!canContinue}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated initial-setup-screen__continue w-full"
              {...trackProps('setup.continue')}
            >
              {copy.continue}
            </button>
          </div>
        </div>
      </main>

      <OperatorSiteOverlay
        open={activeOverlay === 'location'}
        selectedSite={site ?? ''}
        onClose={() => setActiveOverlay(null)}
        onSelectSite={handleSiteSelect}
      />

      <SetupLanguageOverlay
        open={activeOverlay === 'language'}
        onClose={() => setActiveOverlay(null)}
      />

      <SetupThemeOverlay
        open={activeOverlay === 'theme'}
        onClose={() => setActiveOverlay(null)}
      />

      <SetupSizingOverlay
        open={activeOverlay === 'sizing'}
        onClose={() => setActiveOverlay(null)}
      />
    </div>
  )
}
