import type { PlateBoundingBox, PlatePreprocessVariant } from './plateAlprTypes'

export const PLATE_PREPROCESS_VARIANTS: PlatePreprocessVariant[] = [
  { id: 'adaptive-110', threshold: 110, sharpen: false, upscale: true },
  { id: 'adaptive-135', threshold: 135, sharpen: false, upscale: true },
  { id: 'adaptive-160', threshold: 160, sharpen: false, upscale: false },
  { id: 'contrast-sharpen', threshold: 135, sharpen: true, upscale: true },
  { id: 'upscale-sharpen', threshold: 120, sharpen: true, upscale: true },
]

export const DESKEW_ANGLES = [-12, -8, -4, 0, 4, 8, 12] as const

const MAX_OCR_WIDTH = 960
const CROP_PADDING_RATIO = 0.12

export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/jpeg', 0.82)
}

export function cropPlateRegion(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  box: PlateBoundingBox,
): HTMLCanvasElement {
  const padX = Math.round(box.width * CROP_PADDING_RATIO)
  const padY = Math.round(box.height * CROP_PADDING_RATIO)

  const cropX = Math.max(0, Math.round(box.x - padX))
  const cropY = Math.max(0, Math.round(box.y - padY))
  const cropRight = Math.min(sourceWidth, Math.round(box.x + box.width + padX))
  const cropBottom = Math.min(sourceHeight, Math.round(box.y + box.height + padY))
  const cropWidth = Math.max(1, cropRight - cropX)
  const cropHeight = Math.max(1, cropBottom - cropY)

  const canvas = document.createElement('canvas')
  canvas.width = cropWidth
  canvas.height = cropHeight

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not crop plate region')
  }

  context.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
  return canvas
}

export function rotateCanvas(source: HTMLCanvasElement, angleDeg: number): HTMLCanvasElement {
  if (angleDeg === 0) return source

  const radians = (angleDeg * Math.PI) / 180
  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))
  const width = Math.max(1, Math.round(source.width * cos + source.height * sin))
  const height = Math.max(1, Math.round(source.width * sin + source.height * cos))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not rotate plate crop')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.translate(width / 2, height / 2)
  context.rotate(radians)
  context.drawImage(source, -source.width / 2, -source.height / 2)
  return canvas
}

function grayscaleContrast(imageData: ImageData) {
  const { data } = imageData
  for (let index = 0; index < data.length; index += 4) {
    const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2]
    const contrast = Math.min(255, Math.max(0, (gray - 128) * 2.2 + 128))
    data[index] = contrast
    data[index + 1] = contrast
    data[index + 2] = contrast
  }
}

function adaptiveThreshold(imageData: ImageData, threshold: number) {
  const { data } = imageData
  for (let index = 0; index < data.length; index += 4) {
    const value = data[index] < threshold ? 0 : 255
    data[index] = value
    data[index + 1] = value
    data[index + 2] = value
  }
}

function denoiseBinary(imageData: ImageData) {
  const { width, height, data } = imageData
  const copy = Uint8ClampedArray.from(data)

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4
      let neighbors = 0
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (copy[((y + oy) * width + (x + ox)) * 4] === 0) neighbors += 1
        }
      }
      const value = neighbors >= 5 ? 0 : 255
      data[index] = value
      data[index + 1] = value
      data[index + 2] = value
    }
  }
}

function sharpenBinary(imageData: ImageData) {
  const { width, height, data } = imageData
  const copy = Uint8ClampedArray.from(data)
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let sum = 0
      let ki = 0
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const sample = copy[((y + ky) * width + (x + kx)) * 4]
          sum += (sample < 128 ? 0 : 255) * kernel[ki]
          ki += 1
        }
      }
      const value = sum < 128 ? 0 : 255
      const index = (y * width + x) * 4
      data[index] = value
      data[index + 1] = value
      data[index + 2] = value
    }
  }
}

export function preprocessPlateCrop(
  source: HTMLCanvasElement,
  variant: PlatePreprocessVariant,
): HTMLCanvasElement {
  let width = source.width
  let height = source.height

  if (variant.upscale && width < 320) {
    const scale = width < 160 ? 3 : 2
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  } else if (width < 220) {
    width = Math.round(width * 2)
    height = Math.round(height * 2)
  } else if (width > MAX_OCR_WIDTH) {
    const scale = MAX_OCR_WIDTH / width
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, width)
  canvas.height = Math.max(1, height)

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not preprocess plate crop')
  }

  context.imageSmoothingEnabled = true
  context.drawImage(source, 0, 0, canvas.width, canvas.height)

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  grayscaleContrast(imageData)
  adaptiveThreshold(imageData, variant.threshold)
  denoiseBinary(imageData)
  if (variant.sharpen) {
    sharpenBinary(imageData)
  }
  context.putImageData(imageData, 0, 0)
  return canvas
}

export function estimateDeskewAngle(canvas: HTMLCanvasElement): number {
  let bestAngle = 0
  let bestScore = -1

  for (const angle of DESKEW_ANGLES) {
    const rotated = rotateCanvas(canvas, angle)
    const context = rotated.getContext('2d')
    if (!context) continue

    const { width, height } = rotated
    const imageData = context.getImageData(0, 0, width, height)
    const rowScores: number[] = []

    for (let y = 0; y < height; y += 2) {
      let transitions = 0
      let previousDark = false
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4
        const dark = imageData.data[index] < 128
        if (x > 0 && dark !== previousDark) transitions += 1
        previousDark = dark
      }
      rowScores.push(transitions)
    }

    rowScores.sort((a, b) => b - a)
    const score = rowScores.slice(0, Math.max(1, Math.floor(rowScores.length * 0.15))).reduce(
      (sum, value) => sum + value,
      0,
    )

    if (score > bestScore) {
      bestScore = score
      bestAngle = angle
    }
  }

  return bestAngle
}
