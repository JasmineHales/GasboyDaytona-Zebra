import { AlertCircle, LogOut, MoreVertical } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type HeaderMenuProps = {
  onReportIssue?: () => void
  onSignOut?: () => void
}

type MenuItemProps = {
  icon: ReactNode
  label: string
  onClick: () => void
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center px-4 py-4 text-left text-base text-[var(--color-fleet-text)]"
    >
      <span className="flex min-w-9 shrink-0 items-center justify-start">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  )
}

export function HeaderMenu({ onReportIssue, onSignOut }: HeaderMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

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

  return (
    <div ref={containerRef} className="relative flex flex-col items-end">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center justify-center rounded-full p-4 text-[var(--color-fleet-text)]"
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-4 w-[193px] overflow-hidden rounded-[4px] bg-white p-2 shadow-[0px_3px_14px_2px_rgba(0,0,0,0.12),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_5px_5px_-3px_rgba(0,0,0,0.2)]"
        >
          <div className="flex flex-col gap-4 py-2">
            <MenuItem
              icon={<AlertCircle className="h-6 w-6" />}
              label="Report Issue"
              onClick={handleReportIssue}
            />
            <MenuItem
              icon={<LogOut className="h-6 w-6" />}
              label="Sign Out"
              onClick={handleSignOut}
            />
          </div>
        </div>
      )}
    </div>
  )
}
