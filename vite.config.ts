import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// ローカル開発は / 。GitHub Pages では Actions が VITE_BASE=/リポジトリ名/ を渡す。
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
