import { useContext } from 'react'
import { ProgressContext } from '../context/progress-api.ts'
import type { ProgressApi } from '../context/progress-api.ts'

export function useProgress(): ProgressApi {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('ProgressProvider の内側で使ってください。')
  return value
}
