import type { PlateBoundingBox } from './plateAlprTypes'

const MIN_ASPECT = 2
const MAX_ASPECT = 9
const MIN_WIDTH = 56
const MIN_HEIGHT = 10

export function scorePlateBoundingBox(
  box: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number,
  method: PlateBoundingBox['method'],
  baseScore = 0.5,
): PlateBoundingBox | null {
  const aspect = box.width / Math.max(1, box.height)
  if (aspect < MIN_ASPECT || aspect > MAX_ASPECT) return null
  if (box.width < MIN_WIDTH || box.height < MIN_HEIGHT) return null

  const centerY = box.y + box.height / 2
  const lowerBias = centerY / Math.max(1, imageHeight)
  const widthRatio = box.width / Math.max(1, imageWidth)

  let score = baseScore
  score += Math.min(aspect, 6) * 0.04
  score += lowerBias * 0.35
  score += Math.min(widthRatio, 0.75) * 0.25
  if (box.width > imageWidth * 0.9 && box.height > imageHeight * 0.45) {
    score -= 0.45
  }

  return {
    ...box,
    score: Math.max(0, Math.min(1, score)),
    method,
    angleDeg: 0,
  }
}

export function mergePlateDetections(
  detections: PlateBoundingBox[],
  limit = 4,
): PlateBoundingBox[] {
  const sorted = [...detections].sort((a, b) => b.score - a.score)
  const kept: PlateBoundingBox[] = []

  for (const candidate of sorted) {
    const overlaps = kept.some((existing) => iou(existing, candidate) > 0.45)
    if (!overlaps) kept.push(candidate)
    if (kept.length >= limit) break
  }

  return kept
}

function iou(a: PlateBoundingBox, b: PlateBoundingBox): number {
  const x1 = Math.max(a.x, b.x)
  const y1 = Math.max(a.y, b.y)
  const x2 = Math.min(a.x + a.width, b.x + b.width)
  const y2 = Math.min(a.y + a.height, b.y + b.height)
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  const union = a.width * a.height + b.width * b.height - intersection
  return union <= 0 ? 0 : intersection / union
}

export function detectPlatesByContour(
  imageData: ImageData,
  offsetX: number,
  offsetY: number,
): PlateBoundingBox[] {
  const { width, height, data } = imageData
  const edgeStrength = new Float32Array(width * height)

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x
      const left = data[(index - 1) * 4]
      const right = data[(index + 1) * 4]
      const up = data[(index - width) * 4]
      const down = data[(index + width) * 4]
      edgeStrength[index] = Math.abs(right - left) + Math.abs(down - up) * 0.35
    }
  }

  const rowActivity = new Float32Array(height)
  for (let y = 0; y < height; y += 1) {
    let sum = 0
    for (let x = 0; x < width; x += 1) {
      sum += edgeStrength[y * width + x]
    }
    rowActivity[y] = sum / width
  }

  const threshold = percentile(rowActivity, 0.82)
  const detections: PlateBoundingBox[] = []

  let bandStart = -1
  for (let y = 0; y < height; y += 1) {
    const active = rowActivity[y] >= threshold
    if (active && bandStart < 0) {
      bandStart = y
    }
    if ((!active || y === height - 1) && bandStart >= 0) {
      const bandEnd = active ? y : y - 1
      const bandHeight = bandEnd - bandStart + 1
      if (bandHeight >= 6 && bandHeight <= Math.round(height * 0.35)) {
        const columnActivity = new Float32Array(width)
        for (let x = 0; x < width; x += 1) {
          let sum = 0
          for (let y2 = bandStart; y2 <= bandEnd; y2 += 1) {
            sum += edgeStrength[y2 * width + x]
          }
          columnActivity[x] = sum / bandHeight
        }

        const columnThreshold = percentile(columnActivity, 0.78)
        let startX = -1
        for (let x = 0; x < width; x += 1) {
          const activeColumn = columnActivity[x] >= columnThreshold
          if (activeColumn && startX < 0) startX = x
          if ((!activeColumn || x === width - 1) && startX >= 0) {
            const endX = activeColumn ? x : x - 1
            const boxWidth = endX - startX + 1
            const scored = scorePlateBoundingBox(
              {
                x: startX + offsetX,
                y: bandStart + offsetY,
                width: boxWidth,
                height: bandHeight,
              },
              width + offsetX,
              height + offsetY,
              'contour',
              0.42,
            )
            if (scored) detections.push(scored)
            startX = -1
          }
        }
      }
      bandStart = -1
    }
  }

  return detections
}

function percentile(values: ArrayLike<number>, ratio: number): number {
  const sorted = Array.from(values).sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * ratio)))
  return sorted[index] ?? 0
}

export function fallbackHeuristicRegions(
  imageWidth: number,
  imageHeight: number,
): PlateBoundingBox[] {
  const regions = [
    // Plate fills most of the frame (stock photos, close-up scans).
    { x: 0.02, y: 0.14, width: 0.96, height: 0.72, score: 0.38 },
    { x: 0.05, y: 0.28, width: 0.9, height: 0.44, score: 0.34 },
    // Plate on vehicle bumper (field photos).
    { x: 0.04, y: 0.52, width: 0.92, height: 0.22, score: 0.22 },
    { x: 0.08, y: 0.42, width: 0.84, height: 0.28, score: 0.2 },
  ]

  return regions
    .map((region) =>
      scorePlateBoundingBox(
        {
          x: Math.round(imageWidth * region.x),
          y: Math.round(imageHeight * region.y),
          width: Math.round(imageWidth * region.width),
          height: Math.round(imageHeight * region.height),
        },
        imageWidth,
        imageHeight,
        'heuristic-region',
        region.score,
      ),
    )
    .filter((value): value is PlateBoundingBox => Boolean(value))
}
