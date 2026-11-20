import { useState } from 'react'
import { useProgress } from '../hooks/useProgress.ts'
import { vocabulary } from '../data/load.ts'
import { useQuizSession } from '../hooks/useQuizSession.ts'
import { LEVELS, levelLabel } from '../lib/labels.ts'
import { reviewNote } from '../lib/storage.ts'
import type { Level, Vocabulary } from '../types.ts'
import { ChoiceList } from './ChoiceList.tsx'
import { QuizResult } from './QuizResult.tsx'
import { SpeakButton } from './SpeakButton.tsx'

type LevelFilter = Level | 'all'

export function VocabularyQuiz({ mode }: { mode: 'practice' | 'review' }) {
  const { progress, recordVocab } = useProgress()
  const [reviewPool] = useState<Vocabulary[] | null>(() => {
    if (mode !== 'review') return null
    return vocabulary.filter((item) => progress.vocabQuiz[item.id]?.isWeak)
  })
  const session = useQuizSession(reviewPool)
  const [level, setLevel] = useState<LevelFilter>('all')
  const [notice, setNotice] = useState<string | null>(null)

  if (mode === 'review' && reviewPool && reviewPool.length === 0) {
    return (
      <section className="stack">
        <header>
          <h1>単語の復習</h1>
          <p className="lead">単語クイズで間違えた単語はまだありません。</p>
        </header>
      </section>
    )
  }

  const levelPool = level === 'all' ? vocabulary : vocabulary.filter((item) => item.level === level)

  if (!session.current && !session.finished) {
    const weakInLevel = levelPool.filter((item) => progress.vocabQuiz[item.id]?.isWeak)
    return (
      <section className="stack">
        <header>
          <h1>英単語3択クイズ</h1>
          <p className="lead">英単語の意味を選んでください。1セット最大10問です。</p>
        </header>
        <div className="chips" aria-label="難易度">
          <button type="button" className={level === 'all' ? 'chip is-on' : 'chip'} onClick={() => setLevel('all')}>
            すべて
          </button>
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={level === item.id ? 'chip is-on' : 'chip'}
              onClick={() => setLevel(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="fine">
          対象 {levelPool.length} 語 · この中の苦手 {weakInLevel.length} 語
        </p>
        {notice ? <p className="notice">{notice}</p> : null}
        <button type="button" className="btn btn-primary btn-block" onClick={() => begin('normal', levelPool)}>
          この難易度で始める
        </button>
        <button type="button" className="btn btn-soft btn-block" onClick={() => begin('priority', levelPool)}>
          苦手を優先して始める
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => begin('weak', levelPool)}>
          苦手だけ出題
        </button>
      </section>
    )
  }

  if (session.finished || !session.current) {
    const correctCount = session.answers.filter((answer) => answer.correct).length
    const missed = session.answers.filter((answer) => !answer.correct)
    return (
      <QuizResult
        correctCount={correctCount}
        total={session.queue.length}
        onRetry={() => begin(mode === 'review' ? 'weak' : 'normal', mode === 'review' ? (reviewPool ?? []) : levelPool)}
      >
        {missed.length > 0 ? (
          <div className="panel">
            <h2>見直したい単語</h2>
            <ul className="miss-list">
              {missed.map((answer) => (
                <li key={answer.item.id}>
                  <p>{answer.item.word}</p>
                  <strong>{answer.item.meaning}</strong>
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

  function begin(kind: 'normal' | 'priority' | 'weak', pool: Vocabulary[]) {
    const weak = pool.filter((item) => progress.vocabQuiz[item.id]?.isWeak)
    if (kind === 'weak' && weak.length === 0) {
      setNotice('苦手単語がまだないので、ふつうの出題にしてください。')
      return
    }
    setNotice(
      kind === 'priority' && weak.length < 10 && weak.length > 0
        ? '苦手が10語未満のため、ほかの単語も混ぜます。'
        : null,
    )
    if (kind === 'weak') session.start(weak)
    else if (kind === 'priority') session.start(pool, new Set(weak.map((item) => item.id)))
    else session.start(pool)
  }

  function onPick(option: string) {
    if (picked) return
    const correct = option === current.meaning
    const note = reviewNote(progress.vocabQuiz[current.id], correct)
    session.choose(current, option, correct, note)
    recordVocab(current.id, correct)
  }

  return (
    <section className="stack">
      <div className="quiz-top">
        <p>
          {session.index + 1} / {session.queue.length}
        </p>
        <span className="pill">{levelLabel(current.level)}</span>
      </div>
      <article className="panel question-card">
        <p className="eyebrow">{current.partOfSpeech}</p>
        <h2 className="prompt word-prompt">{current.word}</h2>
      </article>
      <ChoiceList choices={session.choices} picked={picked} correct={current.meaning} onPick={onPick} />
      {picked ? (
        <article className={`feedback ${picked === current.meaning ? 'is-good' : 'is-bad'}`} aria-live="polite">
          <p className="feedback-title">{picked === current.meaning ? '正解' : '不正解'}</p>
          <p className="answer-line">
            {current.word} · {current.meaning}
          </p>
          <p className="fine">{current.partOfSpeech}</p>
          <p className="example">{current.example}</p>
          <p>{current.exampleJapanese}</p>
          {session.answers[session.answers.length - 1]?.note ? (
            <p className="fine">{session.answers[session.answers.length - 1]?.note}</p>
          ) : null}
          <SpeakButton text={current.word} label="単語を聞く" />
          <SpeakButton text={current.example} label="例文を聞く" />
          <button type="button" className="btn btn-primary btn-block" onClick={session.next}>
            {session.index + 1 === session.queue.length ? '結果を見る' : '次の問題'}
          </button>
        </article>
      ) : null}
    </section>
  )
}
