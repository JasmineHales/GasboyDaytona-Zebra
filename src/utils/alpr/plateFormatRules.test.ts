import { describe, expect, it } from 'vitest'
import {
  correctPlateOcrText,
  extractPlateCandidatesFromText,
  formatPlateFromCompact,
  matchCatalogPlate,
  matchesPlatePattern,
  normalizePlateCompact,
  pickBestPlateFromText,
} from './plateFormatRules'
import {
  mergePlateDetections,
  scorePlateBoundingBox,
} from './plateDetectorShared'

const SCENARIO_PLATES = [
  { vin: '5YJ3E1EA1KF654321', plate: 'DNJ 0955', compact: 'DNJ0955' },
  { vin: '5NPE34AF4HH123789', plate: 'BC18351', compact: 'BC18351' },
  { vin: '1C4NJCEB4HD123456', plate: '8LAK631', compact: '8LAK631' },
  { vin: '1FM5K8D83HGA98765', plate: 'V576AE', compact: 'V576AE' },
  { vin: '3VW2B7AJ5HM567890', plate: '215BG2', compact: '215BG2' },
] as const

describe('plate format rules', () => {
  it.each(SCENARIO_PLATES)('accepts scenario plate $plate', ({ compact }) => {
    expect(matchesPlatePattern(compact)).toBe(true)
    expect(matchCatalogPlate(compact)).not.toBeNull()
  })

  it('normalizes spaces and symbols', () => {
    expect(normalizePlateCompact('dnj 0955!')).toBe('DNJ0955')
    expect(formatPlateFromCompact('DNJ0955')).toBe('DNJ 0955')
  })

  it('extracts candidates from noisy OCR text', () => {
    const candidates = extractPlateCandidatesFromText('VEHICLE 8LAK631 FLORIDA')
    expect(candidates.some((value) => normalizePlateCompact(value) === '8LAK631')).toBe(true)
  })

  it('corrects stacked digit OCR confusions on numeric dash plates', () => {
    const corrected = correctPlateOcrText('210-184')
    expect(corrected.compact).toBe('570184')
    expect(corrected.corrected).toBe('570-184')
  })

  it('corrects common OCR confusions when they match catalog plates', () => {
    const corrected = correctPlateOcrText('8LAK63I')
    expect(corrected.compact).toBe('8LAK631')
    expect(corrected.catalogPlate).toBe('8LAK631')
  })

  it('picks the best plate from mixed OCR output', () => {
    const best = pickBestPlateFromText('NOISE BC1835I TRASH')
    expect(best?.plate).toBe('BC18351')
  })
})

describe('plate detector scoring', () => {
  it('prefers wide lower-plate boxes over full-frame regions', () => {
    const plateBox = scorePlateBoundingBox(
      { x: 80, y: 420, width: 280, height: 52 },
      720,
      960,
      'paddle-onnx',
      0.7,
    )
    const wideFalsePositive = scorePlateBoundingBox(
      { x: 0, y: 100, width: 700, height: 180 },
      720,
      960,
      'heuristic-region',
      0.5,
    )

    expect(plateBox).not.toBeNull()
    expect(wideFalsePositive).not.toBeNull()
    expect(plateBox!.score).toBeGreaterThan(wideFalsePositive!.score)
  })

  it('merges overlapping detections', () => {
    const merged = mergePlateDetections([
      {
        x: 100,
        y: 400,
        width: 240,
        height: 50,
        score: 0.8,
        method: 'paddle-onnx',
        angleDeg: 0,
      },
      {
        x: 110,
        y: 405,
        width: 230,
        height: 48,
        score: 0.7,
        method: 'contour',
        angleDeg: 0,
      },
      {
        x: 420,
        y: 410,
        width: 210,
        height: 46,
        score: 0.6,
        method: 'contour',
        angleDeg: 0,
      },
    ])

    expect(merged).toHaveLength(2)
    expect(merged[0]?.score).toBe(0.8)
  })
})
