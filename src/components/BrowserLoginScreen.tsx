import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { trackProps } from '../utils/tracking'
import type { SsoUser } from '../utils/auth'

type BrowserLoginScreenProps = {
  onSignIn: (user: SsoUser) => void
}

export function BrowserLoginScreen({ onSignIn }: BrowserLoginScreenProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleSsoSignIn = () => {
    setIsRedirecting(true)
    window.setTimeout(() => {
      onSignIn({
        name: 'Jordan Lee',
        email: 'jordan.lee@hertz.com',
        site: 'Daytona',
      })
    }, 900)
  }

  return (
    <div className="browser-login-screen">
      <main id="main-content" className="browser-login-screen__main">
        <div className="browser-login-screen__hero">
          <p className="browser-login-screen__brand-name">Hertz</p>
          <p className="browser-login-screen__brand-tagline">Remote Off · Web</p>
        </div>

        <div className="browser-login-screen__panel">
          <div className="browser-login-screen__card">
            <h1 className="browser-login-screen__title">Sign in with SSO</h1>
            <p className="browser-login-screen__subtitle">
              Use your corporate Hertz credentials. You&apos;ll be redirected to
              your organization&apos;s single sign-on provider.
            </p>

            <button
              type="button"
              onClick={handleSsoSignIn}
              disabled={isRedirecting}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated browser-login-screen__sign-in w-full"
              {...trackProps('login.browser-sso-sign-in')}
            >
              {isRedirecting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <KeyRound className="h-5 w-5" aria-hidden />
              )}
              {isRedirecting ? 'Redirecting to SSO…' : 'Continue with Hertz SSO'}
            </button>

            <p className="browser-login-screen__help">
              Access is limited to authorized Hertz team members. Contact IT if you
              cannot sign in.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
