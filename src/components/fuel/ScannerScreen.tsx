import { ChevronLeft, QrCode } from 'lucide-react'
import { StatusBar } from '../ui/StatusBar'

type ScannerScreenProps = {
  onBack: () => void
  onManualEntry: () => void
}

export function ScannerScreen({ onBack, onManualEntry }: ScannerScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#1a1a2e]">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-14 w-14 items-center justify-center rounded-full text-white"
          aria-label="Close scanner"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <p className="text-base font-semibold text-white">Scan Pump</p>
      </div>

      <div className="mx-4 rounded-lg bg-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <QrCode className="h-6 w-6 shrink-0 text-white" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">GRA Nissan Rogue</p>
            <button
              type="button"
              onClick={onManualEntry}
              className="mt-0.5 text-left text-xs text-[#7ccffd] underline"
            >
              Having trouble scanning? Enter pump manually
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-10">
        <div className="relative h-[280px] w-[280px]">
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />
          <div className="absolute left-[60px] right-[60px] top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-[var(--color-brand-primary)]" />
        </div>
      </div>

      <div className="px-6 pb-6 text-center">
        <p className="text-sm text-white/80">Align the QR code within the frame</p>
      </div>
    </div>
  )
}

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positionClass = {
    tl: 'left-0 top-0 border-l-4 border-t-4',
    tr: 'right-0 top-0 border-r-4 border-t-4',
    bl: 'bottom-0 left-0 border-b-4 border-l-4',
    br: 'bottom-0 right-0 border-b-4 border-r-4',
  }[position]

  return (
    <div
      className={`absolute h-6 w-6 rounded-sm border-white ${positionClass}`}
    />
  )
}
