import type { PlateBoundingBox } from './plateAlprTypes'
import {
  detectPlatesByContour,
  fallbackHeuristicRegions,
  mergePlateDetections,
} from './plateDetectorShared'
import { detectPlatesWithPaddleOnnx } from './platePaddleDetector'
import { safeAsync } from './plateAlprUtils'

type ContourScanRegion = {
  topRatio: number
  heightRatio: number
}

const CONTOUR_SCAN_REGIONS: ContourScanRegion[] = [
  { topRatio: 0.14, heightRatio: 0.72 },
  { topRatio: 0.28, heightRatio: 0.72 },
  { topRatio: 0, heightRatio: 1 },
]

function detectPlatesByContourCanvas(
  canvas: HTMLCanvasElement,
  region: ContourScanRegion,
): PlateBoundingBox[] {
  const focusTop = Math.round(canvas.height * region.topRatio)
  const focusHeight = Math.min(
    canvas.height - focusTop,
    Math.round(canvas.height * region.heightRatio),
  )
  if (focusHeight < 24) return []

  const scaledWidth = Math.min(960, canvas.width)
  const scale = scaledWidth / canvas.width
  const scaledHeight = Math.round(focusHeight * scale)

  const working = document.createElement('canvas')
  working.width = scaledWidth
  working.height = scaledHeight
  const context = working.getContext('2d')
  if (!context) return []

  context.drawImage(
    canvas,
    0,
    focusTop,
    canvas.width,
    focusHeight,
    0,
    0,
    scaledWidth,
    scaledHeight,
  )

  const imageData = context.getImageData(0, 0, scaledWidth, scaledHeight)
  const grayscale = context.createImageData(scaledWidth, scaledHeight)
  for (let index = 0; index < imageData.data.length; index += 4) {
    const gray =
      0.299 * imageData.data[index] +
      0.587 * imageData.data[index + 1] +
      0.114 * imageData.data[index + 2]
    grayscale.data[index] = gray
    grayscale.data[index + 1] = gray
    grayscale.data[index + 2] = gray
    grayscale.data[index + 3] = 255
  }

  const inverseScale = 1 / scale
  return detectPlatesByContour(grayscale, 0, focusTop).map((detection) => ({
    ...detection,
    x: Math.round(detection.x * inverseScale),
    y: Math.round(detection.y * inverseScale),
    width: Math.round(detection.width * inverseScale),
    height: Math.round(detection.height * inverseScale),
  }))
}

function detectPlatesByContourAllRegions(canvas: HTMLCanvasElement): PlateBoundingBox[] {
  const detections: PlateBoundingBox[] = []
  for (const region of CONTOUR_SCAN_REGIONS) {
    detections.push(...detectPlatesByContourCanvas(canvas, region))
  }
  return detections
}

export async function detectLicensePlateRegions(
  canvas: HTMLCanvasElement,
): Promise<PlateBoundingBox[]> {
  const localDetections = mergePlateDetections(
    [
      ...detectPlatesByContourAllRegions(canvas),
      ...fallbackHeuristicRegions(canvas.width, canvas.height),
    ],
    6,
  )

  const paddleDetections = await safeAsync(
    'paddle-region-detect',
    () => detectPlatesWithPaddleOnnx(canvas),
    [],
  )

  const merged = mergePlateDetections([...localDetections, ...paddleDetections], 6)
  if (merged.length > 0) return merged

  return fallbackHeuristicRegions(canvas.width, canvas.height)
}

export function createCenterPlateFallbackRegion(
  imageWidth: number,
  imageHeight: number,
): PlateBoundingBox {
  return {
    x: Math.round(imageWidth * 0.03),
    y: Math.round(imageHeight * 0.16),
    width: Math.round(imageWidth * 0.94),
    height: Math.round(imageHeight * 0.68),
    score: 0.12,
    method: 'heuristic-region',
    angleDeg: 0,
  }
}
