import type { Challenge } from './types'

const KEYS = {
  favorites: 'boredom-buster:favorites',
  score: 'boredom-buster:score',
  streakCount: 'boredom-buster:streakCount',
  lastCompletedDate: 'boredom-buster:lastCompletedDate',
  completionsByDate: 'boredom-buster:completionsByDate',
} as const

export interface ProgressState {
  score: number
  streakCount: number
  lastCompletedDate: string | null
  completionsByDate: Record<string, string[]>
}

export const getTodayKey = () => new Date().toISOString().slice(0, 10)

export const getPreviousDayKey = () => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().slice(0, 10)
}

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const loadFavorites = () =>
  parseJson<string[]>(localStorage.getItem(KEYS.favorites), [])

export const saveFavorites = (favorites: string[]) => {
  localStorage.setItem(KEYS.favorites, JSON.stringify(favorites))
}

export const loadProgress = (): ProgressState => {
  const score = Number.parseInt(localStorage.getItem(KEYS.score) ?? '0', 10)
  const streakCount = Number.parseInt(localStorage.getItem(KEYS.streakCount) ?? '0', 10)
  const lastCompletedDate = localStorage.getItem(KEYS.lastCompletedDate)
  const completionsByDate = parseJson<Record<string, string[]>>(
    localStorage.getItem(KEYS.completionsByDate),
    {},
  )

  return {
    score: Number.isNaN(score) ? 0 : score,
    streakCount: Number.isNaN(streakCount) ? 0 : streakCount,
    lastCompletedDate,
    completionsByDate,
  }
}

export const saveProgress = (progress: ProgressState) => {
  localStorage.setItem(KEYS.score, String(progress.score))
  localStorage.setItem(KEYS.streakCount, String(progress.streakCount))

  if (progress.lastCompletedDate) {
    localStorage.setItem(KEYS.lastCompletedDate, progress.lastCompletedDate)
  } else {
    localStorage.removeItem(KEYS.lastCompletedDate)
  }

  localStorage.setItem(KEYS.completionsByDate, JSON.stringify(progress.completionsByDate))
}

export const challengePoints = (challenge: Challenge) => {
  switch (challenge.difficulty) {
    case 'Easy':
      return 10
    case 'Medium':
      return 20
    case 'Hard':
      return 30
  }
}
