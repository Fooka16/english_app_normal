import { useState } from 'react'
import { useProgress } from '../hooks/useProgress.ts'
import { weakCount, wordCounts } from '../lib/storage.ts'
import { ConversationQuiz } from './ConversationQuiz.tsx'
import { VocabularyQuiz } from './VocabularyQuiz.tsx'

export function ReviewScreen({ onOpenUnknown }: { onOpenUnknown: () => void }) {
  const { progress } = useProgress()
  const [tab, setTab] = useState<'menu' | 'conversation' | 'vocab'>('menu')
  const conversationWeak = weakCount(progress.conversations)
  const vocabWeak = weakCount(progress.vocabQuiz)
  const unknownWords = wordCounts(progress).unknown

  if (tab === 'conversation') {
    return (
      <section className="stack">
        <button type="button" className="text-button" onClick={() => setTab('menu')}>
          ← 復習メニュー
        </button>
        <ConversationQuiz mode="review" />
      </section>
    )
  }

  if (tab === 'vocab') {
    return (
      <section className="stack">
        <button type="button" className="text-button" onClick={() => setTab('menu')}>
          ← 復習メニュー
        </button>
        <VocabularyQuiz mode="review" />
      </section>
    )
  }

  return (
    <section className="stack">
      <header>
        <h1>苦手の復習</h1>
        <p className="lead">間違えた問題は、3回連続で正解するまで復習に残ります。</p>
      </header>
      <button type="button" className="mode" onClick={() => setTab('conversation')}>
        <span>
          <strong>英会話の苦手</strong>
          <small>{conversationWeak === 0 ? 'まだありません' : `${conversationWeak} 問`}</small>
        </span>
        <span className="chevron" aria-hidden="true">
          ›
        </span>
      </button>
      <button type="button" className="mode" onClick={() => setTab('vocab')}>
        <span>
          <strong>単語クイズの苦手</strong>
          <small>{vocabWeak === 0 ? 'まだありません' : `${vocabWeak} 語`}</small>
        </span>
        <span className="chevron" aria-hidden="true">
          ›
        </span>
      </button>
      <button type="button" className="mode" onClick={onOpenUnknown}>
        <span>
          <strong>まだ覚えていない単語</strong>
          <small>{unknownWords === 0 ? 'スワイプで「まだ」にした単語がここに出ます' : `${unknownWords} 語をカードで復習`}</small>
        </span>
        <span className="chevron" aria-hidden="true">
          ›
        </span>
      </button>
    </section>
  )
}
