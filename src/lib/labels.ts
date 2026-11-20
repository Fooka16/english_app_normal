import type { ConversationCategory, Level, SwipeFilter } from '../types.ts'

export const CATEGORIES: { id: ConversationCategory; label: string }[] = [
  { id: 'friends', label: '友達との日常会話' },
  { id: 'romance', label: '恋愛・LINE' },
  { id: 'emotions', label: '感情表現' },
  { id: 'school', label: '学校・大学' },
  { id: 'work', label: '仕事・アルバイト' },
  { id: 'cafe', label: 'カフェ・買い物' },
  { id: 'travel', label: '旅行' },
  { id: 'sns', label: 'SNS' },
  { id: 'music', label: '音楽・ライブ' },
  { id: 'daily', label: 'その他の日常表現' },
]

export const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner', label: '初級' },
  { id: 'intermediate', label: '中級' },
  { id: 'advanced', label: '上級' },
]

export const SWIPE_FILTERS: { id: SwipeFilter; label: string }[] = [
  { id: 'focus', label: '未習得優先' },
  { id: 'unknown', label: 'まだ覚えていない' },
  { id: 'known', label: '覚えた' },
  { id: 'all', label: 'すべて' },
]

export function categoryLabel(id: string): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id
}

export function levelLabel(id: string): string {
  return LEVELS.find((level) => level.id === id)?.label ?? id
}
