export type AuthMethod = 'device' | 'browser-sso'

export type SsoUser = {
  name: string
  email: string
  site: string
}

const AUTH_KEY = 'remote-off.authenticated'
const AUTH_METHOD_KEY = 'remote-off.auth-method'
const SSO_USER_KEY = 'remote-off.sso-user'

export const MOCK_SSO_USER: SsoUser = {
  name: 'Jordan Lee',
  email: 'jordan.lee@hertz.com',
  site: 'Daytona',
}

export function readAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

export function readAuthMethod(): AuthMethod | null {
  try {
    const value = sessionStorage.getItem(AUTH_METHOD_KEY)
    if (value === 'device' || value === 'browser-sso') return value
  } catch {
    // ignore
  }
  return null
}

export function readSsoUser(): SsoUser | null {
  try {
    const raw = sessionStorage.getItem(SSO_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SsoUser
  } catch {
    return null
  }
}

export function persistAuth(method: AuthMethod, user?: SsoUser) {
  try {
    sessionStorage.setItem(AUTH_KEY, '1')
    sessionStorage.setItem(AUTH_METHOD_KEY, method)
    if (method === 'browser-sso' && user) {
      sessionStorage.setItem(SSO_USER_KEY, JSON.stringify(user))
    }
  } catch {
    // ignore
  }
}

export function clearAuth() {
  try {
    sessionStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(AUTH_METHOD_KEY)
    sessionStorage.removeItem(SSO_USER_KEY)
  } catch {
    // ignore
  }
}
