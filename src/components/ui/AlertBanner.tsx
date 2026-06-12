import { AlertCircle } from 'lucide-react'

type AlertBannerProps = {
  message: string
}

export function AlertBanner({ message }: AlertBannerProps) {
  return (
    <div className="fleet-alert-error">
      <AlertCircle className="h-[22px] w-[22px] shrink-0 text-[var(--color-fleet-error)]" />
      <p>{message}</p>
    </div>
  )
}
