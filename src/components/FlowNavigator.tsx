import {
  PAGE_NAV_ITEMS,
  widgetGroupsForView,
  type PageNavItem,
  type WidgetStateItem,
  type WorkflowView,
} from '../utils/flowNavigation'
import { trackProps } from '../utils/tracking'

type FlowNavigatorProps = {
  activePageKey: string
  activeWidgetKey: string | null
  workflowView: WorkflowView | null
  onSelectPage: (item: PageNavItem) => void
  onSelectWidget: (item: WidgetStateItem) => void
}

export function FlowNavigator({
  activePageKey,
  activeWidgetKey,
  workflowView,
  onSelectPage,
  onSelectWidget,
}: FlowNavigatorProps) {
  const widgetGroups = workflowView ? widgetGroupsForView(workflowView) : []

  return (
    <aside
      className="hidden w-64 shrink-0 overflow-y-auto border-r border-[var(--color-border-light)] bg-white p-3 md:block md:w-72 md:p-4 lg:w-80"
      aria-label="Developer screen navigator"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        Transporter Flow
      </p>

      <section className="mb-5" aria-labelledby="dev-nav-pages">
        <h2
          id="dev-nav-pages"
          className="mb-2 text-sm font-bold text-[var(--color-text-primary)]"
        >
          Page
        </h2>
        <p className="mb-2 text-[length:var(--text-ui-sm)] leading-snug text-[var(--color-text-muted)]">
          Switch screens without resetting widget state.
        </p>
        <div className="flex flex-col gap-1">
          {PAGE_NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectPage(item)}
              className={`min-h-[var(--touch-target)] rounded px-3 py-2 text-left text-[length:var(--text-ui-sm)] transition-colors ${
                activePageKey === item.key
                  ? 'bg-[var(--color-brand-primary)] font-semibold text-white'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]'
              }`}
              aria-current={activePageKey === item.key ? 'true' : undefined}
              {...trackProps('dev.flow-nav.page', { page: item.key })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="dev-nav-widgets">
        <h2
          id="dev-nav-widgets"
          className="mb-2 text-sm font-bold text-[var(--color-text-primary)]"
        >
          Widget state
        </h2>
        <p className="mb-3 text-[length:var(--text-ui-sm)] leading-snug text-[var(--color-text-muted)]">
          Patch workflow widgets on the current page.
        </p>
        {workflowView == null ? (
          <p className="rounded-lg bg-[var(--color-surface-muted)] px-3 py-2 text-[length:var(--text-ui-sm)] text-[var(--color-text-muted)]">
            Open Transport or VSA to set widget states.
          </p>
        ) : (
          widgetGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelectWidget(item)}
                    className={`min-h-[var(--touch-target)] rounded px-3 py-2 text-left text-[length:var(--text-ui-sm)] transition-colors ${
                      activeWidgetKey === item.key
                        ? 'bg-[var(--color-hertz-black)] font-semibold text-white'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                    aria-current={activeWidgetKey === item.key ? 'true' : undefined}
                    {...trackProps('dev.flow-nav.widget', {
                      widget: item.key,
                      screen: item.screen,
                    })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </aside>
  )
}
