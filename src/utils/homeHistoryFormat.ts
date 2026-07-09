import type { AppLanguageId } from './languageSettings'
import { localeForLanguage } from '../i18n/localeFormat'
import type { HistoryItem } from '../components/home/HomeHistoryPanel'

export type HistoryDateGroup = {
  key: string
  label: string
  items: HistoryItem[]
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function formatHistoryGroupLabel(
  date: Date,
  language: AppLanguageId,
  copy: { today: string; yesterday: string },
): string {
  const today = startOfDay(new Date())
  const target = startOfDay(date)
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000)

  if (diffDays === 0) return copy.today
  if (diffDays === 1) return copy.yesterday

  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatHistoryItemTime(
  completedAtIso: string,
  language: AppLanguageId,
  copy: { today: string; yesterday: string; hoursAgo: (hours: number) => string; minutesAgo: (minutes: number) => string },
): string {
  const completedAt = new Date(completedAtIso)
  const now = new Date()
  const today = startOfDay(now)
  const itemDay = startOfDay(completedAt)
  const diffDays = Math.round((today.getTime() - itemDay.getTime()) / 86_400_000)

  if (diffDays === 0) {
    const elapsedMinutes = Math.max(1, Math.floor((now.getTime() - completedAt.getTime()) / 60_000))
    if (elapsedMinutes < 60) return copy.minutesAgo(elapsedMinutes)
    return copy.hoursAgo(Math.floor(elapsedMinutes / 60))
  }

  if (diffDays === 1) {
    return new Intl.DateTimeFormat(localeForLanguage(language), {
      hour: 'numeric',
      minute: '2-digit',
    }).format(completedAt)
  }

  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(completedAt)
}

export function groupHistoryByDate(
  items: HistoryItem[],
  language: AppLanguageId,
  copy: { today: string; yesterday: string },
): HistoryDateGroup[] {
  const groups: HistoryDateGroup[] = []

  for (const item of items) {
    const completedAt = new Date(item.completedAt)
    const key = dayKey(completedAt)
    const existing = groups.find((group) => group.key === key)

    if (existing) {
      existing.items.push(item)
      continue
    }

    groups.push({
      key,
      label: formatHistoryGroupLabel(completedAt, language, copy),
      items: [item],
    })
  }

  return groups
}
