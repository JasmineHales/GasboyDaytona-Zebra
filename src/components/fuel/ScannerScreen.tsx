import { Html5Qrcode } from 'html5-qrcode'
import { ChevronLeft, ChevronRight, Keyboard } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

const SCANNER_QRBOX = 240
const SCANNER_FPS = 10

type ScannerScreenProps = {
  onBack: () => void
  onManualEntry: () => void
  onScanComplete?: () => void
}

type CameraState = 'loading' | 'ready' | 'error'

function isLocalDevHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function isPrivateLanHost(hostname: string) {
  return /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)
}

function isCameraBlockedHost(hostname: string) {
  return isPrivateLanHost(hostname) && !hostname.endsWith('.trycloudflare.com')
}

function canUseCamera() {
  return Boolean(navigator.mediaDevices?.getUserMedia) && window.isSecureContext
}

function pickRearCamera(cameras: Array<{ id: string; label: string }>) {
  const rear = cameras.find((camera) =>
    /back|rear|environment|trás|arrière/i.test(camera.label),
  )
  return rear?.id ?? cameras.at(-1)?.id
}

export function ScannerScreen({
  onBack,
  onManualEntry,
  onScanComplete,
}: ScannerScreenProps) {
  const regionId = useId().replace(/:/g, '')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scanLockRef = useRef(false)
  const [cameraState, setCameraState] = useState<CameraState>('loading')
  const [statusText, setStatusText] = useState('Starting camera…')

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) return

    if (scanner.isScanning) {
      await scanner.stop()
    }
    scanner.clear()
    scannerRef.current = null
  }, [])

  const handleScanSuccess = useCallback(() => {
    if (scanLockRef.current) return
    scanLockRef.current = true
    void stopCamera().finally(() => {
      onScanComplete?.()
    })
  }, [onScanComplete, stopCamera])

  const startCamera = useCallback(async () => {
    await stopCamera()
    scanLockRef.current = false
    setCameraState('loading')
    setStatusText('Starting camera…')

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error')
      setStatusText('Camera is not supported in this browser.')
      return
    }

    if (isCameraBlockedHost(window.location.hostname)) {
      setCameraState('error')
      setStatusText(
        'This Wi‑Fi link uses a self-signed certificate. Safari shows Not Secure and may block the camera even if you tap Allow. On your Mac run npm run phone and open the trycloudflare.com link.',
      )
      return
    }

    if (!window.isSecureContext) {
      setCameraState('error')
      setStatusText(
        isLocalDevHost(window.location.hostname)
          ? 'Open this page over HTTPS to use the camera.'
          : 'Camera requires HTTPS. On your Mac run npm run phone and open the trycloudflare.com link.',
      )
      return
    }

    const scanner = new Html5Qrcode(regionId, { verbose: false })
    scannerRef.current = scanner

    const scanConfig = {
      fps: SCANNER_FPS,
      qrbox: { width: SCANNER_QRBOX, height: SCANNER_QRBOX },
      aspectRatio: 1.777778,
      disableFlip: false,
    }

    const onDecode = () => {
      handleScanSuccess()
    }

    const ignoreFrameErrors = () => {
      // html5-qrcode reports "no code in frame" continuously while scanning.
    }

    try {
      await scanner.start(
        { facingMode: { ideal: 'environment' } },
        scanConfig,
        onDecode,
        ignoreFrameErrors,
      )
      setCameraState('ready')
      setStatusText('Ready to scan')
      return
    } catch {
      // Fall through to explicit camera selection.
    }

    try {
      const cameras = await Html5Qrcode.getCameras()
      const cameraId = cameras.length > 0 ? pickRearCamera(cameras) : undefined

      if (!cameraId) {
        throw new Error('No camera found')
      }

      await scanner.start(cameraId, scanConfig, onDecode, ignoreFrameErrors)
      setCameraState('ready')
      setStatusText('Ready to scan')
    } catch (error) {
      setCameraState('error')
      const errorName = error instanceof Error ? error.name : ''
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setStatusText(
          'Camera access was blocked. Check Safari Settings → Camera, then tap Try again.',
        )
      } else if (isCameraBlockedHost(window.location.hostname)) {
        setStatusText(
          'Camera unavailable on this Not Secure link. Run npm run phone on your Mac and use the trycloudflare.com URL.',
        )
      } else {
        setStatusText('Could not start the camera. Tap Try again or enter the pump number manually.')
      }
    }
  }, [handleScanSuccess, regionId, stopCamera])

  useEffect(() => {
    void startCamera()
    return () => {
      void stopCamera()
    }
  }, [startCamera, stopCamera])

  return (
    <div className="app-overlay bg-[#1a1a2e]">
      <div className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={onBack}
          className="field-target relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-white"
          aria-label="Close scanner"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <p className="relative z-10 text-lg font-semibold text-white">Scan Pump QR</p>
      </div>

      <div className="relative z-10 px-4 pb-2">
        <button
          type="button"
          onClick={onManualEntry}
          className="field-target flex w-full items-center gap-3 rounded-lg border border-white/40 bg-white/5 p-3 text-left transition-colors hover:border-white/60 hover:bg-white/10"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white">
            <Keyboard className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-white">
              Enter pump number manually
            </p>
            <p className="mt-0.5 text-sm text-white/70">
              Can&apos;t scan the QR? Type the number shown on the pump.
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/60" aria-hidden />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          id={regionId}
          className={`scanner-region absolute inset-0 ${
            cameraState === 'ready' ? 'scanner-region--active' : ''
          }`}
        />

        {cameraState !== 'ready' && (
          <div className="absolute inset-0 bg-[#1a1a2e]" />
        )}

        <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center px-6">
          <div className="relative h-[240px] w-[240px]" aria-hidden>
            <Corner position="tl" />
            <Corner position="tr" />
            <Corner position="bl" />
            <Corner position="br" />
            <div className="absolute left-[50px] right-[50px] top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-[var(--color-brand-primary)]" />
          </div>

          <p className="mt-6 text-center text-base text-white/90">{statusText}</p>

          {cameraState === 'error' && canUseCamera() && (
            <button
              type="button"
              onClick={() => void startCamera()}
              className="pointer-events-auto mt-4 fleet-btn fleet-btn-md fleet-btn-outlined border-white/40 text-white"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const positionClass = {
    tl: 'left-0 top-0 border-l-4 border-t-4',
    tr: 'right-0 top-0 border-r-4 border-t-4',
    bl: 'bottom-0 left-0 border-b-4 border-l-4',
    br: 'bottom-0 right-0 border-b-4 border-r-4',
  }[position]

  return (
    <div
      className={`absolute h-6 w-6 rounded-sm border-white ${positionClass}`}
    />
  )
}
