import { ChevronLeft, MoreVertical } from 'lucide-react'
import { SessionTimer } from './SessionTimer'
import { StatusBar } from './StatusBar'

type HeaderProps = {
  title: string
  subtitle: string
  timerCollapsed: boolean
  onToggleTimer: () => void
  onBack?: () => void
}

export function Header({
  title,
  subtitle,
  timerCollapsed,
  onToggleTimer,
  onBack,
}: HeaderProps) {
  return (
    <header className="shrink-0 border-b-2 border-[var(--color-brand-warning)] bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 py-2 shadow-[0_3px_2.5px_rgba(0,0,0,0.2)]">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="flex h-14 w-14 items-center justify-center rounded-full"
            aria-label="Go back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <p className="text-lg font-bold leading-none">{title}</p>
            <p className="mt-0.5 text-xs font-medium text-[var(--color-text-primary)]">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full"
          aria-label="More options"
        >
          <MoreVertical className="h-6 w-6" />
        </button>
      </div>
      <SessionTimer collapsed={timerCollapsed} onToggle={onToggleTimer} />
    </header>
  )
}
