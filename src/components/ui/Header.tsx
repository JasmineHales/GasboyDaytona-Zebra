import { ChevronLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ExitConfirmDialog } from './ExitConfirmDialog'
import { HeaderMenu } from './HeaderMenu'
import { resetSessionTimer, SessionTimer } from './SessionTimer'
import { StatusBar } from './StatusBar'

type HeaderProps = {
  title: string
  subtitle: string
  showBack?: boolean
  showSessionTimer?: boolean
  onBack?: () => void
  onReportIssue?: () => void
  onSignOut?: () => void
}

export function Header({
  title,
  subtitle,
  showBack,
  showSessionTimer = true,
  onBack,
  onReportIssue,
  onSignOut,
}: HeaderProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null)
  const showBackButton = showBack ?? Boolean(onBack)

  const requestExit = useCallback((action?: () => void) => {
    if (!action) return
    setPendingExit(() => action)
    setShowExitConfirm(true)
  }, [])

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
    <header className="shrink-0 border-b-2 border-[#fec310] bg-white">
      <StatusBar />

      <div className="flex items-center justify-between bg-white px-4 py-2 shadow-[0_3px_2.5px_rgba(0,0,0,0.2)]">
        <div className="flex min-w-0 items-center">
          {showBackButton && (
            <button
              type="button"
              onClick={() => requestExit(onBack)}
              className="field-target flex shrink-0 items-center justify-center rounded-full p-4 text-[var(--color-fleet-text)]"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div className={showBackButton ? '' : 'py-1'}>
            <p className="text-lg font-bold leading-none text-[var(--color-fleet-text)]">{title}</p>
            <p className="mt-0.5 text-xs font-medium text-[var(--color-fleet-text)]">{subtitle}</p>
          </div>
        </div>
        <HeaderMenu
          onReportIssue={onReportIssue}
          onSignOut={() => requestExit(onSignOut)}
        />
      </div>

      {showSessionTimer && <SessionTimer />}

      <ExitConfirmDialog
        open={showExitConfirm}
        onContinue={handleContinue}
        onLeave={handleLeave}
      />
    </header>
  )
}
