import { useEffect, useId, useState } from 'react'
import { formatElapsed, formatElapsedSpeech } from '../../utils/elapsed'

type ElapsedTimerProps = {
  startedAt: number | null
  compact?: boolean
  labelId?: string
}

export function ElapsedTimer({
  startedAt,
  compact = false,
  labelId,
}: ElapsedTimerProps) {
  const fallbackId = useId()
  const timerId = labelId ?? fallbackId
  const [elapsed, setElapsed] = useState(0)
  const [announcement, setAnnouncement] = useState('Elapsed time 0 seconds')

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0)
      return
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  const speech = formatElapsedSpeech(elapsed)
  const announcementInterval = Math.floor(elapsed / 60)

  useEffect(() => {
    if (!startedAt) return
    setAnnouncement(speech)
  }, [announcementInterval, speech, startedAt])

  const { hours, minutes, seconds } = formatElapsed(elapsed)

  if (!startedAt) {
    return (
      <p className="elapsed-timer elapsed-timer--empty" id={timerId} aria-label="Elapsed time unavailable">
        --
      </p>
    )
  }

  return (
    <>
      <div
        className={`elapsed-timer ${compact ? 'elapsed-timer--compact' : ''}`}
        id={timerId}
        role="timer"
        aria-live="off"
        aria-labelledby={labelId}
        aria-valuetext={speech}
        aria-atomic="true"
      >
        <span className="elapsed-timer__segment" aria-hidden="true">
          {hours}
        </span>
        <span className="elapsed-timer__separator" aria-hidden="true">
          :
        </span>
        <span className="elapsed-timer__segment" aria-hidden="true">
          {minutes}
        </span>
        <span className="elapsed-timer__separator" aria-hidden="true">
          :
        </span>
        <span className="elapsed-timer__segment" aria-hidden="true">
          {seconds}
        </span>
      </div>
      <span className="fleet-sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </>
  )
}
