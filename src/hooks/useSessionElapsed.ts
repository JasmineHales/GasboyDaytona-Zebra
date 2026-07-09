import { useEffect, useState } from 'react'

const SESSION_START_KEY = 'remote-off-session-start'

export function getSessionStartAt(): number {
  const stored = sessionStorage.getItem(SESSION_START_KEY)
  if (stored) return Number(stored)
  const now = Date.now()
  sessionStorage.setItem(SESSION_START_KEY, String(now))
  return now
}

export function formatSessionElapsed(totalSeconds: number): string {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export function useSessionElapsed(): string {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startedAt = getSessionStartAt()
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return formatSessionElapsed(elapsed)
}
