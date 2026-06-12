import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, loadEnv, type Plugin, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function parseCookie(header?: string): Record<string, string> {
  if (!header) return {}
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [key, ...rest] = part.trim().split('=')
      return [key, rest.join('=')]
    }),
  )
}

function privateDevGate(token: string): Plugin {
  return {
    name: 'private-dev-gate',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '/'

        if (
          url.startsWith('/@') ||
          url.startsWith('/__vite') ||
          url.startsWith('/node_modules/') ||
          url.startsWith('/src/') ||
          url.endsWith('.js') ||
          url.endsWith('.css') ||
          url.endsWith('.ts') ||
          url.endsWith('.tsx') ||
          url.endsWith('.svg') ||
          url.endsWith('.ico') ||
          url.endsWith('.map')
        ) {
          return next()
        }

        const parsed = new URL(url, 'http://localhost')
        const provided =
          parsed.searchParams.get('token') ||
          req.headers['x-dev-access-token'] ||
          parseCookie(req.headers.cookie).dev_access

        if (provided === token) {
          if (parsed.searchParams.has('token')) {
            const redirect = `${parsed.pathname}${parsed.hash}`
            const secure =
              req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''
            res.statusCode = 302
            res.setHeader(
              'Set-Cookie',
              `dev_access=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secure}`,
            )
            res.setHeader('Location', redirect)
            res.end()
            return
          }
          return next()
        }

        res.statusCode = 401
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end('Unauthorized. This is a private dev session.')
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const lanMode = process.env.DEV_LAN === 'true'
  const skipGate = process.env.DEV_LAN_SKIP_GATE === 'true'
  const accessToken = process.env.DEV_ACCESS_TOKEN || env.DEV_ACCESS_TOKEN
  const lanIp = process.env.DEV_LAN_IP

  if (lanMode && !skipGate && !accessToken) {
    throw new Error(
      'DEV_ACCESS_TOKEN is required for LAN mode. Copy .env.example to .env.local and set a token, or use npm run dev:phone.',
    )
  }

  const plugins: PluginOption[] = [react(), tailwindcss()]
  if (lanMode) {
    plugins.push(basicSsl())
  }
  if (lanMode && accessToken && !skipGate) {
    plugins.push(privateDevGate(accessToken))
  }

  return {
    plugins,
    server: {
      host: lanMode ? '0.0.0.0' : '127.0.0.1',
      port: 5174,
      strictPort: true,
      allowedHosts: lanMode ? true : undefined,
      hmr: lanMode && lanIp
        ? { host: lanIp, port: 5174, clientPort: 5174 }
        : lanMode
          ? { clientPort: 5174 }
          : undefined,
    },
  }
})
