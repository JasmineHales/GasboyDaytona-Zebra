import { Battery, Signal, Wifi } from 'lucide-react'

export function StatusBar() {
  return (
    <div
      className="flex h-6 items-center justify-between bg-[var(--color-status-bar)] px-3 text-[14px] font-medium tracking-[0.014px] text-white/90"
      aria-hidden="true"
    >
      <span>12:30</span>
      <div className="flex items-center gap-1.5">
        <Signal className="h-3 w-3" strokeWidth={2.5} />
        <Wifi className="h-3 w-3" strokeWidth={2.5} />
        <Battery className="h-3 w-3" strokeWidth={2.5} />
      </div>
    </div>
  )
}
