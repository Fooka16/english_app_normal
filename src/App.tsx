import { useState } from 'react'
import { ConversationQuiz } from './components/ConversationQuiz.tsx'
import { HomeScreen } from './components/HomeScreen.tsx'
import { Layout } from './components/Layout.tsx'
import { ReviewScreen } from './components/ReviewScreen.tsx'
import { StatsScreen } from './components/StatsScreen.tsx'
import { SwipeDeck } from './components/SwipeDeck.tsx'
import { VocabularyQuiz } from './components/VocabularyQuiz.tsx'
import type { Screen, SwipeFilter } from './types.ts'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [swipeFilter, setSwipeFilter] = useState<SwipeFilter>('focus')

  function navigate(next: Screen) {
    if (next === 'swipe') setSwipeFilter('focus')
    setScreen(next)
  }

  function openUnknownCards() {
    setSwipeFilter('unknown')
    setScreen('swipe')
  }

  return (
    <Layout screen={screen} onNavigate={navigate}>
      {screen === 'home' && <HomeScreen onNavigate={navigate} />}
      {screen === 'conversation' && <ConversationQuiz mode="practice" />}
      {screen === 'vocabulary' && <VocabularyQuiz mode="practice" />}
      {screen === 'swipe' && <SwipeDeck filter={swipeFilter} onFilterChange={setSwipeFilter} />}
      {screen === 'review' && <ReviewScreen onOpenUnknown={openUnknownCards} />}
      {screen === 'stats' && <StatsScreen onReview={() => setScreen('review')} />}
    </Layout>
  )
}
