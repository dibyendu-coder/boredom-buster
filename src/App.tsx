import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { challenges } from './challenges'
import {
  challengePoints,
  getPreviousDayKey,
  getTodayKey,
  loadFavorites,
  loadProgress,
  saveFavorites,
  saveProgress,
} from './storage'
import { categories, type Category, type Challenge } from './types'

type FilterCategory = Category | 'All'

const allCategory: FilterCategory = 'All'

const pickRandomChallenge = (
  pool: Challenge[],
  excludedChallengeId?: string,
): Challenge | null => {
  if (pool.length === 0) {
    return null
  }

  const filteredPool =
    excludedChallengeId && pool.length > 1
      ? pool.filter((challenge) => challenge.id !== excludedChallengeId)
      : pool

  return filteredPool[Math.floor(Math.random() * filteredPool.length)] ?? null
}

function App() {
  const initialProgress = useMemo(() => loadProgress(), [])
  const [activeCategory, setActiveCategory] = useState<FilterCategory>(allCategory)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites())
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(() =>
    pickRandomChallenge(challenges),
  )
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false)
  const [score, setScore] = useState(initialProgress.score)
  const [streakCount, setStreakCount] = useState(initialProgress.streakCount)
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(
    initialProgress.lastCompletedDate,
  )
  const [completionsByDate, setCompletionsByDate] = useState<Record<string, string[]>>(
    initialProgress.completionsByDate,
  )
  const [completionMessage, setCompletionMessage] = useState('')

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  useEffect(() => {
    saveProgress({
      score,
      streakCount,
      lastCompletedDate,
      completionsByDate,
    })
  }, [completionsByDate, lastCompletedDate, score, streakCount])

  const filteredChallenges = useMemo(() => {
    const categoryFiltered =
      activeCategory === allCategory
        ? challenges
        : challenges.filter((challenge) => challenge.category === activeCategory)

    return showFavoritesOnly
      ? categoryFiltered.filter((challenge) => favorites.includes(challenge.id))
      : categoryFiltered
  }, [activeCategory, favorites, showFavoritesOnly])

  const favoriteChallenges = useMemo(
    () => challenges.filter((challenge) => favorites.includes(challenge.id)),
    [favorites],
  )

  const today = getTodayKey()
  const displayedChallenge = useMemo(() => {
    if (selectedChallenge && filteredChallenges.some((item) => item.id === selectedChallenge.id)) {
      return selectedChallenge
    }

    return filteredChallenges[0] ?? null
  }, [filteredChallenges, selectedChallenge])

  const selectedChallengeCompletedToday = Boolean(
    displayedChallenge && completionsByDate[today]?.includes(displayedChallenge.id),
  )

  const generateChallenge = (excludeCurrent: boolean) => {
    setIsLoadingChallenge(true)
    setCompletionMessage('')

    const excludedId = excludeCurrent ? displayedChallenge?.id : undefined

    window.setTimeout(() => {
      setSelectedChallenge(pickRandomChallenge(filteredChallenges, excludedId))
      setIsLoadingChallenge(false)
    }, 360)
  }

  const toggleFavorite = (challengeId: string) => {
    setFavorites((previous) =>
      previous.includes(challengeId)
        ? previous.filter((favoriteId) => favoriteId !== challengeId)
        : [...previous, challengeId],
    )
  }

  const markChallengeComplete = () => {
    if (!displayedChallenge) {
      return
    }

    const completedToday = completionsByDate[today] ?? []

    if (completedToday.includes(displayedChallenge.id)) {
      setCompletionMessage('Already completed today. Try another challenge!')
      return
    }

    const nextCompletionsByDate = {
      ...completionsByDate,
      [today]: [...completedToday, displayedChallenge.id],
    }

    setCompletionsByDate(nextCompletionsByDate)
    setScore((previous) => previous + challengePoints(displayedChallenge))

    if (lastCompletedDate === today) {
      setCompletionMessage('Great consistency! Keep going.')
      return
    }

    const isConsecutiveDay = lastCompletedDate === getPreviousDayKey()
    setStreakCount(isConsecutiveDay ? streakCount + 1 : 1)
    setLastCompletedDate(today)
    setCompletionMessage('Challenge completed. Score and streak updated!')
  }

  const availableCount = filteredChallenges.length

  return (
    <main className="app-shell">
      <section className="hero-section" aria-labelledby="app-title">
        <p className="kicker">Boredom Buster</p>
        <h1 id="app-title">Bored? Let&apos;s fix that.</h1>
        <p className="intro-text">
          Pick a category, roll a random challenge, save favorites, and keep your momentum with
          score + streak tracking.
        </p>

        <div className="stats" role="status" aria-live="polite">
          <article className="stat-card">
            <span>Score</span>
            <strong>{score}</strong>
          </article>
          <article className="stat-card">
            <span>Streak</span>
            <strong>{streakCount} day{streakCount === 1 ? '' : 's'}</strong>
          </article>
          <article className="stat-card">
            <span>Favorites</span>
            <strong>{favorites.length}</strong>
          </article>
        </div>
      </section>

      <section className="filters" aria-label="Challenge controls">
        <div className="category-row" role="tablist" aria-label="Challenge categories">
          <button
            type="button"
            className={activeCategory === allCategory ? 'chip active' : 'chip'}
            onClick={() => setActiveCategory(allCategory)}
            role="tab"
            aria-selected={activeCategory === allCategory}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'chip active' : 'chip'}
              onClick={() => setActiveCategory(category)}
              role="tab"
              aria-selected={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="action-row">
          <button type="button" className="primary-btn" onClick={() => generateChallenge(false)}>
            Surprise Me
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => generateChallenge(true)}
            disabled={availableCount <= 1}
          >
            Give Me Another
          </button>
          <button
            type="button"
            className={showFavoritesOnly ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setShowFavoritesOnly((previous) => !previous)}
            aria-pressed={showFavoritesOnly}
          >
            {showFavoritesOnly ? 'Viewing Favorites' : 'View Favorites Only'}
          </button>
        </div>
      </section>

      <section className="challenge-area" aria-live="polite">
        {isLoadingChallenge ? (
          <article className="challenge-card loading-state" aria-label="Loading challenge">
            <p>Finding your next challenge…</p>
          </article>
        ) : availableCount === 0 ? (
          <article className="challenge-card empty-state">
            <h2>No challenges found</h2>
            <p>
              {showFavoritesOnly
                ? 'You have no favorites in this filter yet. Save a few and come back.'
                : 'Try another category to discover more challenges.'}
            </p>
          </article>
        ) : displayedChallenge ? (
          <article className="challenge-card">
            <header>
              <p className="badge">{displayedChallenge.category}</p>
              <div className="card-actions">
                <button
                  type="button"
                  className={
                    favorites.includes(displayedChallenge.id)
                      ? 'favorite-btn active'
                      : 'favorite-btn'
                  }
                  onClick={() => toggleFavorite(displayedChallenge.id)}
                  aria-pressed={favorites.includes(displayedChallenge.id)}
                >
                  {favorites.includes(displayedChallenge.id) ? '★ Favorited' : '☆ Save Favorite'}
                </button>
              </div>
            </header>

            <h2>{displayedChallenge.title}</h2>
            <p className="description">{displayedChallenge.description}</p>

            <dl className="meta-grid">
              <div>
                <dt>Estimated Time</dt>
                <dd>{displayedChallenge.estimatedMinutes} min</dd>
              </div>
              <div>
                <dt>Difficulty</dt>
                <dd>{displayedChallenge.difficulty}</dd>
              </div>
              <div>
                <dt>Points</dt>
                <dd>{challengePoints(displayedChallenge)}</dd>
              </div>
            </dl>

            <footer>
              <button
                type="button"
                className="complete-btn"
                onClick={markChallengeComplete}
                disabled={selectedChallengeCompletedToday}
              >
                {selectedChallengeCompletedToday ? 'Completed Today ✓' : 'Mark as Completed'}
              </button>
              {completionMessage ? <p className="completion-note">{completionMessage}</p> : null}
            </footer>
          </article>
        ) : (
          <article className="challenge-card empty-state">
            <h2>Ready when you are</h2>
            <p>Press Surprise Me to generate your first challenge.</p>
          </article>
        )}
      </section>

      <section className="favorites-panel" aria-labelledby="favorites-heading">
        <div className="favorites-header">
          <h2 id="favorites-heading">Favorites</h2>
          <p>Quickly revisit your saved challenge ideas.</p>
        </div>

        {favoriteChallenges.length === 0 ? (
          <div className="favorites-empty">No favorites yet. Tap “Save Favorite” on any challenge.</div>
        ) : (
          <ul className="favorites-list">
            {favoriteChallenges.map((challenge) => (
              <li key={challenge.id}>
                <button
                  type="button"
                  className="favorite-item"
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <span>{challenge.title}</span>
                  <small>
                    {challenge.category} • {challenge.estimatedMinutes} min
                  </small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
