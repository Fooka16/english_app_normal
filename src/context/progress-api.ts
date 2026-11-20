import { createContext } from 'react'
import type { ProgressState, WordProgress } from '../types.ts'

export type ProgressApi = {
  progress: ProgressState
  recordConversation: (id: string, correct: boolean) => void
  recordVocab: (id: string, correct: boolean) => void
  setWord: (id: string, status: 'known' | 'unknown') => void
  undoWord: (id: string, previous: WordProgress | undefined) => void
  resetProgress: () => void
}

export const ProgressContext = createContext<ProgressApi | null>(null)
