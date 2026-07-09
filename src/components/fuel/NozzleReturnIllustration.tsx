type NozzleReturnIllustrationProps = {
  label: string
  stepLabel: string
}

const ASSET_BASE = '/assets/fuel-nozzle-return'

const SEATED_HOSE_PATH =
  'M14.9131 2.79558C-1.74091 27.4911 3.02479 60.7879 25.9375 79.8203L38.4768 90.2361C71.6887 117.824 121.183 112.237 147.41 77.9408L162.578 58.1064'

export function NozzleReturnIllustration({ label, stepLabel }: NozzleReturnIllustrationProps) {
  return (
    <figure className="fuel-nozzle-confirm-graphic" aria-label={label}>
      <p className="fuel-nozzle-confirm-graphic__step" aria-hidden="true">
        {stepLabel}
      </p>

      <div className="fuel-nozzle-confirm-graphic__stage">
        <div className="fuel-nozzle-confirm-graphic__scene" aria-hidden="true">
          <svg
            className="fuel-nozzle-confirm-graphic__hose"
            viewBox="0 0 166.55 112.778"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={SEATED_HOSE_PATH}
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="fuel-nozzle-confirm-graphic__nozzle">
            <img
              className="fuel-nozzle-confirm-graphic__nozzle-image"
              src={`${ASSET_BASE}/nozzle.svg`}
              alt=""
            />
          </div>

          <div className="fuel-nozzle-confirm-graphic__pump-body">
            <div className="fuel-nozzle-confirm-graphic__pump-display">
              <span className="fuel-nozzle-confirm-graphic__pump-display-bar fuel-nozzle-confirm-graphic__pump-display-bar--wide" />
              <span className="fuel-nozzle-confirm-graphic__pump-display-bar fuel-nozzle-confirm-graphic__pump-display-bar--narrow" />
            </div>
            <div className="fuel-nozzle-confirm-graphic__pump-base" />
          </div>
        </div>
      </div>

      <figcaption className="fuel-nozzle-confirm-graphic__caption">{label}</figcaption>
    </figure>
  )
}
