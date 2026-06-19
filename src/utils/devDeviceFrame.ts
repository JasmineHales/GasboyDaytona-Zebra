export type DevDeviceFrameId = 'responsive' | 'em45'

export type DevDeviceFrameSpec = {
  id: DevDeviceFrameId
  label: string
  hint: string
  /** CSS viewport width in portrait (logical px). */
  width: number | null
  /** CSS viewport height in portrait (logical px). */
  height: number | null
  deviceLabel?: string
}

const STORAGE_KEY = 'remote-off.dev-device-frame'

/** Zebra EM45 — 6.7" FHD+ 1080×2400 portrait @ ~3× density → 360×800 CSS. */
export const EM45_VIEWPORT = {
  width: 360,
  height: 800,
} as const

/** Zebra EM45 — 6.7" FHD+ 1080×2400 portrait @ ~3× density → 360×800 CSS. */
export const DEV_DEVICE_FRAMES: Record<DevDeviceFrameId, DevDeviceFrameSpec> = {
  responsive: {
    id: 'responsive',
    label: 'Responsive',
    hint: 'Fluid width with desktop max-width shell',
    width: null,
    height: null,
  },
  em45: {
    id: 'em45',
    label: 'EM45 Zebra',
    hint: '6.7" handheld · 360×800 CSS viewport',
    width: EM45_VIEWPORT.width,
    height: EM45_VIEWPORT.height,
    deviceLabel: 'Zebra EM45',
  },
}

export const DEV_DEVICE_FRAME_OPTIONS = Object.values(DEV_DEVICE_FRAMES).map(
  (frame) => ({
    value: frame.id,
    label: frame.label,
  }),
)

export function readDevDeviceFrame(): DevDeviceFrameId {
  if (typeof window === 'undefined') return 'responsive'

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'em45' || stored === 'responsive') return stored
  } catch {
    // ignore
  }

  return 'responsive'
}

export function persistDevDeviceFrame(frame: DevDeviceFrameId): void {
  try {
    localStorage.setItem(STORAGE_KEY, frame)
  } catch {
    // ignore
  }
}

export function formatDevDeviceFrameLabel(frame: DevDeviceFrameId): string {
  const spec = DEV_DEVICE_FRAMES[frame]
  if (!spec.width || !spec.height) return spec.label
  return `${spec.label} · ${spec.width}×${spec.height}`
}
