import { Check } from 'lucide-react'

type CompleteButtonProps = {
  disabled?: boolean
  onClick?: () => void
}

export function CompleteButton({ disabled = false, onClick }: CompleteButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="fleet-btn fleet-btn-lg fleet-btn-contained-success fleet-btn-elevated w-full"
    >
      <Check className="h-6 w-6" />
      Complete
    </button>
  )
}
