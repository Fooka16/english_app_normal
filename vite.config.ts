import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// 公開用 index.html はビルド結果で上書きする。開発と本番ビルドは常にソースを入口にする。
function sourceEntry(): Plugin {
  return {
    name: 'source-entry',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const stripped = html
          .replace(/\s*<script\s+type="module"[^>]*src="[^"]*\/assets\/[^"]+"[^>]*><\/script>/g, '')
          .replace(/\s*<link\s+rel="stylesheet"[^>]*href="[^"]*\/assets\/[^"]+"[^>]*>/g, '')
        if (stripped.includes('/src/main.tsx')) return stripped
        return stripped.replace(
          '<div id="root"></div>',
          '<div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>',
        )
      },
    },
  }
}

// ローカル開発は / 。GitHub Pages では Actions が VITE_BASE=/リポジトリ名/ を渡す。
export default defineConfig({
  plugins: [sourceEntry(), react()],
  base: process.env.VITE_BASE || '/',
})
