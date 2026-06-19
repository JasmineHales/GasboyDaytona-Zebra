import { KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { useTranslate } from '../i18n/I18nProvider'
import { StatusBar } from './ui/StatusBar'
import { trackProps } from '../utils/tracking'

type LoginScreenProps = {
  onSignIn: () => void
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const t = useTranslate()

  return (
    <div className="login-screen">
      <StatusBar />

      <main id="main-content">
        <div className="login-screen__hero">
          <p className="login-screen__brand-name">Hertz</p>
          <p className="login-screen__brand-tagline">{t('auth.device.tagline')}</p>
        </div>

        <div className="login-screen__panel">
          <div className="login-screen__ownership">
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            <span>{t('auth.device.ownership')}</span>
          </div>

          <div className="login-screen__card">
            <h1 className="login-screen__title">{t('auth.device.title')}</h1>
            <p className="login-screen__subtitle">{t('auth.device.subtitle')}</p>

            <div className="login-screen__certificate">
              <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
              <div>
                <p className="login-screen__certificate-title">{t('auth.device.certificateTitle')}</p>
                <p className="login-screen__certificate-desc">{t('auth.device.certificateDesc')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSignIn}
              className="fleet-btn fleet-btn-lg fleet-btn-contained-info fleet-btn-elevated login-screen__sign-in w-full"
              {...trackProps('login.sso-sign-in')}
            >
              <KeyRound className="h-5 w-5" />
              {t('auth.device.signIn')}
            </button>

            <p className="login-screen__help">
              {t('auth.device.help')}{' '}
              <span className="login-screen__help-link">{t('auth.device.helpPhone')}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
