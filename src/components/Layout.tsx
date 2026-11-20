import type { ReactNode } from 'react'
import type { Screen } from '../types.ts'

const NAV: { id: Screen; label: string; icon: 'home' | 'chat' | 'book' | 'cards' | 'chart' }[] = [
  { id: 'home', label: 'ホーム', icon: 'home' },
  { id: 'conversation', label: '会話', icon: 'chat' },
  { id: 'vocabulary', label: '単語', icon: 'book' },
  { id: 'swipe', label: 'カード', icon: 'cards' },
  { id: 'stats', label: '記録', icon: 'chart' },
]

export function Layout({
  screen,
  onNavigate,
  children,
}: {
  screen: Screen
  onNavigate: (screen: Screen) => void
  children: ReactNode
}) {
  return (
    <div className="app-bg">
      <div className="phone">
        <main className="app-main">{children}</main>
        <nav className="tabbar" aria-label="メインメニュー">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={screen === item.id ? 'tab is-active' : 'tab'}
              onClick={() => onNavigate(item.id)}
              aria-current={screen === item.id ? 'page' : undefined}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

function NavIcon({ name }: { name: 'home' | 'chat' | 'book' | 'cards' | 'chart' }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (name === 'home') {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    )
  }
  if (name === 'chat') {
    return (
      <svg {...common}>
        <path d="M6 17.5 4 20V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v7A2.5 2.5 0 0 1 17.5 17H8z" />
      </svg>
    )
  }
  if (name === 'book') {
    return (
      <svg {...common}>
        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5z" />
        <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3" />
      </svg>
    )
  }
  if (name === 'cards') {
    return (
      <svg {...common}>
        <rect x="7" y="4" width="12" height="15" rx="2" />
        <path d="M5 7.5v12A1.5 1.5 0 0 0 6.5 21H16" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M5 19V10M10 19V6M15 19v-7M20 19V8" />
    </svg>
  )
}
