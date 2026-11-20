import type { DayRecord, ItemProgress, ProgressState, WordProgress } from '../types.ts'

export const STORAGE_KEY = 'fudan-english-progress-v1'
export const CLEAR_WEAK_STREAK = 3

export function createEmptyProgress(): ProgressState {
  return {
    version: 1,
    conversations: {},
    vocabQuiz: {},
    words: {},
    totalAnswered: 0,
    totalCorrect: 0,
    daily: {},
    streak: 0,
    lastStudyDate: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeItems(value: unknown): Record<string, ItemProgress> {
  if (!isRecord(value)) return {}
  const result: Record<string, ItemProgress> = {}
  for (const [id, item] of Object.entries(value)) {
    if (!isRecord(item)) continue
    result[id] = {
      wrongCount: typeof item.wrongCount === 'number' ? item.wrongCount : 0,
      correctStreak: typeof item.correctStreak === 'number' ? item.correctStreak : 0,
      isWeak: item.isWeak === true,
      lastResult: item.lastResult === 'correct' || item.lastResult === 'wrong' ? item.lastResult : null,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : '',
    }
  }
  return result
}

function sanitizeWords(value: unknown): Record<string, WordProgress> {
  if (!isRecord(value)) return {}
  const result: Record<string, WordProgress> = {}
  for (const [id, item] of Object.entries(value)) {
    if (!isRecord(item)) continue
    if (item.status !== 'known' && item.status !== 'unknown') continue
    result[id] = {
      status: item.status,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : '',
    }
  }
  return result
}

function sanitizeDaily(value: unknown): Record<string, DayRecord> {
  if (!isRecord(value)) return {}
  const result: Record<string, DayRecord> = {}
  for (const [date, item] of Object.entries(value)) {
    if (!isRecord(item)) continue
    result[date] = {
      answered: typeof item.answered === 'number' ? item.answered : 0,
      correct: typeof item.correct === 'number' ? item.correct : 0,
    }
  }
  return result
}

export function loadProgress(): ProgressState {
  const empty = createEmptyProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== 1) return empty
    return {
      version: 1,
      conversations: sanitizeItems(parsed.conversations),
      vocabQuiz: sanitizeItems(parsed.vocabQuiz),
      words: sanitizeWords(parsed.words),
      totalAnswered: typeof parsed.totalAnswered === 'number' ? parsed.totalAnswered : 0,
      totalCorrect: typeof parsed.totalCorrect === 'number' ? parsed.totalCorrect : 0,
      daily: sanitizeDaily(parsed.daily),
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastStudyDate: typeof parsed.lastStudyDate === 'string' ? parsed.lastStudyDate : null,
    }
  } catch {
    return empty
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('学習記録を保存できませんでした。', error)
  }
}

export function todayKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftDate(days: number, from = new Date()): string {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days)
  return todayKey(next)
}

export function touchStreak(state: ProgressState, today = todayKey()): ProgressState {
  if (state.lastStudyDate === today) return state
  const yesterday = shiftDate(-1)
  const streak = state.lastStudyDate === yesterday ? state.streak + 1 : 1
  return { ...state, streak, lastStudyDate: today }
}

export function currentStreak(state: ProgressState, today = todayKey()): number {
  if (!state.lastStudyDate) return 0
  if (state.lastStudyDate === today || state.lastStudyDate === shiftDate(-1)) return state.streak
  return 0
}

function nextItemProgress(previous: ItemProgress | undefined, correct: boolean): ItemProgress {
  const base: ItemProgress = previous ?? {
    wrongCount: 0,
    correctStreak: 0,
    isWeak: false,
    lastResult: null,
    updatedAt: '',
  }
  const updatedAt = new Date().toISOString()
  if (!correct) {
    return {
      wrongCount: base.wrongCount + 1,
      correctStreak: 0,
      isWeak: true,
      lastResult: 'wrong',
      updatedAt,
    }
  }
  if (!base.isWeak) {
    return { ...base, lastResult: 'correct', correctStreak: 0, updatedAt }
  }
  const correctStreak = base.correctStreak + 1
  const stillWeak = correctStreak < CLEAR_WEAK_STREAK
  return {
    wrongCount: base.wrongCount,
    correctStreak: stillWeak ? correctStreak : 0,
    isWeak: stillWeak,
    lastResult: 'correct',
    updatedAt,
  }
}

export function recordAnswer(
  state: ProgressState,
  kind: 'conversation' | 'vocab',
  id: string,
  correct: boolean,
): ProgressState {
  const touched = touchStreak(state)
  const today = todayKey()
  const day = touched.daily[today] ?? { answered: 0, correct: 0 }
  const bucket = kind === 'conversation' ? touched.conversations : touched.vocabQuiz
  const updatedBucket = {
    ...bucket,
    [id]: nextItemProgress(bucket[id], correct),
  }
  return {
    ...touched,
    conversations: kind === 'conversation' ? updatedBucket : touched.conversations,
    vocabQuiz: kind === 'vocab' ? updatedBucket : touched.vocabQuiz,
    totalAnswered: touched.totalAnswered + 1,
    totalCorrect: touched.totalCorrect + (correct ? 1 : 0),
    daily: {
      ...touched.daily,
      [today]: {
        answered: day.answered + 1,
        correct: day.correct + (correct ? 1 : 0),
      },
    },
  }
}

export function setWordStatus(
  state: ProgressState,
  id: string,
  status: 'known' | 'unknown',
): ProgressState {
  const touched = touchStreak(state)
  return {
    ...touched,
    words: {
      ...touched.words,
      [id]: { status, updatedAt: new Date().toISOString() },
    },
  }
}

export function restoreWordStatus(
  state: ProgressState,
  id: string,
  previous: WordProgress | undefined,
): ProgressState {
  const words = { ...state.words }
  if (!previous) delete words[id]
  else words[id] = previous
  return { ...state, words }
}

export function todayRecord(state: ProgressState): DayRecord {
  return state.daily[todayKey()] ?? { answered: 0, correct: 0 }
}

export function weakCount(bucket: Record<string, ItemProgress>): number {
  return Object.values(bucket).filter((item) => item.isWeak).length
}

export function wordCounts(state: ProgressState): { known: number; unknown: number } {
  const values = Object.values(state.words)
  return {
    known: values.filter((item) => item.status === 'known').length,
    unknown: values.filter((item) => item.status === 'unknown').length,
  }
}

export function last7Days(state: ProgressState): { date: string; label: string; answered: number; today: boolean }[] {
  const today = todayKey()
  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(index - 6)
    const [, month, day] = date.split('-')
    return {
      date,
      label: `${Number(month)}/${Number(day)}`,
      answered: state.daily[date]?.answered ?? 0,
      today: date === today,
    }
  })
}

export function accuracy(state: ProgressState): number {
  if (state.totalAnswered === 0) return 0
  return Math.round((state.totalCorrect / state.totalAnswered) * 100)
}

export function reviewNote(previous: ItemProgress | undefined, correct: boolean): string | null {
  const wasWeak = previous?.isWeak ?? false
  if (!correct) return '苦手に追加しました。3回連続で正解すると外れます。'
  if (!wasWeak) return null
  const nextStreak = (previous?.correctStreak ?? 0) + 1
  if (nextStreak >= CLEAR_WEAK_STREAK) return '3回連続で正解したので、苦手から外しました。'
  return `あと${CLEAR_WEAK_STREAK - nextStreak}回連続で正解すると、苦手から外れます。`
}
