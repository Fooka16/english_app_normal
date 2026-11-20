import { useState } from 'react'
import { useProgress } from '../hooks/useProgress.ts'
import { conversations } from '../data/load.ts'
import { useQuizSession } from '../hooks/useQuizSession.ts'
import { CATEGORIES, categoryLabel, levelLabel } from '../lib/labels.ts'
import { reviewNote } from '../lib/storage.ts'
import type { Conversation, ConversationCategory } from '../types.ts'
import { ChoiceList } from './ChoiceList.tsx'
import { QuizResult } from './QuizResult.tsx'
import { SpeakButton } from './SpeakButton.tsx'

export function ConversationQuiz({ mode }: { mode: 'practice' | 'review' }) {
  const { progress, recordConversation } = useProgress()
  const [reviewPool] = useState<Conversation[] | null>(() => {
    if (mode !== 'review') return null
    return conversations.filter((item) => progress.conversations[item.id]?.isWeak)
  })
  const session = useQuizSession(reviewPool)
  const [category, setCategory] = useState<ConversationCategory | 'all'>('all')

  if (mode === 'review' && reviewPool && reviewPool.length === 0) {
    return (
      <section className="stack">
        <Header title="英会話の復習" text="間違えた英会話はまだありません。" />
      </section>
    )
  }

  if (!session.current && !session.finished) {
    const pool = category === 'all' ? conversations : conversations.filter((item) => item.category === category)
    return (
      <section className="stack">
        <Header title="日常英会話クイズ" text="日本語に一番自然な英語を選んでください。1セット10問です。" />
        <div className="chips" role="listbox" aria-label="ジャンル">
          <button
            type="button"
            className={category === 'all' ? 'chip is-on' : 'chip'}
            onClick={() => setCategory('all')}
          >
            すべて
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={category === item.id ? 'chip is-on' : 'chip'}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="fine">この範囲の問題数: {pool.length}</p>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={pool.length === 0}
          onClick={() => session.start(pool)}
        >
          このジャンルで始める
        </button>
      </section>
    )
  }

  if (session.finished || !session.current) {
    const correctCount = session.answers.filter((answer) => answer.correct).length
    const missed = session.answers.filter((answer) => !answer.correct)
    const retryPool = reviewPool ?? (category === 'all' ? conversations : conversations.filter((item) => item.category === category))
    return (
      <QuizResult correctCount={correctCount} total={session.queue.length} onRetry={() => session.start(retryPool)}>
        {missed.length > 0 ? (
          <div className="panel">
            <h2>見直したい問題</h2>
            <ul className="miss-list">
              {missed.map((answer) => (
                <li key={answer.item.id}>
                  <p>{answer.item.japanese}</p>
                  <strong>{answer.item.correctEnglish}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="panel muted">全問正解です。</p>
        )}
      </QuizResult>
    )
  }

  const current = session.current
  const picked = session.picked

  function onPick(option: string) {
    if (picked) return
    const correct = option === current.correctEnglish
    const note = reviewNote(progress.conversations[current.id], correct)
    session.choose(current, option, correct, note)
    recordConversation(current.id, correct)
  }

  return (
    <section className="stack">
      <div className="quiz-top">
        <p>
          {session.index + 1} / {session.queue.length}
        </p>
        <span className="pill">{categoryLabel(current.category)}</span>
      </div>
      <article className="panel question-card">
        <p className="eyebrow">{levelLabel(current.level)}</p>
        <h2 className="prompt">{current.japanese}</h2>
      </article>
      <ChoiceList choices={session.choices} picked={picked} correct={current.correctEnglish} onPick={onPick} />
      {picked ? (
        <article className={`feedback ${picked === current.correctEnglish ? 'is-good' : 'is-bad'}`} aria-live="polite">
          <p className="feedback-title">{picked === current.correctEnglish ? '正解' : '不正解'}</p>
          <p className="answer-line">{current.correctEnglish}</p>
          <p>{current.japanese}</p>
          <p className="explain">{current.explanation}</p>
          {current.alternativeExpressions.length > 0 ? (
            <p className="fine">ほかの言い方: {current.alternativeExpressions.join(' / ')}</p>
          ) : null}
          {session.answers[session.answers.length - 1]?.note ? (
            <p className="fine">{session.answers[session.answers.length - 1]?.note}</p>
          ) : null}
          <SpeakButton text={current.correctEnglish} label="英文を聞く" />
          <button type="button" className="btn btn-primary btn-block" onClick={session.next}>
            {session.index + 1 === session.queue.length ? '結果を見る' : '次の問題'}
          </button>
        </article>
      ) : null}
    </section>
  )
}

function Header({ title, text }: { title: string; text: string }) {
  return (
    <header>
      <h1>{title}</h1>
      <p className="lead">{text}</p>
    </header>
  )
}
