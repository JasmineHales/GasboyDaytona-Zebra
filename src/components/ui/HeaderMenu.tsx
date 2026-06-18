import { AlertCircle, GraduationCap, LogOut, MoreVertical } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { trackProps } from '../../utils/tracking'

type HeaderMenuProps = {
  onReportIssue?: () => void
  onSignOut?: () => void
  onReplayTutorial?: () => void
  menuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
  elevateMenu?: boolean
  lockMenuOpen?: boolean
}

type MenuItemProps = {
  icon: ReactNode
  label: string
  trackTag: string
  tutorialId?: string
  onClick: () => void
}

function MenuItem({ icon, label, trackTag, tutorialId, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="header-menu-item"
      data-tutorial={tutorialId}
      {...trackProps(trackTag)}
    >
      <span className="flex min-w-9 shrink-0 items-center justify-start">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  )
}

export function HeaderMenu({
  onReportIssue,
  onSignOut,
  onReplayTutorial,
  menuOpen,
  onMenuOpenChange,
  elevateMenu = false,
  lockMenuOpen = false,
}: HeaderMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = menuOpen !== undefined
  const open = isControlled ? menuOpen : internalOpen
  const containerRef = useRef<HTMLDivElement>(null)

  const setOpen = (value: boolean) => {
    if (isControlled) {
      onMenuOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }

  useEffect(() => {
    if (!open || isControlled || lockMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleReportIssue = () => {
    setOpen(false)
    onReportIssue?.()
  }

  const handleSignOut = () => {
    setOpen(false)
    onSignOut?.()
  }

  const handleReplayTutorial = () => {
    setOpen(false)
    onReplayTutorial?.()
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-end">
      <button
        type="button"
        onClick={() => {
          if (lockMenuOpen) return
          setOpen(!open)
        }}
        className="header-menu-toggle"
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
        data-tutorial="header-menu"
        {...trackProps('header.menu.toggle')}
      >
        <MoreVertical className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-full mt-4 w-[193px] overflow-hidden rounded-[4px] bg-white p-2 shadow-[0px_3px_14px_2px_rgba(0,0,0,0.12),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_5px_5px_-3px_rgba(0,0,0,0.2)] ${elevateMenu ? 'z-[210]' : 'z-30'}`}
        >
          <div className="flex flex-col gap-4 py-2">
            {onReplayTutorial && (
              <MenuItem
                icon={<GraduationCap className="h-6 w-6" />}
                label="Replay tutorial"
                trackTag="header.menu.replay-tutorial"
                onClick={handleReplayTutorial}
              />
            )}
            <MenuItem
              icon={<AlertCircle className="h-6 w-6" />}
              label="Report Issue"
              trackTag="header.menu.report-issue"
              tutorialId="header-report-issue"
              onClick={handleReportIssue}
            />
            <MenuItem
              icon={<LogOut className="h-6 w-6" />}
              label="Sign Out"
              trackTag="header.menu.sign-out"
              tutorialId="header-sign-out"
              onClick={handleSignOut}
            />
          </div>
        </div>
      )}
    </div>
  )
}
