import { AlertCircle } from 'lucide-react'

type AlertBannerProps = {
  message: string
}

export function AlertBanner({ message }: AlertBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded border border-[var(--color-brand-error-border)] bg-[var(--color-brand-error-bg)] px-4 py-3">
      <AlertCircle className="h-[22px] w-[22px] shrink-0 text-[var(--color-brand-error)]" />
      <p className="text-sm text-[var(--color-brand-error)]">{message}</p>
    </div>
  )
}
