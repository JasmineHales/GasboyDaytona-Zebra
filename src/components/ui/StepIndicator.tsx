type StepIndicatorProps = {
  step: number
  total: number
  label: string
  progress?: number
}

export function StepIndicator({ step, total, label, progress = 0 }: StepIndicatorProps) {
  const fill = Math.min(100, Math.max(0, progress))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#2f7185] text-xs font-bold text-[#2f7185]">
          {step}
        </div>
        <p className="pt-1 text-sm font-bold text-[#424548]">{label}</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
        <div
          className="h-full rounded-full bg-[#94a3b8] transition-all duration-300"
          style={{ width: `${fill}%` }}
        />
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Step {step} of {total}
      </p>
    </div>
  )
}
