import { describe, expect, it, beforeEach } from 'vitest'
import {
  DEFAULT_DESIGN_VERSION,
  readDesignVersionDevOverride,
  readDesignVersionFromUrl,
  resolveDesignVersion,
  writeDesignVersionDevOverride,
} from './designVersion'

function mockLocation(search: string) {
  const url = new URL(`http://localhost/${search}`)
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      href: url.href,
      search: url.search,
      pathname: url.pathname,
      hash: url.hash,
    },
  })
}

describe('designVersion', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mockLocation('')
    window.history.replaceState = () => {}
  })

  it('reads design version from URL', () => {
    mockLocation('?design=v3')
    expect(readDesignVersionFromUrl()).toBe('v3')
  })

  it('maps legacy v1 URL param to v2', () => {
    mockLocation('?design=v1')
    expect(readDesignVersionFromUrl()).toBe('v2')
  })

  it('persists URL design version to sessionStorage and strips the param', () => {
    mockLocation('?design=v3')
    let replaced = ''
    window.history.replaceState = (_state, _title, url) => {
      replaced = String(url)
    }

    expect(resolveDesignVersion()).toBe('v3')
    expect(readDesignVersionDevOverride()).toBe('v3')
    expect(replaced).toBe('/')
  })

  it('falls back to session override then default', () => {
    writeDesignVersionDevOverride('v3')
    expect(resolveDesignVersion()).toBe('v3')

    sessionStorage.clear()
    expect(resolveDesignVersion()).toBe(DEFAULT_DESIGN_VERSION)
  })

  it('migrates legacy v1 session override to v2', () => {
    sessionStorage.setItem('remote-off.dev.design-version', 'v1')
    expect(resolveDesignVersion()).toBe('v2')
  })
})
