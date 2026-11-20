export type SpeechResult = { ok: true } | { ok: false; message: string }

const UNSUPPORTED = 'このブラウザは音声読み上げに対応していません。Chrome、Edge、Safari で試してください。'

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function primeVoices(): void {
  if (!canSpeak()) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.getVoices()
  })
}

function englishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((voice) => voice.lang === 'en-US') ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en-us')) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('en'))
  )
}

export function speakEnglish(text: string, rate: number): SpeechResult {
  if (!canSpeak()) return { ok: false, message: UNSUPPORTED }
  const line = text.trim()
  if (!line) return { ok: false, message: '読み上げる英文がありません。' }

  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(line)
    utterance.lang = 'en-US'
    utterance.rate = rate
    const voice = englishVoice()
    if (voice) utterance.voice = voice
    synth.speak(utterance)
    synth.resume()
    return { ok: true }
  } catch {
    return { ok: false, message: '音声を再生できませんでした。' }
  }
}
