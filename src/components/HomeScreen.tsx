import { useProgress } from '../hooks/useProgress.ts'
import { vocabulary } from '../data/load.ts'
import { accuracy, currentStreak, todayRecord, weakCount, wordCounts } from '../lib/storage.ts'
import type { Screen } from '../types.ts'

export function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { progress } = useProgress()
  const today = todayRecord(progress)
  const words = wordCounts(progress)
  const totalWords = vocabulary.length
  const knownRate = totalWords === 0 ? 0 : Math.round((words.known / totalWords) * 100)
  const weak = weakCount(progress.conversations) + weakCount(progress.vocabQuiz)

  return (
    <section className="stack home">
      <header className="brand">
        <span className="logo" aria-hidden="true">
          ふ
        </span>
        <div>
          <p className="eyebrow">Everyday English</p>
          <h1>ふだん英語</h1>
        </div>
      </header>
      <p className="lead">教科書の直訳ではなく、友達・恋愛・学校・仕事でそのまま使える英語を集めました。</p>

      <div className="stat-grid">
        <article className="stat">
          <p className="stat-label">今日の問題</p>
          <p className="stat-value">{today.answered}</p>
        </article>
        <article className="stat">
          <p className="stat-label">覚えた単語</p>
          <p className="stat-value">{words.known}</p>
        </article>
        <article className="stat">
          <p className="stat-label">連続日数</p>
          <p className="stat-value">{currentStreak(progress)}</p>
        </article>
      </div>

      <article className="panel">
        <div className="panel-head">
          <h2>学習の進捗</h2>
          <span className="pill">{progress.totalAnswered === 0 ? '正答率 —' : `正答率 ${accuracy(progress)}%`}</span>
        </div>
        <p className="muted">
          単語の自己評価 {words.known} / {totalWords}
        </p>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${knownRate}%` }} />
        </div>
        <p className="fine">
          苦手 {weak} 件 · まだ覚えていない単語 {words.unknown} 語 · 累計 {progress.totalAnswered} 問
        </p>
      </article>

      <div className="mode-list">
        <ModeButton
          title="日常英会話クイズ"
          text="カジュアルな日本語から、自然な英語を3択で選びます。"
          onClick={() => onNavigate('conversation')}
        />
        <ModeButton
          title="英単語3択クイズ"
          text="日常で使う単語の意味を、初級・中級・上級から学びます。"
          onClick={() => onNavigate('vocabulary')}
        />
        <ModeButton
          title="スワイプ単語帳"
          text="右で「覚えた」、左で「まだ」。カードをタップすると例文が出ます。"
          onClick={() => onNavigate('swipe')}
        />
        <ModeButton
          title="苦手問題の復習"
          text={weak === 0 ? '間違えた問題と、覚えていない単語をここから復習します。' : `会話と単語の苦手 ${weak} 件を優先して出します。`}
          onClick={() => onNavigate('review')}
        />
        <ModeButton title="学習記録" text="正答率、連続日数、7日分の学習量を見ます。" onClick={() => onNavigate('stats')} />
      </div>
    </section>
  )
}

function ModeButton({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" className="mode" onClick={onClick}>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <span aria-hidden="true" className="chevron">
        ›
      </span>
    </button>
  )
}
