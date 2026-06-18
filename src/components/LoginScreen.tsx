import { KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { StatusBar } from './ui/StatusBar'
import { trackProps } from '../utils/tracking'

type LoginScreenProps = {
  onSignIn: () => void
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  return (
    <div className="login-screen">
      <StatusBar />

      <main id="main-content">
        <div className="login-screen__hero">
          <p className="login-screen__brand-name">Hertz</p>
          <p className="login-screen__brand-tagline">Daytona</p>
        </div>

        <div className="login-screen__panel">
          <div className="login-screen__ownership">
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            <span>Hertz-Owned Device · Authorized use only</span>
          </div>

          <div className="login-screen__card">
            <h1 className="login-screen__title">Sign in to continue</h1>
            <p className="login-screen__subtitle">
              Use your Hertz SSO credentials. This device uses certificate-based
              authentication for secure access.
            </p>

            <div className="login-screen__certificate">
              <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
              <div>
                <p className="login-screen__certificate-title">Device certificate verified</p>
                <p className="login-screen__certificate-desc">
                  MDM profile active · Device ID HRT-DYT-00482
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSignIn}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated login-screen__sign-in w-full"
              {...trackProps('login.sso-sign-in')}
            >
              <KeyRound className="h-5 w-5" />
              Sign in with SSO
            </button>

            <p className="login-screen__help">
              Need help? Contact Hertz IT Support at{' '}
              <span className="login-screen__help-link">1-800-HERTZ-IT</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
