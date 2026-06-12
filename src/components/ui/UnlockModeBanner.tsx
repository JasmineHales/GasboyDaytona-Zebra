import { Info, Smartphone } from 'lucide-react'

type UnlockModeBannerProps = {
  mode: 'remote' | 'on-site'
}

export function UnlockModeBanner({ mode }: UnlockModeBannerProps) {
  if (mode === 'on-site') {
    return (
      <div className="fleet-mode-banner fleet-mode-banner--onsite fleet-mode-banner--compact">
        <span className="fleet-mode-banner__chip fleet-mode-banner__chip--onsite">
          At terminal
        </span>
        <p className="fleet-mode-banner__desc--inline">
          Unlock at the pump first, then verify below.
        </p>
      </div>
    )
  }

  return (
    <div className="fleet-mode-banner fleet-mode-banner--remote fleet-mode-banner--compact">
      <span className="fleet-mode-banner__chip fleet-mode-banner__chip--remote">
        In app
      </span>
      <Smartphone className="fleet-mode-banner__icon--compact" aria-hidden />
      <p className="fleet-mode-banner__desc--inline">
        Scan or enter the pump number to unlock here.
      </p>
    </div>
  )
}

export function NonGasboyInfoBanner() {
  return (
    <div className="fleet-mode-banner fleet-mode-banner--manual fleet-mode-banner--compact">
      <Info className="fleet-mode-banner__icon--compact" aria-hidden />
      <p className="fleet-mode-banner__desc--inline">
        Enter pump number and gallons manually after fueling.
      </p>
    </div>
  )
}
