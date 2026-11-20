import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useProgress } from '../hooks/useProgress.ts'
import { vocabulary } from '../data/load.ts'
import { SWIPE_FILTERS, levelLabel } from '../lib/labels.ts'
import { SWIPE_THRESHOLD, buildDeck } from '../lib/quiz.ts'
import type { CardStatus } from '../lib/quiz.ts'
import type { SwipeFilter, Vocabulary, WordProgress } from '../types.ts'
import { SpeakButton } from './SpeakButton.tsx'

interface UndoAction {
  id: string
  previous: WordProgress | undefined
  status: 'known' | 'unknown'
}

export function SwipeDeck({
  filter,
  onFilterChange,
}: {
  filter: SwipeFilter
  onFilterChange: (filter: SwipeFilter) => void
}) {
  const { progress, setWord, undoWord } = useProgress()
  const [deck, setDeck] = useState<Vocabulary[]>([])
  const [nonce, setNonce] = useState(0)
  const [ready, setReady] = useState(false)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [undo, setUndo] = useState<UndoAction | null>(null)
  const [knownCount, setKnownCount] = useState(0)
  const [unknownCount, setUnknownCount] = useState(0)
  const offsetRef = useRef(0)
  const pointer = useRef<{ x: number; moved: boolean } | null>(null)
  const locked = useRef(false)
  const timer = useRef<number | null>(null)
  const progressRef = useRef(progress)
  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    locked.current = false
    const statusOf = (id: string): CardStatus => progressRef.current.words[id]?.status ?? 'unseen'
    setDeck(buildDeck(vocabulary, filter, statusOf))
    setOffset(0)
    offsetRef.current = 0
    setFlipped(false)
    setDone(false)
    setUndo(null)
    setKnownCount(0)
    setUnknownCount(0)
    setReady(true)
  }, [filter, nonce])

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const current = deck[0]
  const nextCard = deck[1]

  function moveTo(value: number) {
    offsetRef.current = value
    setOffset(value)
  }

  function commit(status: 'known' | 'unknown') {
    const card = deck[0]
    if (!card) return
    const previous = progress.words[card.id]
    setUndo({ id: card.id, previous, status })
    setWord(card.id, status)
    setKnownCount((count) => count + (status === 'known' ? 1 : 0))
    setUnknownCount((count) => count + (status === 'unknown' ? 1 : 0))
    if (deck.length <= 1) setDone(true)
    setDeck((cards) => cards.slice(1))
    setFlipped(false)
    moveTo(0)
    locked.current = false
  }

  function fly(status: 'known' | 'unknown') {
    if (!deck[0] || locked.current) return
    locked.current = true
    setDragging(false)
    pointer.current = null
    moveTo(status === 'known' ? 460 : -460)
    timer.current = window.setTimeout(() => commit(status), 180)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (locked.current) return
    const target = event.target
    if (target instanceof Element && target.closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointer.current = { x: event.clientX, moved: false }
    setDragging(true)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!pointer.current || locked.current) return
    const delta = event.clientX - pointer.current.x
    if (Math.abs(delta) > 8) pointer.current.moved = true
    moveTo(delta)
  }

  function onPointerUp() {
    if (!pointer.current || locked.current) return
    const moved = pointer.current.moved
    const delta = offsetRef.current
    pointer.current = null
    setDragging(false)
    if (!moved && Math.abs(delta) < 12) {
      setFlipped((value) => !value)
      moveTo(0)
      return
    }
    if (delta > SWIPE_THRESHOLD) fly('known')
    else if (delta < -SWIPE_THRESHOLD) fly('unknown')
    else moveTo(0)
  }

  function undoLast() {
    if (!undo || locked.current) return
    const card = vocabulary.find((item) => item.id === undo.id)
    if (!card) return
    undoWord(undo.id, undo.previous)
    setKnownCount((count) => count - (undo.status === 'known' ? 1 : 0))
    setUnknownCount((count) => count - (undo.status === 'unknown' ? 1 : 0))
    setDeck((cards) => [card, ...cards.filter((item) => item.id !== card.id)])
    setDone(false)
    setFlipped(false)
    setUndo(null)
    moveTo(0)
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') fly('known')
      if (event.key === 'ArrowLeft') fly('unknown')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <section className="stack">
      <header>
        <h1>スワイプ単語帳</h1>
        <p className="lead">右へ「覚えた」、左へ「まだ」。タップで意味と例文を表示します。自己評価なので、あとから何度でもやり直せます。</p>
      </header>
      <div className="chips">
        {SWIPE_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? 'chip is-on' : 'chip'}
            onClick={() => onFilterChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="deck-tools">
        <p className="fine">残り {deck.length} 枚</p>
        <button type="button" className="text-button" onClick={() => setNonce((value) => value + 1)}>
          シャッフル
        </button>
      </div>

      {current ? (
        <div className="deck-stage">
          {nextCard ? (
            <article className="deck-under" aria-hidden="true">
              <p>{nextCard.word}</p>
            </article>
          ) : null}
          <div
            className={`deck-move${dragging ? ' is-dragging' : ''}`}
            style={{ transform: `translateX(${offset}px) rotate(${offset / 18}deg)` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className="stamp stamp-know" style={{ opacity: Math.min(1, Math.max(0, offset / 120)) }}>
              覚えた
            </span>
            <span className="stamp stamp-yet" style={{ opacity: Math.min(1, Math.max(0, -offset / 120)) }}>
              まだ
            </span>
            <div className={`deck-flip${flipped ? ' is-flipped' : ''}`}>
              <article className="deck-face" aria-hidden={flipped}>
                <p className="eyebrow">{levelLabel(current.level)}</p>
                <h2>{current.word}</h2>
                <p className="pill">{current.partOfSpeech}</p>
                <p className="fine">タップして意味を見る</p>
                <SpeakButton text={current.word} label="単語を聞く" />
              </article>
              <article className="deck-face deck-back" aria-hidden={!flipped}>
                <p className="eyebrow">{current.word}</p>
                <h2 className="meaning">{current.meaning}</h2>
                <p className="example">{current.example}</p>
                <p>{current.exampleJapanese}</p>
                <SpeakButton text={current.example} label="例文を聞く" />
              </article>
            </div>
          </div>
        </div>
      ) : null}

      {!current && ready && !done ? (
        <div className="panel">
          <h2>このリストには単語がありません</h2>
          <p className="muted">別の絞り込みを選ぶと、まだ見ていない単語や覚えた単語も学習できます。</p>
        </div>
      ) : null}

      {!current && done ? (
        <div className="panel">
          <h2>ここまでです</h2>
          <p>
            覚えた {knownCount} 枚 · まだ {unknownCount} 枚
          </p>
          <p className="muted">右スワイプは完全な習得ではなく、自分での評価です。</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setNonce((value) => value + 1)}>
            同じリストをもう一度
          </button>
        </div>
      ) : null}

      <div className="swipe-actions">
        <button type="button" className="btn btn-danger" onClick={() => fly('unknown')} disabled={!current}>
          まだ
        </button>
        <button type="button" className="btn btn-ghost" onClick={undoLast} disabled={!undo}>
          取り消す
        </button>
        <button type="button" className="btn btn-good" onClick={() => fly('known')} disabled={!current}>
          覚えた
        </button>
      </div>
      <p className="fine center">PCでは左右の矢印キーでも分類できます。</p>
    </section>
  )
}
