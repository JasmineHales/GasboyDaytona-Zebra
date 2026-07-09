import { AlertCircle, GraduationCap, Languages, LogOut, MoreVertical } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { useTranslate } from '../../i18n/I18nProvider'
import { trackProps } from '../../utils/tracking'

type HeaderMenuProps = {
  onReportIssue?: () => void
  onSignOut?: () => void
  onReplayTutorial?: () => void
  onLanguageSettings?: () => void
  menuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
  elevateMenu?: boolean
  lockMenuOpen?: boolean
}

type MenuItemProps = {
  icon: ReactNode
  label: string
  trackTag: string
  tutorialId?: string
  onClick: () => void
  itemRef?: Ref<HTMLButtonElement>
}

function MenuItem({ icon, label, trackTag, tutorialId, onClick, itemRef }: MenuItemProps) {
  return (
    <button
      ref={itemRef}
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={onClick}
      className="header-menu-item"
      data-tutorial={tutorialId}
      {...trackProps(trackTag)}
    >
      <span className="flex min-w-9 shrink-0 items-center justify-start">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  )
}

export function HeaderMenu({
  onReportIssue,
  onSignOut,
  onReplayTutorial,
  onLanguageSettings,
  menuOpen,
  onMenuOpenChange,
  elevateMenu = false,
  lockMenuOpen = false,
}: HeaderMenuProps) {
  const t = useTranslate()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = menuOpen !== undefined
  const open = isControlled ? menuOpen : internalOpen
  const containerRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const setOpen = (value: boolean) => {
    if (isControlled) {
      onMenuOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }

  const closeMenu = () => {
    setOpen(false)
    toggleRef.current?.focus()
  }

  useEffect(() => {
    if (!open || isControlled || lockMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, isControlled, lockMenuOpen])

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      itemRefs.current[0]?.focus()
    })
  }, [open])

  const handleReportIssue = () => {
    closeMenu()
    onReportIssue?.()
  }

  const handleSignOut = () => {
    closeMenu()
    onSignOut?.()
  }

  const handleReplayTutorial = () => {
    closeMenu()
    onReplayTutorial?.()
  }

  const handleLanguageSettings = () => {
    closeMenu()
    onLanguageSettings?.()
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter((item): item is HTMLButtonElement => item != null)
    if (items.length === 0) return

    const currentIndex = items.findIndex((item) => item === document.activeElement)

    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length
      items[nextIndex]?.focus()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex =
        currentIndex <= 0 ? items.length - 1 : currentIndex - 1
      items[nextIndex]?.focus()
    }
  }

  let itemIndex = 0
  const registerItemRef = (index: number) => (element: HTMLButtonElement | null) => {
    itemRefs.current[index] = element
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-end">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => {
          if (lockMenuOpen) return
          setOpen(!open)
        }}
        className="header-menu-toggle"
        aria-label={t('header.moreOptions')}
        aria-expanded={open}
        aria-haspopup="menu"
        data-tutorial="header-menu"
        {...trackProps('header.menu.toggle')}
      >
        <MoreVertical className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          onKeyDown={handleMenuKeyDown}
          className={`header-menu-dropdown absolute right-0 top-full mt-4 w-[193px] overflow-hidden rounded bg-[var(--color-fleet-surface)] p-2 shadow-[0px_3px_14px_2px_rgba(0,0,0,0.12),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_5px_5px_-3px_rgba(0,0,0,0.2)] ${elevateMenu ? 'z-[210]' : 'z-30'}`}
        >
          <div className="flex flex-col gap-4 py-2">
            {onReplayTutorial && (
              <MenuItem
                itemRef={registerItemRef(itemIndex++)}
                icon={<GraduationCap className="h-6 w-6" />}
                label={t('header.menu.replayTutorial')}
                trackTag="header.menu.replay-tutorial"
                onClick={handleReplayTutorial}
              />
            )}
            <MenuItem
              itemRef={registerItemRef(itemIndex++)}
              icon={<AlertCircle className="h-6 w-6" />}
              label={t('header.menu.reportIssue')}
              trackTag="header.menu.report-issue"
              tutorialId="header-report-issue"
              onClick={handleReportIssue}
            />
            <MenuItem
              itemRef={registerItemRef(itemIndex++)}
              icon={<Languages className="h-6 w-6" />}
              label={t('header.menu.languageSettings')}
              trackTag="header.menu.language-settings"
              onClick={handleLanguageSettings}
            />
            <MenuItem
              itemRef={registerItemRef(itemIndex++)}
              icon={<LogOut className="h-6 w-6" />}
              label={t('header.menu.signOut')}
              trackTag="header.menu.sign-out"
              tutorialId="header-sign-out"
              onClick={handleSignOut}
            />
          </div>
        </div>
      )}
    </div>
  )
}
