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
      className="flex h-12 w-full items-center justify-center gap-2 rounded bg-[var(--color-brand-success)] px-6 py-3 text-sm font-semibold text-white shadow-[0_1px_5px_rgba(0,0,0,0.12),0_2px_2px_rgba(0,0,0,0.14),0_3px_1px_-2px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Check className="h-6 w-6" />
      Complete
    </button>
  )
}
