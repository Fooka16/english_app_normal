import type { SwipeFilter } from '../types.ts'

export const QUIZ_SIZE = 10
export const SWIPE_THRESHOLD = 96

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

export function takeQuizItems<T extends { id: string }>(
  items: readonly T[],
  count = QUIZ_SIZE,
  priorityIds?: ReadonlySet<string>,
): T[] {
  if (items.length === 0 || count <= 0) return []
  if (!priorityIds || priorityIds.size === 0) {
    return shuffle(items).slice(0, count)
  }
  const priority = shuffle(items.filter((item) => priorityIds.has(item.id)))
  const rest = shuffle(items.filter((item) => !priorityIds.has(item.id)))
  return shuffle([...priority, ...rest].slice(0, count))
}

export type CardStatus = 'known' | 'unknown' | 'unseen'

export function buildDeck<T extends { id: string }>(
  items: readonly T[],
  filter: SwipeFilter,
  statusOf: (id: string) => CardStatus,
): T[] {
  const entries = items.map((item) => ({ item, status: statusOf(item.id) }))
  const filtered = entries.filter(({ status }) => {
    if (filter === 'known') return status === 'known'
    if (filter === 'unknown') return status === 'unknown'
    if (filter === 'focus') return status !== 'known'
    return true
  })
  const byStatus = (status: CardStatus) =>
    shuffle(filtered.filter((entry) => entry.status === status).map((entry) => entry.item))

  if (filter === 'known') return byStatus('known')
  if (filter === 'unknown') return byStatus('unknown')
  return [...byStatus('unknown'), ...byStatus('unseen'), ...byStatus('known')]
}

export function percent(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}
