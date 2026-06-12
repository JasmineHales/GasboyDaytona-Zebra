import type { ScreenId } from '../types/flow'

type FlowNavigatorProps = {
  current: ScreenId
  onSelect: (screen: ScreenId) => void
}

const SCREEN_GROUPS: { label: string; screens: { id: ScreenId; label: string }[] }[] = [
  {
    label: 'Transport',
    screens: [
      { id: 'transport-default', label: 'Default' },
      { id: 'transport-complete', label: 'Complete' },
    ],
  },
  {
    label: 'Movement',
    screens: [
      { id: 'movement-transport-complete', label: 'Transport Complete' },
      { id: 'movement-stall-complete', label: 'Stall Complete' },
      { id: 'movement-stall-issue-reported', label: 'Stall Issue Reported' },
    ],
  },
  {
    label: 'Stall',
    screens: [
      { id: 'stall-default', label: 'Default' },
      { id: 'stall-complete', label: 'Complete' },
      { id: 'stall-missing', label: 'Missing Image' },
      { id: 'stall-issue-reported', label: 'Issue Reported' },
    ],
  },
  {
    label: 'Remote Unlock (Gasboy)',
    screens: [
      { id: 'fueling-default', label: 'Default' },
      { id: 'fueling-unlocking', label: 'Unlocking Pump' },
      { id: 'fueling-scanner', label: 'Scanner' },
      { id: 'fueling-manual-entry', label: 'Manual Entry' },
      { id: 'fueling-pump-unlocked', label: 'Pump Unlocked' },
      { id: 'fueling-in-progress', label: 'Fueling In Progress' },
      { id: 'fueling-complete', label: 'Fueling Complete' },
      { id: 'fueling-additional', label: 'Additional Fueling' },
      { id: 'fueling-additional-complete', label: 'Additional Complete' },
      { id: 'fueling-pump-unavailable', label: 'Pump Unavailable' },
      { id: 'fueling-connection-lost', label: 'Connection Lost' },
      { id: 'fueling-no-response', label: 'No Response' },
      { id: 'fueling-pump-timeout', label: 'Pump Timeout' },
      { id: 'fueling-issue', label: 'Report Issue' },
      { id: 'fueling-issue-details', label: 'Issue Details' },
    ],
  },
  {
    label: 'On-Site Unlock',
    screens: [
      { id: 'on-site-pump-unlocked', label: 'Pump Unlocked' },
      { id: 'on-site-pump-verified', label: 'Pump Verified' },
      { id: 'on-site-fueling-in-progress', label: 'Fueling In Progress' },
      { id: 'on-site-fueling-complete', label: 'Fueling Complete' },
      { id: 'on-site-missing-info', label: 'Missing Info' },
      { id: 'on-site-missing-filled', label: 'Missing Filled' },
    ],
  },
  {
    label: 'Non-Gasboy',
    screens: [
      { id: 'non-gasboy-pump-unlocked', label: 'Pump Unlocked' },
      { id: 'non-gasboy-pump-verified', label: 'Pump Verified' },
      { id: 'non-gasboy-fueling-in-progress', label: 'Fueling In Progress' },
      { id: 'non-gasboy-fueling-complete', label: 'Fueling Complete' },
      { id: 'non-gasboy-missing-info', label: 'Missing Info' },
      { id: 'non-gasboy-missing-filled', label: 'Missing Filled' },
    ],
  },
]

export function FlowNavigator({ current, onSelect }: FlowNavigatorProps) {
  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-[var(--color-border-light)] bg-white p-3 md:block md:w-72 md:p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Transporter Flow
      </p>
      {SCREEN_GROUPS.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="mb-2 text-sm font-bold">{group.label}</p>
          <div className="flex flex-col gap-1">
            {group.screens.map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => onSelect(screen.id)}
                className={`rounded px-3 py-2 text-left text-sm transition-colors ${
                  current === screen.id
                    ? 'bg-[var(--color-brand-primary)] font-semibold text-white'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                {screen.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  )
}
