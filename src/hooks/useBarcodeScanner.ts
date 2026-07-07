import type { RefObject } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef } from 'react'

export function useBarcodeScanner(
  videoRef: RefObject<HTMLVideoElement | null>,
  active: boolean,
  parseResult: (text: string) => string | null,
  onDetect: (value: string) => void,
  onParseFailed?: (rawText: string) => void,
) {
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const detectedRef = useRef(false)
  const lastParseFailureRef = useRef<{ text: string; at: number } | null>(null)

  useEffect(() => {
    detectedRef.current = false
    lastParseFailureRef.current = null

    if (!active) {
      controlsRef.current?.stop()
      controlsRef.current = null
      return
    }

    const video = videoRef.current
    if (!video) return

    const reader = new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: 180,
    })

    let cancelled = false

    void reader
      .decodeFromVideoElement(video, (result, _error, controls) => {
        if (cancelled || detectedRef.current || !result) return

        const rawText = result.getText()
        const parsed = parseResult(rawText)
        if (!parsed) {
          if (onParseFailed) {
            const now = Date.now()
            const lastFailure = lastParseFailureRef.current
            if (
              !lastFailure ||
              lastFailure.text !== rawText ||
              now - lastFailure.at > 1800
            ) {
              lastParseFailureRef.current = { text: rawText, at: now }
              onParseFailed(rawText)
            }
          }
          return
        }

        detectedRef.current = true
        controls.stop()
        onDetect(parsed)
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop()
          return
        }

        controlsRef.current = controls
      })
      .catch(() => {
        // Camera or decoder unavailable — manual entry remains available.
      })

    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
      detectedRef.current = false
    }
  }, [active, onDetect, onParseFailed, parseResult, videoRef])
}
