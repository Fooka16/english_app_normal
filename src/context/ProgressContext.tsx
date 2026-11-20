import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ProgressState } from '../types.ts'
import {
  createEmptyProgress,
  loadProgress,
  recordAnswer,
  restoreWordStatus,
  saveProgress,
  setWordStatus,
} from '../lib/storage.ts'
import { ProgressContext } from './progress-api.ts'
import type { ProgressApi } from './progress-api.ts'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const api = useMemo<ProgressApi>(
    () => ({
      progress,
      recordConversation: (id, correct) => {
        setProgress((current) => recordAnswer(current, 'conversation', id, correct))
      },
      recordVocab: (id, correct) => {
        setProgress((current) => recordAnswer(current, 'vocab', id, correct))
      },
      setWord: (id, status) => {
        setProgress((current) => setWordStatus(current, id, status))
      },
      undoWord: (id, previous) => {
        setProgress((current) => restoreWordStatus(current, id, previous))
      },
      resetProgress: () => {
        setProgress(createEmptyProgress())
      },
    }),
    [progress],
  )

  return <ProgressContext value={api}>{children}</ProgressContext>
}
