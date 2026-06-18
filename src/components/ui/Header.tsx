import { ChevronLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ExitConfirmDialog } from './ExitConfirmDialog'
import { HeaderMenu } from './HeaderMenu'
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
  elevateHeaderMenu?: boolean
  lockHeaderMenu?: boolean
  brandLayout?: boolean
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
  elevateHeaderMenu,
  lockHeaderMenu,
  brandLayout = false,
}: HeaderProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [exitMode, setExitMode] = useState<'logout' | 'navigate'>('navigate')
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null)
  const showBackButton = showBack ?? Boolean(onBack)

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

  return (
    <header className={`hertz-header shrink-0${brandLayout ? ' hertz-header--brand' : ''}`}>
      <StatusBar />

      <div className="hertz-header__bar">
        <div className="flex min-w-0 flex-1 items-center">
          {showBackButton && (
            <button
              type="button"
              onClick={() => requestExit(onBack, 'navigate')}
              className="field-target flex shrink-0 items-center justify-center rounded-full"
              aria-label="Go back"
              {...trackProps('header.back')}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div className={showBackButton ? 'min-w-0' : 'min-w-0 py-0.5'}>
            {brandLayout ? (
              <>
                <p className="hertz-header__brand-name">Hertz</p>
                <p className="hertz-header__brand-site">{subtitle}</p>
              </>
            ) : (
              <>
                <h1 className="hertz-header__title">{title}</h1>
                <p className="hertz-header__subtitle">{subtitle}</p>
              </>
            )}
          </div>
        </div>
        <HeaderMenu
          onReportIssue={onReportIssue}
          onSignOut={() => requestExit(onSignOut, 'logout')}
          onReplayTutorial={onReplayTutorial}
          menuOpen={menuOpen}
          onMenuOpenChange={onMenuOpenChange}
          elevateMenu={elevateHeaderMenu}
          lockMenuOpen={lockHeaderMenu}
        />
      </div>

      {showSessionTimer && <SessionTimer />}

      <ExitConfirmDialog
        open={showExitConfirm}
        mode={exitMode}
        onContinue={handleContinue}
        onLeave={handleLeave}
      />
    </header>
  )
}
