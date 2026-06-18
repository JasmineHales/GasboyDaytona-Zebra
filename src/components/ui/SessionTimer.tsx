import { useEffect, useState } from 'react'

const SESSION_START_KEY = 'remote-off-session-start'

export function resetSessionTimer() {
  sessionStorage.removeItem(SESSION_START_KEY)
}

function getSessionStartAt(): number {
  const stored = sessionStorage.getItem(SESSION_START_KEY)
  if (stored) return Number(stored)
  const now = Date.now()
  sessionStorage.setItem(SESSION_START_KEY, String(now))
  return now
}

function formatElapsed(totalSeconds: number) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return { hours, minutes, seconds }
}

export function SessionTimer() {
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

  const { hours, minutes, seconds } = formatElapsed(elapsed)
  const display = `${hours}:${minutes}:${seconds}`

  return (
    <div className="session-timer" aria-label={`Session timer ${display}`}>
      <span className="session-timer__label">Session Timer</span>
      <span className="session-timer__value" aria-hidden="true">
        <span>{hours}</span>
        <span>:</span>
        <span>{minutes}</span>
        <span>:</span>
        <span>{seconds}</span>
      </span>
    </div>
  )
}
