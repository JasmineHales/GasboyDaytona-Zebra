export type NormalizedGuideBox = {
  x: number
  y: number
  width: number
  height: number
}

export type VideoSourceRegion = {
  x: number
  y: number
  width: number
  height: number
}

/** Map on-screen guide box (object-fit: cover) to source video pixel coordinates. */
export function mapGuideBoxToVideoSource(
  video: HTMLVideoElement,
  guide: NormalizedGuideBox,
): VideoSourceRegion | null {
  const displayWidth = video.clientWidth || video.videoWidth
  const displayHeight = video.clientHeight || video.videoHeight
  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight

  if (!displayWidth || !displayHeight || !videoWidth || !videoHeight) {
    return null
  }

  const scale = Math.max(displayWidth / videoWidth, displayHeight / videoHeight)
  const renderedWidth = videoWidth * scale
  const renderedHeight = videoHeight * scale
  const offsetX = (renderedWidth - displayWidth) / 2
  const offsetY = (renderedHeight - displayHeight) / 2

  const boxLeft = guide.x * displayWidth
  const boxTop = guide.y * displayHeight
  const boxWidth = guide.width * displayWidth
  const boxHeight = guide.height * displayHeight

  const srcX = (offsetX + boxLeft) / scale
  const srcY = (offsetY + boxTop) / scale
  const srcWidth = boxWidth / scale
  const srcHeight = boxHeight / scale

  const x = Math.max(0, Math.min(videoWidth - 1, Math.round(srcX)))
  const y = Math.max(0, Math.min(videoHeight - 1, Math.round(srcY)))
  const width = Math.max(1, Math.min(videoWidth - x, Math.round(srcWidth)))
  const height = Math.max(1, Math.min(videoHeight - y, Math.round(srcHeight)))

  return { x, y, width, height }
}

function canvasToJpegFile(canvas: HTMLCanvasElement, label: string): Promise<File | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null)
          return
        }

        resolve(
          new File([blob], `pump-display-${label}-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          }),
        )
      },
      'image/jpeg',
      0.94,
    )
  })
}

export async function captureGuideBoxFromVideo(
  video: HTMLVideoElement,
  guide: NormalizedGuideBox,
  scale = 3,
): Promise<File | null> {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

  const region = mapGuideBoxToVideoSource(video, guide)
  if (!region || region.width < 8 || region.height < 8) {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(region.width * scale))
  canvas.height = Math.max(1, Math.round(region.height * scale))

  const context = canvas.getContext('2d')
  if (!context) return null

  context.imageSmoothingEnabled = scale > 1
  context.drawImage(
    video,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  return canvasToJpegFile(canvas, 'guide')
}
