import { useProgress } from '../hooks/useProgress.ts'
import { vocabulary } from '../data/load.ts'
import { accuracy, currentStreak, last7Days, todayRecord, weakCount, wordCounts } from '../lib/storage.ts'

export function StatsScreen({ onReview }: { onReview: () => void }) {
  const { progress, resetProgress } = useProgress()
  const today = todayRecord(progress)
  const words = wordCounts(progress)
  const days = last7Days(progress)
  const max = Math.max(1, ...days.map((day) => day.answered))
  function reset() {
    const ok = window.confirm('学習記録をすべて消します。この操作は元に戻せません。')
    if (ok) resetProgress()
  }

  return (
    <section className="stack">
      <header>
        <h1>学習記録</h1>
        <p className="lead">この端末のブラウザに保存されています。再読み込みしても残ります。</p>
      </header>

      <div className="stat-grid">
        <article className="stat">
          <p className="stat-label">今日解いた問題</p>
          <p className="stat-value">{today.answered}</p>
        </article>
        <article className="stat">
          <p className="stat-label">累計回答</p>
          <p className="stat-value">{progress.totalAnswered}</p>
        </article>
        <article className="stat">
          <p className="stat-label">正答率</p>
          <p className="stat-value">{progress.totalAnswered === 0 ? '—' : `${accuracy(progress)}%`}</p>
        </article>
        <article className="stat">
          <p className="stat-label">連続日数</p>
          <p className="stat-value">{currentStreak(progress)}</p>
        </article>
      </div>

      <article className="panel">
        <h2>最近7日間</h2>
        <div className="chart" aria-label="日別の回答数">
          {days.map((day) => (
            <div key={day.date} className="chart-col">
              <span className="chart-count">{day.answered}</span>
              <div className="chart-track">
                <div className="chart-bar" style={{ height: `${(day.answered / max) * 100}%` }} />
              </div>
              <span className={day.today ? 'chart-label is-today' : 'chart-label'}>{day.label}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel detail-list">
        <h2>単語と苦手</h2>
        <p>
          <span>覚えた単語</span>
          <strong>
            {words.known} / {vocabulary.length}
          </strong>
        </p>
        <p>
          <span>まだ覚えていない</span>
          <strong>{words.unknown}</strong>
        </p>
        <p>
          <span>英会話の苦手</span>
          <strong>{weakCount(progress.conversations)}</strong>
        </p>
        <p>
          <span>単語クイズの苦手</span>
          <strong>{weakCount(progress.vocabQuiz)}</strong>
        </p>
        <p className="fine">苦手は3回連続で正解するとリストから外れます。覚えた単語は自己評価です。</p>
      </article>

      <button type="button" className="btn btn-primary btn-block" onClick={onReview}>
        苦手の復習へ
      </button>
      <button type="button" className="btn btn-ghost btn-block" onClick={reset}>
        記録を消す
      </button>
    </section>
  )
}
