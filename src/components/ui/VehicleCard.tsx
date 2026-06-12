import { useState } from 'react'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import type { VehicleSummary } from '../../utils/vehicleSummary'

type VehicleCardProps = {
  summary: VehicleSummary
}

function DetailRow({
  label,
  value,
  chipClass,
}: {
  label: string
  value: string
  chipClass: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="text-sm font-semibold text-[var(--color-fleet-text)]">{label}</span>
      <span className={`fleet-chip shrink-0 text-sm font-bold ${chipClass}`}>{value}</span>
    </div>
  )
}

export function VehicleCard({ summary }: VehicleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = Boolean(
    summary.holdWarning || summary.carPriority || summary.carTier,
  )

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-fleet-secondary-border)] bg-white">
      <button
        type="button"
        onClick={() => hasDetails && setExpanded((open) => !open)}
        aria-expanded={hasDetails ? expanded : undefined}
        disabled={!hasDetails}
        className={`field-target flex w-full items-center gap-3 px-4 py-3 text-left transition-colors disabled:cursor-default ${
          hasDetails ? 'hover:bg-[var(--color-fleet-surface-muted)]' : ''
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="fleet-chip fleet-chip-neutral shrink-0 px-2 py-0.5 text-xs font-bold">
              {summary.unitId}
            </span>
            <span className="truncate text-base font-bold leading-tight text-[var(--color-fleet-text)]">
              {summary.name}
            </span>
          </div>
          <p className="truncate text-sm font-semibold leading-tight text-[var(--color-fleet-text-secondary)]">
            {summary.vehicleClass}
          </p>
        </div>

        {!expanded && summary.holdWarning && (
          <AlertTriangle
            className="h-4 w-4 shrink-0 text-[var(--color-fleet-warning)]"
            aria-label="Hold warning"
          />
        )}

        {!expanded && summary.carTier && !summary.holdWarning && (
          <span className="fleet-chip fleet-chip-info shrink-0 px-2 py-0.5 text-xs font-bold">
            {summary.carTier}
          </span>
        )}

        {hasDetails && (
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-[var(--color-fleet-text-secondary)] transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
            aria-hidden
          />
        )}
      </button>

      {expanded && hasDetails && (
        <div className="flex flex-col gap-2 bg-[var(--color-fleet-surface-muted)] px-3 pb-2.5 pt-2">
          {summary.holdWarning && (
            <div className="flex gap-2 rounded-lg border border-[#ffc970] bg-[var(--color-fleet-warning-surface)] px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--color-fleet-warning)]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--color-fleet-text-orange)]">
                  Hold Warning: {summary.holdWarning.code}
                </p>
                <p className="mt-0.5 text-xs font-semibold leading-snug text-[var(--color-fleet-text)]">
                  {summary.holdWarning.message}
                </p>
              </div>
            </div>
          )}

          {(summary.carPriority || summary.carTier) && (
            <div className="rounded-lg border border-[var(--color-fleet-secondary-border)] bg-white px-3 py-2">
              {summary.carPriority && (
                <DetailRow
                  label="Car Priority"
                  value={summary.carPriority}
                  chipClass="fleet-chip-neutral"
                />
              )}
              {summary.carPriority && summary.carTier && (
                <div className="my-1.5 h-px bg-[var(--color-fleet-secondary-border)]" />
              )}
              {summary.carTier && (
                <DetailRow
                  label="Car Tier"
                  value={summary.carTier}
                  chipClass="fleet-chip-info"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
