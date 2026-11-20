export type Screen = 'home' | 'conversation' | 'vocabulary' | 'swipe' | 'review' | 'stats'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export type ConversationCategory =
  | 'friends'
  | 'romance'
  | 'emotions'
  | 'school'
  | 'work'
  | 'cafe'
  | 'travel'
  | 'sns'
  | 'music'
  | 'daily'

export type SwipeFilter = 'focus' | 'unknown' | 'known' | 'all'

export interface Conversation {
  id: string
  category: ConversationCategory
  level: Level
  japanese: string
  correctEnglish: string
  choices: string[]
  explanation: string
  alternativeExpressions: string[]
}

export interface Vocabulary {
  id: string
  word: string
  meaning: string
  partOfSpeech: string
  level: Level
  example: string
  exampleJapanese: string
  choices: string[]
}

export interface ItemProgress {
  wrongCount: number
  correctStreak: number
  isWeak: boolean
  lastResult: 'correct' | 'wrong' | null
  updatedAt: string
}

export interface WordProgress {
  status: 'known' | 'unknown'
  updatedAt: string
}

export interface DayRecord {
  answered: number
  correct: number
}

export interface ProgressState {
  version: 1
  conversations: Record<string, ItemProgress>
  vocabQuiz: Record<string, ItemProgress>
  words: Record<string, WordProgress>
  totalAnswered: number
  totalCorrect: number
  daily: Record<string, DayRecord>
  streak: number
  lastStudyDate: string | null
}
