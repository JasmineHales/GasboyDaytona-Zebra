import { X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { recordRecentOperatorSite } from '../../utils/recentOperatorSites'
import { trackProps } from '../../utils/tracking'
import { BottomSheetOverlay } from '../ui/BottomSheetOverlay'
import { OperatorSiteSearchPanel } from './OperatorSiteSearchPanel'

type OperatorSiteOverlayProps = {
  open: boolean
  selectedSite: string
  onClose: () => void
  onSelectSite: (site: string) => void
  autoFocus?: boolean
  lockOpen?: boolean
}

export function OperatorSiteOverlay({
  open,
  selectedSite,
  onClose,
  onSelectSite,
  autoFocus = true,
  lockOpen = false,
}: OperatorSiteOverlayProps) {
  const titleId = useId()
  const { messages, t } = useI18n()
  const copy = messages.home.location
  const [queryResetKey, setQueryResetKey] = useState(0)

  useEffect(() => {
    if (!open) {
      setQueryResetKey((key) => key + 1)
    }
  }, [open])

  const handleSelect = (site: string) => {
    recordRecentOperatorSite(site)
    onSelectSite(site)
    onClose()
  }

  return (
    <BottomSheetOverlay
      open={open}
      onDismiss={lockOpen ? undefined : onClose}
      dismissTrackTag="operator-site.dismiss-backdrop"
      labelId={titleId}
      sheetClassName="bottom-sheet-panel--fill"
    >
      <div className="operator-site-search-overlay">
        <div className="operator-site-search-overlay__header shrink-0 pt-1">
          <div className="flex w-full items-center">
            <h2
              id={titleId}
              className="min-w-0 flex-1 text-lg font-bold text-[var(--color-fleet-text)]"
            >
              {copy.title}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (lockOpen) return
                onClose()
              }}
              className="field-target flex shrink-0 items-center justify-center rounded p-2"
              aria-label={t('common.close')}
              {...trackProps('operator-site.close')}
            >
              <X className="h-6 w-6 text-[var(--color-fleet-text)]" aria-hidden />
            </button>
          </div>
          <p className="operator-site-search-overlay__description">{copy.description}</p>
        </div>

        <OperatorSiteSearchPanel
          key={queryResetKey}
          selectedSite={selectedSite}
          onSelectSite={handleSelect}
          autoFocus={autoFocus && open}
          active={open}
        />
      </div>
    </BottomSheetOverlay>
  )
}
