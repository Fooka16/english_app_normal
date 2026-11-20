# ふだん英語

友達との会話、恋愛のLINE、学校、バイト、旅行、SNSで使う自然な英語と、日常の英単語を学ぶWebアプリです。ログインもサーバーも使わず、学習記録はこのブラウザの localStorage に保存されます。

## できること

- 日常英会話の3択クイズ（10ジャンル、100問。1セット最大10問）
- 英単語の3択クイズ（初級100・中級100・上級100）
- スワイプ単語帳（右で「覚えた」、左で「まだ」。ボタンと矢印キーにも対応）
- 間違えた問題の復習（3回連続で正解すると苦手から外れます）
- 学習記録（今日の問題数、累計、正答率、連続日数、7日分の棒グラフ）
- 英語の読み上げ（Web Speech API、通常速度とゆっくり）

右スワイプは完全な習得ではなく、自分での評価です。覚えた単語も、絞り込みからもう一度学習できます。

## フォルダ構成

```
src/
  components/     画面
  context/        学習記録の共有
  data/
    conversations/  英会話のJSON。ファイルを足すと問題が増える
    vocabulary/     英単語のJSON。ファイルを足すと単語が増える
    load.ts         JSONの読み込み
  hooks/          クイズの進行
  lib/            保存、出題、音声、表示名
  types.ts        型
```

画面遷移は React の state で切り替えています。問題データと画面の処理は分けてあります。

## 開発

```bash
npm install
npm run dev
```

データの確認:

```bash
npm run validate
```

ビルド:

```bash
npm run build
npm run preview
```

## 問題を増やす

`src/data/conversations/` か `src/data/vocabulary/` に、同じ形の JSON 配列ファイルを追加します。既存の id は変えないでください。学習記録は id で紐づいているため、id を変えると別の問題として扱われます。

英会話の例:

```json
{
  "id": "conversation_101",
  "category": "friends",
  "level": "beginner",
  "japanese": "今何してるん？",
  "correctEnglish": "What are you doing?",
  "choices": ["What do you do?", "What are you doing?", "What did you do?"],
  "explanation": "今この瞬間に何をしているか尋ねる表現です。",
  "alternativeExpressions": ["What are you up to?"]
}
```

`category` は `friends` `romance` `emotions` `school` `work` `cafe` `travel` `sns` `music` `daily` のいずれかです。`level` は `beginner` `intermediate` `advanced` です。`choices` は3つで、その中に `correctEnglish` をそのまま入れてください。

英単語は `id` `word` `meaning` `partOfSpeech` `level` `example` `exampleJapanese` `choices` を持ちます。`choices` は3つの日本語で、その中に `meaning` を入れてください。

## GitHub Pages で公開する

1. このフォルダを GitHub リポジトリに push します。
2. リポジトリの Settings → Pages → Build and deployment の Source を **GitHub Actions** にします。
3. `main` または `master` へ push すると、`.github/workflows/deploy.yml` がビルドして公開します。
4. 公開URLは Actions の Deploy ジョブ、または Settings → Pages に表示されます。

ワークフローはリポジトリ名から公開パスを決めます。

- 普通のリポジトリ（例: `english_app`）は `https://ユーザー名.github.io/english_app/`
- リポジトリ名が `ユーザー名.github.io` のユーザーサイトは `https://ユーザー名.github.io/`

リポジトリ名を変えても、このワークフローを使っていれば `vite.config.ts` を手で直す必要はありません。`VITE_BASE` が自動で `/新しいリポジトリ名/` になります。

手元だけでパスを指定してビルドする場合:

```bash
# Windows PowerShell
$env:VITE_BASE="/リポジトリ名/"; npm run build

# macOS / Linux
VITE_BASE=/リポジトリ名/ npm run build
```

ローカルの `npm run dev` ではベースパスは `/` のままです。

## 今回入れてないもの

英文の並び替え、マイクでの発音チェック、AIとの会話、学習リマインダー、PWA、ログイン、端末間の同期、学習データの書き出しと読み込みは、今後足せるようにデータと記録を分けてあります。今回の画面には出していません。
