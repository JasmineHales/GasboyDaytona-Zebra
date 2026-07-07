import { useCallback, useEffect, useRef, useState } from 'react'

type VoiceRecordingResult = {
  blob: Blob
  durationSeconds: number
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const cancelRecording = useCallback(() => {
    clearTimer()
    recorderRef.current?.stop()
    recorderRef.current = null
    chunksRef.current = []
    startedAtRef.current = null
    setIsRecording(false)
    setDurationSeconds(0)
    releaseStream()
  }, [clearTimer, releaseStream])

  const startRecording = useCallback(async () => {
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('unsupported')
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      startedAtRef.current = Date.now()

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.start()
      setIsRecording(true)
      setDurationSeconds(0)

      timerRef.current = window.setInterval(() => {
        if (!startedAtRef.current) return
        setDurationSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
      }, 250)

      return true
    } catch {
      releaseStream()
      setError('permission')
      return false
    }
  }, [releaseStream])

  const stopRecording = useCallback(async (): Promise<VoiceRecordingResult | null> => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return null

    return new Promise((resolve) => {
      recorder.onstop = () => {
        clearTimer()
        const duration = startedAtRef.current
          ? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000))
          : durationSeconds
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })

        chunksRef.current = []
        recorderRef.current = null
        startedAtRef.current = null
        setIsRecording(false)
        setDurationSeconds(0)
        releaseStream()

        resolve(blob.size > 0 ? { blob, durationSeconds: duration } : null)
      }

      recorder.stop()
    })
  }, [clearTimer, durationSeconds, releaseStream])

  useEffect(() => {
    return () => {
      clearTimer()
      recorderRef.current?.stop()
      releaseStream()
    }
  }, [clearTimer, releaseStream])

  return {
    isRecording,
    durationSeconds,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
