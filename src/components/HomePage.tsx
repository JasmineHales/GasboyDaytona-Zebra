import type { ReactNode } from 'react'
import { ChevronRight, ClipboardList, Truck } from 'lucide-react'
import { Header } from './ui/Header'

type HomePageProps = {
  onSelectVsa: () => void
  onSelectTransport: () => void
  onReportIssue?: () => void
  onSignOut?: () => void
}

type HomeOptionProps = {
  title: string
  action: string
  icon: ReactNode
  accentClass: string
  onClick: () => void
}

function HomeOption({ title, action, icon, accentClass, onClick }: HomeOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fleet-shadow-1 flex min-h-[72px] w-full items-center gap-4 rounded-[4px] border border-[var(--color-fleet-secondary-border)] bg-white p-5 text-left transition-colors hover:border-[var(--color-fleet-info)]"
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[4px] text-[var(--color-fleet-info)] ${accentClass}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-[var(--color-fleet-text)]">{title}</p>
        <p className="mt-0.5 text-sm font-semibold text-[var(--color-fleet-text-blue)]">{action}</p>
      </div>
      <ChevronRight className="h-6 w-6 shrink-0 text-[var(--color-fleet-text-secondary)]" />
    </button>
  )
}

export function HomePage({
  onSelectVsa,
  onSelectTransport,
  onReportIssue,
  onSignOut,
}: HomePageProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white">
      <Header
        title="Daytona"
        subtitle="Select a workflow to get started"
        showBack={false}
        showSessionTimer={false}
        onReportIssue={onReportIssue}
        onSignOut={onSignOut}
      />

      <main className="app-scroll flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="mt-auto flex w-full flex-col gap-3">
          <HomeOption
            title="VSA"
            action="Start service workflow"
            accentClass="bg-[var(--color-fleet-surface-muted)]"
            icon={<ClipboardList className="h-7 w-7" />}
            onClick={onSelectVsa}
          />
          <HomeOption
            title="Transport"
            action="Start transport"
            accentClass="bg-[var(--color-fleet-brand)]/30"
            icon={<Truck className="h-7 w-7" />}
            onClick={onSelectTransport}
          />
        </div>
      </main>
    </div>
  )
}
