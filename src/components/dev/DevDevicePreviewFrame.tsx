import type { ReactNode } from 'react'
import { EM45_VIEWPORT } from '../../utils/devDeviceFrame'
import { getRuntimeMode } from '../../utils/runtime'
import { trackProps } from '../../utils/tracking'

export function useDevEm45Preview(devExperience: 'device' | 'browser'): boolean {
  return import.meta.env.DEV && devExperience === 'device' && getRuntimeMode() !== 'hertz-device'
}

export function devAppShellClassName(useEm45Preview: boolean, extra = ''): string {
  const base = `app-shell relative flex min-h-0 flex-1 flex-col overflow-hidden${extra ? ` ${extra}` : ''}`
  if (useEm45Preview) return base
  return `${base} sm:max-w-xl sm:rounded-xl sm:shadow-lg md:max-w-2xl md:rounded-2xl lg:max-w-3xl xl:max-w-4xl`
}

type DevExperienceMobileSwitcherProps = {
  value: 'device' | 'browser'
  onChange: (value: 'device' | 'browser') => void
}

export function DevExperienceMobileSwitcher({
  value,
  onChange,
}: DevExperienceMobileSwitcherProps) {
  if (!import.meta.env.DEV || getRuntimeMode() === 'hertz-device') return null

  return (
    <div className="dev-experience-mobile md:hidden" aria-label="Preview experience">
      <button
        type="button"
        className={`dev-experience-mobile__button${value === 'device' ? ' dev-experience-mobile__button--active' : ''}`}
        aria-pressed={value === 'device'}
        onClick={() => onChange('device')}
        {...trackProps('dev.experience', { variant: 'device' })}
      >
        Zebra
      </button>
      <button
        type="button"
        className={`dev-experience-mobile__button${value === 'browser' ? ' dev-experience-mobile__button--active' : ''}`}
        aria-pressed={value === 'browser'}
        onClick={() => onChange('browser')}
        {...trackProps('dev.experience', { variant: 'browser' })}
      >
        Browser
      </button>
    </div>
  )
}

type DevDevicePreviewFrameProps = {
  devExperience: 'device' | 'browser'
  mobileSwitcher?: ReactNode
  children: ReactNode
}

export function DevDevicePreviewFrame({
  devExperience,
  mobileSwitcher,
  children,
}: DevDevicePreviewFrameProps) {
  const useEm45Preview = useDevEm45Preview(devExperience)

  return (
    <div
      className={`app-preview-column flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-hertz-page)] p-0 sm:p-3 md:p-4 lg:p-6${
        useEm45Preview ? ' app-preview-column--framed' : ''
      }`}
    >
      {mobileSwitcher}
      <div
        className={`dev-device-frame ${useEm45Preview ? 'dev-device-frame--em45' : 'dev-device-frame--responsive'}`}
      >
        {useEm45Preview ? (
          <div className="dev-device-frame__chrome" aria-hidden>
            <span className="dev-device-frame__label">Zebra EM45</span>
            <span className="dev-device-frame__size">
              {EM45_VIEWPORT.width} × {EM45_VIEWPORT.height}
            </span>
          </div>
        ) : null}
        <div
          className={`dev-device-frame__scale-host${
            useEm45Preview ? ' dev-device-frame__scale-host--em45' : ''
          }`}
        >
          <div
            className={`dev-device-frame__viewport${useEm45Preview ? ' dev-device-frame__viewport--em45' : ''}`}
            {...(useEm45Preview ? { 'data-em45-preview': true } : {})}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
