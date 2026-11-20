import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const categories = new Set(['friends', 'romance', 'emotions', 'school', 'work', 'cafe', 'travel', 'sns', 'music', 'daily'])
const levels = new Set(['beginner', 'intermediate', 'advanced'])
const errors = []

function readJsonDir(folder) {
  return readdirSync(join(root, folder))
    .filter((name) => name.endsWith('.json'))
    .flatMap((name) => {
      const data = JSON.parse(readFileSync(join(root, folder, name), 'utf8'))
      if (!Array.isArray(data)) errors.push(`${name} は配列ではありません。`)
      return Array.isArray(data) ? data.map((item) => ({ ...item, file: name })) : []
    })
}

function unique(items, label) {
  const seen = new Set()
  for (const item of items) {
    if (seen.has(item.id)) errors.push(`${label} ID が重複: ${item.id}`)
    seen.add(item.id)
  }
}

const conversations = readJsonDir('conversations')
const vocabulary = readJsonDir('vocabulary')
unique(conversations, '英会話')
unique(vocabulary, '英単語')

const counts = {}
for (const item of conversations) {
  counts[item.category] = (counts[item.category] ?? 0) + 1
  if (!categories.has(item.category)) errors.push(`未知のジャンル: ${item.id}`)
  if (!levels.has(item.level)) errors.push(`未知の難易度: ${item.id}`)
  if (!Array.isArray(item.choices) || item.choices.length !== 3) errors.push(`選択肢が3つでない: ${item.id}`)
  if (new Set(item.choices).size !== 3) errors.push(`選択肢が重複: ${item.id}`)
  if (!item.choices?.includes(item.correctEnglish)) errors.push(`正解が選択肢にない: ${item.id}`)
  if (!item.japanese || !item.explanation) errors.push(`文が不足: ${item.id}`)
  if (!Array.isArray(item.alternativeExpressions)) errors.push(`別表現がない: ${item.id}`)
}
for (const category of categories) {
  if (counts[category] !== 10) errors.push(`${category} は ${counts[category] ?? 0} 問です。`)
}

const words = new Set()
const levelCounts = {}
for (const item of vocabulary) {
  levelCounts[item.level] = (levelCounts[item.level] ?? 0) + 1
  if (!levels.has(item.level)) errors.push(`未知の難易度: ${item.id}`)
  if (!Array.isArray(item.choices) || item.choices.length !== 3) errors.push(`選択肢が3つでない: ${item.id}`)
  if (new Set(item.choices).size !== 3) errors.push(`選択肢が重複: ${item.id}`)
  if (!item.choices?.includes(item.meaning)) errors.push(`意味が選択肢にない: ${item.id}`)
  const pattern = new RegExp(`\\b${item.word}(?:s|es|ed|ing|d)?\\b`, 'i')
  if (!pattern.test(item.example ?? '')) errors.push(`例文に単語がない: ${item.word}`)
  const key = String(item.word).toLowerCase()
  if (words.has(key)) errors.push(`単語が重複: ${item.word}`)
  words.add(key)
}
for (const level of levels) {
  if (levelCounts[level] !== 100) errors.push(`${level} は ${levelCounts[level] ?? 0} 語です。`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`conversations ${conversations.length}, vocabulary ${vocabulary.length}`)
