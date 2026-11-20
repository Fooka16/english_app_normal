import type { ReactNode } from 'react'
import { percent } from '../lib/quiz.ts'

export function QuizResult({
  correctCount,
  total,
  onRetry,
  children,
}: {
  correctCount: number
  total: number
  onRetry: () => void
  children?: ReactNode
}) {
  return (
    <section className="stack">
      <div className="panel result-hero">
        <p className="eyebrow">セット結果</p>
        <p className="result-score">
          {correctCount}
          <span> / {total}</span>
        </p>
        <p className="result-rate">正答率 {percent(correctCount, total)}%</p>
        <p className="muted">間違えた問題は苦手リストに保存しました。</p>
      </div>
      {children}
      <button type="button" className="btn btn-primary btn-block" onClick={onRetry}>
        もう一度
      </button>
    </section>
  )
}
