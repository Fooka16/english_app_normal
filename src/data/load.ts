import type { Conversation, ConversationCategory, Level, Vocabulary } from '../types.ts'

const CATEGORIES = new Set<string>([
  'friends',
  'romance',
  'emotions',
  'school',
  'work',
  'cafe',
  'travel',
  'sns',
  'music',
  'daily',
])

const LEVELS = new Set<string>(['beginner', 'intermediate', 'advanced'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim())
}

function toConversation(value: Record<string, unknown>, file: string): Conversation | null {
  const choices = textList(value.choices)
  const correctEnglish = typeof value.correctEnglish === 'string' ? value.correctEnglish.trim() : ''
  const category = typeof value.category === 'string' ? value.category : ''
  const level = typeof value.level === 'string' ? value.level : ''
  const id = typeof value.id === 'string' ? value.id.trim() : ''
  const japanese = typeof value.japanese === 'string' ? value.japanese.trim() : ''
  const explanation = typeof value.explanation === 'string' ? value.explanation.trim() : ''
  const valid =
    id.length > 0 &&
    CATEGORIES.has(category) &&
    LEVELS.has(level) &&
    japanese.length > 0 &&
    correctEnglish.length > 0 &&
    choices.length === 3 &&
    new Set(choices).size === 3 &&
    choices.includes(correctEnglish) &&
    explanation.length > 0

  if (!valid) {
    console.warn(`英会話データを読み飛ばしました: ${file} / ${String(value.id)}`)
    return null
  }

  return {
    id,
    category: category as ConversationCategory,
    level: level as Level,
    japanese,
    correctEnglish,
    choices,
    explanation,
    alternativeExpressions: textList(value.alternativeExpressions),
  }
}

function toVocabulary(value: Record<string, unknown>, file: string): Vocabulary | null {
  const choices = textList(value.choices)
  const meaning = typeof value.meaning === 'string' ? value.meaning.trim() : ''
  const level = typeof value.level === 'string' ? value.level : ''
  const id = typeof value.id === 'string' ? value.id.trim() : ''
  const word = typeof value.word === 'string' ? value.word.trim() : ''
  const partOfSpeech = typeof value.partOfSpeech === 'string' ? value.partOfSpeech.trim() : ''
  const example = typeof value.example === 'string' ? value.example.trim() : ''
  const exampleJapanese = typeof value.exampleJapanese === 'string' ? value.exampleJapanese.trim() : ''
  const valid =
    id.length > 0 &&
    word.length > 0 &&
    meaning.length > 0 &&
    partOfSpeech.length > 0 &&
    LEVELS.has(level) &&
    example.length > 0 &&
    exampleJapanese.length > 0 &&
    choices.length === 3 &&
    new Set(choices).size === 3 &&
    choices.includes(meaning)

  if (!valid) {
    console.warn(`英単語データを読み飛ばしました: ${file} / ${String(value.id)}`)
    return null
  }

  return {
    id,
    word,
    meaning,
    partOfSpeech,
    level: level as Level,
    example,
    exampleJapanese,
    choices,
  }
}

function readModules(modules: Record<string, unknown>, kind: 'conversation' | 'vocabulary') {
  const items: unknown[] = []
  for (const [file, loaded] of Object.entries(modules)) {
    if (!Array.isArray(loaded)) {
      console.warn(`${file} は配列のJSONにしてください。`)
      continue
    }
    for (const entry of loaded) {
      if (!isRecord(entry)) continue
      const item = kind === 'conversation' ? toConversation(entry, file) : toVocabulary(entry, file)
      if (item) items.push(item)
    }
  }
  return items
}

function uniqueById<T extends { id: string }>(items: T[], label: string): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (seen.has(item.id)) {
      console.warn(`重複した${label}IDを読み飛ばしました: ${item.id}`)
      continue
    }
    seen.add(item.id)
    result.push(item)
  }
  return result.sort((a, b) => a.id.localeCompare(b.id))
}

const conversationModules = import.meta.glob('./conversations/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

const vocabularyModules = import.meta.glob('./vocabulary/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

export const conversations = uniqueById(
  readModules(conversationModules, 'conversation') as Conversation[],
  '英会話',
)

export const vocabulary = uniqueById(
  readModules(vocabularyModules, 'vocabulary') as Vocabulary[],
  '英単語',
)
