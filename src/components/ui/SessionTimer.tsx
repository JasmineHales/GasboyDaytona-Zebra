import { ChevronDown, ChevronUp } from 'lucide-react'

type SessionTimerProps = {
  collapsed: boolean
  onToggle: () => void
}

export function SessionTimer({ collapsed, onToggle }: SessionTimerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-1 text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-primary)]">Session Timer</span>
        <span className="flex items-center gap-1 px-2.5 text-2xl font-bold tabular-nums">
          <span>01</span>
          <span>:</span>
          <span>04</span>
          <span>:</span>
          <span>59</span>
        </span>
      </div>
      {collapsed ? (
        <ChevronDown className="h-6 w-6 text-[var(--color-text-primary)]" />
      ) : (
        <ChevronUp className="h-6 w-6 text-[var(--color-text-primary)]" />
      )}
    </button>
  )
}
