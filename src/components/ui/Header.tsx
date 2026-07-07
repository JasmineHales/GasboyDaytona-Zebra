import { ChevronDown, ChevronLeft, MapPin } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslate } from '../../i18n/I18nProvider'
import { OperatorSiteOverlay } from '../home/OperatorSiteOverlay'
import { ExitConfirmDialog } from './ExitConfirmDialog'
import { HeaderMenu } from './HeaderMenu'
import { LanguageSettingsOverlay } from './LanguageSettingsOverlay'
import { resetSessionTimer, SessionTimer } from './SessionTimer'
import { StatusBar } from './StatusBar'
import { trackProps } from '../../utils/tracking'

type HeaderProps = {
  title: string
  subtitle: string
  showBack?: boolean
  showSessionTimer?: boolean
  confirmOnExit?: boolean
  onBack?: () => void
  onReportIssue?: () => void
  onSignOut?: () => void
  onReplayTutorial?: () => void
  menuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
  locationOpen?: boolean
  onLocationOpenChange?: (open: boolean) => void
  elevateHeaderMenu?: boolean
  lockHeaderMenu?: boolean
  lockLocationPicker?: boolean
  brandLayout?: boolean
  brandOperatorName?: string
  site?: string
  showLocationButton?: boolean
  onSiteChange?: (site: string) => void
}

export function Header({
  title,
  subtitle,
  showBack,
  showSessionTimer = true,
  confirmOnExit = true,
  onBack,
  onReportIssue,
  onSignOut,
  onReplayTutorial,
  menuOpen,
  onMenuOpenChange,
  locationOpen,
  onLocationOpenChange,
  elevateHeaderMenu,
  lockHeaderMenu,
  lockLocationPicker,
  brandLayout = false,
  brandOperatorName,
  site,
  showLocationButton = false,
  onSiteChange,
}: HeaderProps) {
  const t = useTranslate()
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showLanguageSettings, setShowLanguageSettings] = useState(false)
  const [internalLocationOpen, setInternalLocationOpen] = useState(false)
  const isLocationControlled = locationOpen !== undefined
  const locationPickerOpen = isLocationControlled ? locationOpen : internalLocationOpen
  const [exitMode, setExitMode] = useState<'logout' | 'navigate'>('navigate')
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null)
  const showBackButton = showBack ?? Boolean(onBack)
  const showLocationPicker = showLocationButton && Boolean(site && onSiteChange)

  const setLocationPickerOpen = (value: boolean) => {
    if (isLocationControlled) {
      onLocationOpenChange?.(value)
    } else {
      setInternalLocationOpen(value)
    }
  }

  useEffect(() => {
    if (!showSessionTimer) return
    return () => {
      resetSessionTimer()
    }
  }, [showSessionTimer])

  useEffect(() => {
    if (menuOpen) {
      setLocationPickerOpen(false)
    }
  }, [menuOpen])

  useEffect(() => {
    if (locationPickerOpen) {
      onMenuOpenChange?.(false)
    }
  }, [locationPickerOpen, onMenuOpenChange])

  const requestExit = useCallback(
    (action?: () => void, mode: 'logout' | 'navigate' = 'navigate') => {
      if (!action) return
      if (mode === 'navigate' && !confirmOnExit) {
        action()
        return
      }
      setExitMode(mode)
      setPendingExit(() => action)
      setShowExitConfirm(true)
    },
    [confirmOnExit],
  )

  const handleContinue = useCallback(() => {
    setShowExitConfirm(false)
    setPendingExit(null)
  }, [])

  const handleLeave = useCallback(() => {
    setShowExitConfirm(false)
    resetSessionTimer()
    pendingExit?.()
    setPendingExit(null)
  }, [pendingExit])

  const toggleLocationPicker = () => {
    if (lockLocationPicker) return
    const nextOpen = !locationPickerOpen
    if (nextOpen) {
      onMenuOpenChange?.(false)
    }
    setLocationPickerOpen(nextOpen)
  }

  const handleSiteSelect = (nextSite: string) => {
    onSiteChange?.(nextSite)
    setLocationPickerOpen(false)
  }

  return (
    <header className={`hertz-header shrink-0${brandLayout ? ' hertz-header--brand' : ''}`}>
      <StatusBar />

      <div className="hertz-header__bar">
        <div className="flex min-w-0 flex-1 items-center">
          {showBackButton && (
            <button
              type="button"
              onClick={() => requestExit(onBack, 'navigate')}
              className="field-target flex shrink-0 items-center justify-center rounded"
              aria-label={t('header.goBack')}
              {...trackProps('header.back')}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div className={showBackButton ? 'min-w-0' : 'min-w-0 py-0.5'}>
            {brandLayout ? (
              <>
                <p className="hertz-header__brand-name">Hertz</p>
                {showLocationPicker && brandOperatorName ? (
                  <p className="hertz-header__brand-operator">{brandOperatorName}</p>
                ) : (
                  <p className="hertz-header__brand-site">{subtitle}</p>
                )}
              </>
            ) : (
              <>
                <h1 className="hertz-header__title">{title}</h1>
                <p className="hertz-header__subtitle">{subtitle}</p>
              </>
            )}
          </div>
        </div>
        <div className="hertz-header__actions">
          {showLocationPicker ? (
            <button
              type="button"
              className={`hertz-header__location-btn${locationPickerOpen ? ' hertz-header__location-btn--open' : ''}`}
              onClick={toggleLocationPicker}
              aria-label={t('home.location.changeLocation', { site: site ?? '' })}
              aria-expanded={locationPickerOpen}
              aria-haspopup="dialog"
              data-tutorial="header-location"
              {...trackProps('header.location.toggle')}
            >
              <MapPin className="hertz-header__location-btn-icon" aria-hidden />
              <span className="hertz-header__location-btn-label">{site}</span>
              <ChevronDown
                className={`hertz-header__location-btn-chevron${locationPickerOpen ? ' hertz-header__location-btn-chevron--open' : ''}`}
                aria-hidden
              />
            </button>
          ) : null}
          <HeaderMenu
            onReportIssue={onReportIssue}
            onSignOut={() => requestExit(onSignOut, 'logout')}
            onReplayTutorial={onReplayTutorial}
            onLanguageSettings={() => setShowLanguageSettings(true)}
            menuOpen={menuOpen}
            onMenuOpenChange={onMenuOpenChange}
            elevateMenu={elevateHeaderMenu}
            lockMenuOpen={lockHeaderMenu}
          />
        </div>
      </div>

      {showSessionTimer && <SessionTimer />}

      {showLocationPicker ? (
        <OperatorSiteOverlay
          open={locationPickerOpen}
          selectedSite={site ?? ''}
          onClose={() => {
            if (lockLocationPicker) return
            setLocationPickerOpen(false)
          }}
          onSelectSite={handleSiteSelect}
          autoFocus={!lockLocationPicker}
          lockOpen={lockLocationPicker}
        />
      ) : null}

      <ExitConfirmDialog
        open={showExitConfirm}
        mode={exitMode}
        onContinue={handleContinue}
        onLeave={handleLeave}
      />

      <LanguageSettingsOverlay
        open={showLanguageSettings}
        onClose={() => setShowLanguageSettings(false)}
      />
    </header>
  )
}
