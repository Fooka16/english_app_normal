import { useCallback, useState } from 'react'
import { QUIZ_SIZE, shuffle, takeQuizItems } from '../lib/quiz.ts'

export interface AnswerRecord<T> {
  item: T
  picked: string
  correct: boolean
  note: string | null
}

export function useQuizSession<T extends { id: string; choices: string[] }>(
  initialItems?: readonly T[] | null,
) {
  const [sessionId, setSessionId] = useState(0)
  const [queue, setQueue] = useState<T[]>(() =>
    initialItems && initialItems.length > 0 ? takeQuizItems(initialItems, QUIZ_SIZE) : [],
  )
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [answers, setAnswers] = useState<AnswerRecord<T>[]>([])
  const [choiceState, setChoiceState] = useState<{ key: string; choices: string[] }>({
    key: '',
    choices: [],
  })

  const current = queue[index] ?? null
  const finished = queue.length > 0 && index >= queue.length
  const choiceKey = `${sessionId}:${current?.id ?? ''}`
  if (choiceState.key !== choiceKey) {
    setChoiceState({
      key: choiceKey,
      choices: current ? shuffle(current.choices) : [],
    })
  }

  const start = useCallback((items: readonly T[], priorityIds?: ReadonlySet<string>) => {
    setSessionId((value) => value + 1)
    setQueue(takeQuizItems(items, QUIZ_SIZE, priorityIds))
    setIndex(0)
    setPicked(null)
    setAnswers([])
  }, [])

  const choose = useCallback((item: T, option: string, correct: boolean, note: string | null) => {
    setPicked(option)
    setAnswers((currentAnswers) => [...currentAnswers, { item, picked: option, correct, note }])
  }, [])

  const next = useCallback(() => {
    setPicked(null)
    setIndex((value) => value + 1)
  }, [])

  return {
    queue,
    index,
    picked,
    answers,
    current,
    finished,
    choices: choiceState.key === choiceKey ? choiceState.choices : [],
    start,
    choose,
    next,
  }
}
