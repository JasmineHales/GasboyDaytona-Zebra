export type PerformanceStatus = 'excellent' | 'strong' | 'needs_attention'

export type GamificationChallenge = {
  id: string
  title: string
  description: string
  current: number
  target: number
  kind: 'weekly' | 'streak' | 'team'
}

export type RecognitionBadgeVariant = 'fuel' | 'vehicle' | 'quality' | 'damage'

export type GamificationRecognition = {
  id: string
  title: string
  description: string
  earnedLabel: string
  variant: RecognitionBadgeVariant
}

export type PerformanceAlertKind =
  | 'fuel_entry_review'
  | 'missed_inspection'
  | 'late_return'

export type PerformanceAlertSeverity = 'warning' | 'info'

export type PerformanceAlert = {
  id: string
  kind: PerformanceAlertKind
  severity: PerformanceAlertSeverity
  count: number
  pointsDeducted: number
}

const PERFORMANCE_ALERT_PRIORITY: Record<PerformanceAlertKind, number> = {
  fuel_entry_review: 0,
  missed_inspection: 1,
  late_return: 2,
}

export function sortPerformanceAlerts(alerts: PerformanceAlert[]): PerformanceAlert[] {
  return [...alerts].sort(
    (a, b) => PERFORMANCE_ALERT_PRIORITY[a.kind] - PERFORMANCE_ALERT_PRIORITY[b.kind],
  )
}

export type GamificationData = {
  operatorName: string
  site: string
  status: PerformanceStatus
  rankChange: number
  metrics: {
    vehiclesReady: number
    fuelCorrections: number
    pumpVerificationPercent: number
  }
  nextGoal: {
    accurateJobsNeeded: number
    targetRank: number
  }
  /** @deprecated Use alerts — kept for history context labels. */
  focusArea: {
    topic: string
    issueCount: number
  } | null
  alerts: PerformanceAlert[]
  challenges: GamificationChallenge[]
  recognition: GamificationRecognition[]
  team: {
    siteName: string
    vehiclesReady: number
    weeklyGoal: number
    rankInRegion: number
    totalLocations: number
    region: string
    qualityPercent: number
    accuracyPercent: number
  }
}

export function getGamificationData(operatorName: string, site: string): GamificationData {
  return {
    operatorName,
    site,
    status: 'excellent',
    rankChange: 2,
    metrics: {
      vehiclesReady: 12,
      fuelCorrections: 0,
      pumpVerificationPercent: 100,
    },
    nextGoal: {
      accurateJobsNeeded: 2,
      targetRank: 2,
    },
    focusArea: {
      topic: 'Fuel Amount Accuracy',
      issueCount: 2,
    },
    alerts: [
      {
        id: 'fuel-entry-review',
        kind: 'fuel_entry_review',
        severity: 'warning',
        count: 2,
        pointsDeducted: 4,
      },
      {
        id: 'missed-inspection',
        kind: 'missed_inspection',
        severity: 'warning',
        count: 1,
        pointsDeducted: 2,
      },
      {
        id: 'late-return',
        kind: 'late_return',
        severity: 'warning',
        count: 1,
        pointsDeducted: 1,
      },
    ],
    challenges: [
      {
        id: 'fuel-accuracy-pro',
        title: 'Fuel Accuracy Pro',
        description: 'Complete 10 accurate fuel jobs',
        current: 8,
        target: 10,
        kind: 'weekly',
      },
      {
        id: 'perfect-week',
        title: 'Perfect Week',
        description: 'Get 100% verification for 7 days',
        current: 5,
        target: 7,
        kind: 'streak',
      },
      {
        id: 'team-goal',
        title: `${site} Team Goal`,
        description: 'Work together to reach the weekly goal',
        current: 342,
        target: 400,
        kind: 'team',
      },
    ],
    recognition: [
      {
        id: 'fuel-accuracy-pro',
        title: 'Fuel Accuracy Pro',
        description: '30 days with no overfills',
        earnedLabel: '2 weeks ago',
        variant: 'fuel',
      },
      {
        id: 'vehicle-ready-pro',
        title: 'Vehicle Ready Pro',
        description: '50 vehicles ready in one week',
        earnedLabel: '3 weeks ago',
        variant: 'vehicle',
      },
      {
        id: 'quality-champion',
        title: 'Quality Champion',
        description: '100% verification 7 days in a row',
        earnedLabel: '1 month ago',
        variant: 'quality',
      },
      {
        id: 'damage-detective',
        title: 'Damage Detective',
        description: '25 verified damage findings',
        earnedLabel: '1 month ago',
        variant: 'damage',
      },
    ],
    team: {
      siteName: site,
      vehiclesReady: 342,
      weeklyGoal: 400,
      rankInRegion: 3,
      totalLocations: 18,
      region: 'Florida',
      qualityPercent: 96,
      accuracyPercent: 98,
    },
  }
}

export function challengeProgressPercent(current: number, target: number): number {
  if (target <= 0) return 100
  return Math.min(100, Math.round((current / target) * 100))
}
