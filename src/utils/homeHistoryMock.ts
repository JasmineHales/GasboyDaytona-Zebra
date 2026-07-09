import type { HistoryItem } from '../components/home/HomeHistoryPanel'

const VEHICLE_TEMPLATES = [
  {
    vehicle: 'Jeep Compass',
    unitId: 'SIL',
    vin: '1C4RJFAG2MC123456',
    licensePlate: 'DLR-4829',
  },
  {
    vehicle: 'Tesla Model 3',
    unitId: 'BLA',
    vin: '5YJ3E1EA4KF123789',
    licensePlate: 'FL-KLM89',
  },
  {
    vehicle: 'Toyota Corolla',
    unitId: 'RED',
    vin: '2T1BURHE0JC456123',
    licensePlate: 'RED-4412',
  },
  {
    vehicle: 'Ford Explorer',
    unitId: 'GRN',
    vin: '1FM5K8D82HGA78901',
    licensePlate: 'GRN-9031',
  },
  {
    vehicle: 'Chevrolet Malibu',
    unitId: 'BLU',
    vin: '1G1ZD5ST8JF234567',
    licensePlate: 'BLU-7720',
  },
  {
    vehicle: 'Nissan Altima',
    unitId: 'SLV',
    vin: '1N4BL4BV8KC890123',
    licensePlate: 'SLV-1184',
  },
  {
    vehicle: 'Hyundai Tucson',
    unitId: 'GLD',
    vin: 'KM8J33A46KU345678',
    licensePlate: 'GLD-5567',
  },
  {
    vehicle: 'Kia Sportage',
    unitId: 'WHT',
    vin: 'KNDPM3AC5N7123456',
    licensePlate: 'WHT-3390',
  },
  {
    vehicle: 'Honda CR-V',
    unitId: 'ORG',
    vin: '2HKRW2H89MH567890',
    licensePlate: 'ORG-2245',
  },
  {
    vehicle: 'BMW X3',
    unitId: 'BLK',
    vin: '5UXCR6C05L9A678901',
    licensePlate: 'BLK-8812',
  },
  {
    vehicle: 'Mercedes GLC',
    unitId: 'PNK',
    vin: 'WDC0G4KB5KV123789',
    licensePlate: 'PNK-6673',
  },
  {
    vehicle: 'Audi Q5',
    unitId: 'GRY',
    vin: 'WA1ANAFY5K2123456',
    licensePlate: 'GRY-4458',
  },
  {
    vehicle: 'Volkswagen Tiguan',
    unitId: 'TAN',
    vin: '3VV2B7AX5KM789012',
    licensePlate: 'TAN-9921',
  },
  {
    vehicle: 'Subaru Outback',
    unitId: 'BRN',
    vin: '4S4BSACC5K3345678',
    licensePlate: 'BRN-7734',
  },
  {
    vehicle: 'Mazda CX-5',
    unitId: 'MAR',
    vin: 'JM3KFBDM5K0456789',
    licensePlate: 'MAR-5516',
  },
] as const

const WORKFLOW_KEYS = ['transport', 'vsa', 'fuel'] as const

const LOCATIONS = [
  'Fuel station',
  'Stall 12',
  'Pump 8',
  'Return Lane',
  'Stall 4',
  'Pump 3',
  'Wash Bay',
  'Stall 18',
] as const

function buildDetails(
  workflowKey: (typeof WORKFLOW_KEYS)[number],
  unitId: string,
  location: string,
  odometer: number,
  durationMinutes: number,
): HistoryItem['details'] {
  const task =
    workflowKey === 'transport' ? 'Transport' : workflowKey === 'vsa' ? 'VSA' : 'Fuel'

  return [
    { labelKey: 'task', value: task },
    { labelKey: 'unit', value: unitId },
    { labelKey: 'status', value: 'Complete' },
    { labelKey: 'location', value: location },
    { labelKey: 'odometer', value: `${odometer.toLocaleString('en-US')} mi` },
    { labelKey: 'duration', value: `${durationMinutes} min` },
  ]
}

export function buildHomeHistoryMock(referenceDate = new Date()): HistoryItem[] {
  const items: HistoryItem[] = []

  for (let index = 0; index < 40; index += 1) {
    const template = VEHICLE_TEMPLATES[index % VEHICLE_TEMPLATES.length]
    const workflowKey = WORKFLOW_KEYS[index % WORKFLOW_KEYS.length]
    const daysAgo = Math.floor(index / 3)
    const completedAt = new Date(referenceDate)
    completedAt.setDate(completedAt.getDate() - daysAgo)
    completedAt.setHours(7 + (index * 5) % 13, (index * 11) % 60, 0, 0)

    items.push({
      id: `history-${index}-${workflowKey}-${template.unitId}`,
      workflowKey,
      unitId: template.unitId,
      vehicle: template.vehicle,
      vin: template.vin,
      licensePlate: template.licensePlate,
      completedAt: completedAt.toISOString(),
      ...(index === 0
        ? { gamificationContext: 'recognition' as const }
        : index === 2
          ? { gamificationContext: 'challenge' as const }
          : index === 5
            ? { gamificationContext: 'focusImproved' as const }
            : index === 8 && workflowKey === 'fuel'
              ? { gamificationContext: 'fuelCorrection' as const }
              : {}),
      details: buildDetails(
        workflowKey,
        template.unitId,
        LOCATIONS[index % LOCATIONS.length],
        12000 + index * 731,
        8 + (index * 3) % 35,
      ),
    })
  }

  return items.sort(
    (left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime(),
  )
}

export const HOME_HISTORY_MOCK_ITEMS = buildHomeHistoryMock()
