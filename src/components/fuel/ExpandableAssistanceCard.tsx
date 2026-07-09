import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'
import { trackProps } from '../../utils/tracking'

export type ExpandableAssistanceCardProps = {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  isActionLoading?: boolean
  actionDisabled?: boolean
  actionTrackTag: string
  toggleTrackTag?: string
  defaultExpanded?: boolean
  className?: string
}

/**
 * Collapsible assistance card — collapsed shows title + chevron;
 * expanded reveals description and primary action.
 */
export function ExpandableAssistanceCard({
  title,
  description,
  actionLabel,
  onAction,
  isActionLoading = false,
  actionDisabled = false,
  actionTrackTag,
  toggleTrackTag,
  defaultExpanded = false,
  className,
}: ExpandableAssistanceCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const titleId = useId()
  const descriptionId = useId()
  const panelId = useId()
  const isDisabled = actionDisabled || isActionLoading
  const resolvedToggleTrackTag = toggleTrackTag ?? `${actionTrackTag}.toggle`

  return (
    <section
      className={['expandable-assistance-card', className].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="expandable-assistance-card__toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((current) => !current)}
        {...trackProps(resolvedToggleTrackTag, { expanded: !expanded })}
      >
        <span id={titleId} className="expandable-assistance-card__title">
          {title}
        </span>
        {expanded ? (
          <ChevronUp
            className="expandable-assistance-card__chevron"
            strokeWidth={2}
            aria-hidden
          />
        ) : (
          <ChevronDown
            className="expandable-assistance-card__chevron"
            strokeWidth={2}
            aria-hidden
          />
        )}
      </button>

      {expanded ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="expandable-assistance-card__panel"
        >
          <p id={descriptionId} className="expandable-assistance-card__message">
            {description}
          </p>
          <button
            type="button"
            onClick={onAction}
            disabled={isDisabled}
            className={`expandable-assistance-card__action fleet-btn fleet-btn-lg fleet-btn-elevated w-full${
              isActionLoading ? ' expandable-assistance-card__action--loading' : ''
            }`}
            aria-busy={isActionLoading}
            {...trackProps(actionTrackTag)}
          >
            {isActionLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Reporting...
              </>
            ) : (
              actionLabel
            )}
          </button>
        </div>
      ) : null}
    </section>
  )
}
