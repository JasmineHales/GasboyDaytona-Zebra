import { useCallback, useEffect, useRef, useState } from 'react'
import {
  captureGuideBoxFromVideo,
  type NormalizedGuideBox,
} from '../utils/captureGuideBoxFromVideo'

export type LiveCameraStatus =
  | 'idle'
  | 'starting'
  | 'live'
  | 'unsupported'
  | 'denied'
  | 'error'

export function useLiveCamera(active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<LiveCameraStatus>('idle')

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    const video = videoRef.current
    if (video) {
      video.srcObject = null
    }
  }, [])

  useEffect(() => {
    if (!active) {
      stopStream()
      setStatus('idle')
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }

    let cancelled = false
    setStatus('starting')

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          video.playsInline = true
          video.muted = true
          await video.play()
        }

        setStatus('live')
      } catch (error) {
        if (cancelled) return

        const name = error instanceof DOMException ? error.name : ''
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setStatus('denied')
          return
        }

        setStatus('error')
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stopStream()
    }
  }, [active, stopStream])

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null
    }

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return null

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) return null

    context.drawImage(video, 0, 0, width, height)

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null)
            return
          }

          resolve(
            new File([blob], `pump-display-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            }),
          )
        },
        'image/jpeg',
        0.92,
      )
    })
  }, [])

  const captureGuideBoxPhoto = useCallback(
    async (guide: NormalizedGuideBox): Promise<File | null> => {
      const video = videoRef.current
      if (!video) return null
      return captureGuideBoxFromVideo(video, guide, 2)
    },
    [],
  )

  return {
    videoRef,
    status,
    capturePhoto,
    captureGuideBoxPhoto,
  }
}
