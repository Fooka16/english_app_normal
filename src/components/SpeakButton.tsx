import { useState } from 'react'
import { canSpeak, speakEnglish } from '../lib/speech.ts'

export function SpeakButton({ text, label = '発音' }: { text: string; label?: string }) {
  const [note, setNote] = useState<string | null>(null)
  const supported = canSpeak()

  function play(rate: number) {
    const result = speakEnglish(text, rate)
    setNote(result.ok ? null : result.message)
  }

  return (
    <div className="speak">
      <button type="button" className="btn btn-soft" onClick={() => play(1)} disabled={!supported}>
        {label}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => play(0.75)} disabled={!supported}>
        ゆっくり
      </button>
      {note ? <p className="speak-note">{note}</p> : null}
      {!supported ? <p className="speak-note">このブラウザは音声読み上げに対応していません。</p> : null}
    </div>
  )
}
