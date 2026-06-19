import { useMemo, useState } from 'react'
import type { WidgetStateGroup, WidgetStateItem } from '../../utils/flowNavigation'
import { trackProps } from '../../utils/tracking'

type DevWidgetStatesPanelProps = {
  groups: WidgetStateGroup[]
  activeWidgetKey: string | null
  onSelectWidget: (item: WidgetStateItem) => void
}

function matchesQuery(item: WidgetStateItem, query: string): boolean {
  const haystack = [item.label, item.detail, item.screen, item.key]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

function WidgetStateButton({
  item,
  active,
  onSelect,
}: {
  item: WidgetStateItem
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`dev-widget-item${active ? ' dev-widget-item--active' : ''}`}
      aria-current={active ? 'true' : undefined}
      {...trackProps('dev.flow-nav.widget', {
        widget: item.key,
        screen: item.screen,
      })}
    >
      <span className="dev-widget-item__label">{item.label}</span>
      {item.detail && <span className="dev-widget-item__detail">{item.detail}</span>}
      <span className="dev-widget-item__screen">{item.screen}</span>
    </button>
  )
}

export function DevWidgetStatesPanel({
  groups,
  activeWidgetKey,
  onSelectWidget,
}: DevWidgetStatesPanelProps) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groups
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => matchesQuery(item, normalizedQuery)),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, normalizedQuery])

  const flatResults = useMemo(
    () => filteredGroups.flatMap((group) => group.items),
    [filteredGroups],
  )

  const totalStates = groups.reduce((count, group) => count + group.items.length, 0)

  return (
    <div className="dev-states-panel">
      <div className="dev-states-panel__toolbar">
        <label className="dev-search">
          <span className="fleet-sr-only">Search widget states</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search states…"
            className="dev-search__input"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <p className="dev-states-panel__meta">
          {normalizedQuery
            ? `${flatResults.length} match${flatResults.length === 1 ? '' : 'es'}`
            : `${totalStates} states`}
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="dev-empty-note">
          Open Transport, Fueling, or VSA to browse widget states.
        </p>
      ) : normalizedQuery ? (
        flatResults.length === 0 ? (
          <p className="dev-empty-note">No states match &ldquo;{query.trim()}&rdquo;.</p>
        ) : (
          <div className="dev-widget-group__items">
            {flatResults.map((item) => (
              <WidgetStateButton
                key={item.key}
                item={item}
                active={activeWidgetKey === item.key}
                onSelect={() => onSelectWidget(item)}
              />
            ))}
          </div>
        )
      ) : (
        filteredGroups.map((group) => {
          const hasActive = group.items.some((item) => item.key === activeWidgetKey)
          return (
            <details
              key={group.label}
              className="dev-widget-group"
              open={hasActive}
            >
              <summary className="dev-widget-group__summary">
                <span className="dev-widget-group__title">{group.label}</span>
                <span className="dev-widget-group__count">{group.items.length}</span>
              </summary>
              {group.description && (
                <p className="dev-widget-group__description">{group.description}</p>
              )}
              <div className="dev-widget-group__items">
                {group.items.map((item) => (
                  <WidgetStateButton
                    key={item.key}
                    item={item}
                    active={activeWidgetKey === item.key}
                    onSelect={() => onSelectWidget(item)}
                  />
                ))}
              </div>
            </details>
          )
        })
      )}
    </div>
  )
}
