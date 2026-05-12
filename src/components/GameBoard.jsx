import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../theme.js'
import Card from './Card.jsx'
import DeckStack from './DeckStack.jsx'
import CardHistory from './CardHistory.jsx'
import ConfettiEffect from './ConfettiEffect.jsx'
import StatsModal from './StatsModal.jsx'
import { TOPICS, TOPIC_ORDER } from '../data/questions.js'

const cardVariants = {
  initial: (direction) => ({
    x: direction === 'left' ? -280 : 280,
    y: 60,
    rotate: direction === 'left' ? -12 : 12,
    opacity: 0,
    scale: 0.85,
  }),
  animate: {
    x: 0, y: 0, rotate: 0, opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 180, damping: 22, mass: 0.9 },
  },
  exit: (direction) => ({
    x: direction === 'left' ? -320 : 320,
    y: direction === 'left' ? 40 : -40,
    rotate: direction === 'left' ? -18 : 18,
    opacity: 0, scale: 0.82,
    transition: { duration: 0.38, ease: [0.4, 0, 0.6, 1] },
  }),
}

// Topic picker bottom sheet
function TopicPicker({ activeTopics, topicDecks, onSelect, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(40,24,60,0.25)' }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Sheet */}
      <motion.div
        className="relative rounded-t-3xl px-5 pt-5 pb-8"
        style={{ backgroundColor: 'white', maxHeight: '75vh', overflowY: 'auto' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: theme.app.border }} />

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl" style={{ color: theme.app.text }}>
            Pick a category
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.app.pill, color: theme.app.textSub }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {activeTopics.map((id, i) => {
            const topic = TOPICS[id]
            const remaining = topicDecks[id]?.length ?? 0
            const isEmpty = remaining === 0

            return (
              <motion.button
                key={id}
                onClick={() => !isEmpty && onSelect(id)}
                disabled={isEmpty}
                className="relative rounded-2xl p-4 text-left overflow-hidden"
                style={{
                  background: isEmpty
                    ? '#F5F3F0'
                    : `linear-gradient(135deg, ${topic.color}50 0%, ${topic.color}25 100%)`,
                  border: `1.5px solid ${isEmpty ? '#E8E4E0' : topic.color + '80'}`,
                  opacity: isEmpty ? 0.4 : 1,
                  cursor: isEmpty ? 'not-allowed' : 'pointer',
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isEmpty ? 0.45 : 1, y: 0 }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 24 }}
                whileHover={!isEmpty ? { scale: 1.03, y: -2 } : {}}
                whileTap={!isEmpty ? { scale: 0.97 } : {}}
              >
                {/* Background illustration hint */}
                <div className="absolute bottom-0 right-0 text-2xl opacity-15 p-1">
                  {topic.icon}
                </div>

                <div className="text-xl mb-1.5">{topic.icon}</div>
                <div
                  className="font-semibold text-sm leading-tight mb-1"
                  style={{ color: isEmpty ? '#BBA898' : theme.app.text }}
                >
                  {topic.name}
                </div>
                <div
                  className="text-xs font-medium"
                  style={{ color: isEmpty ? '#C8B8B0' : topic.colorDark }}
                >
                  {isEmpty ? 'All done' : `${remaining} left`}
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function GameBoard({
  state,
  drawCard,
  skipCard,
  saveCard,
  unsaveCard,
  clearMilestone,
  gotoScreen,
  isCardSaved,
  stats,
  toggleStats,
  totalRemaining,
}) {
  const [exitDirection, setExitDirection] = useState('right')
  const [cardFlipped, setCardFlipped] = useState(false)
  const [showTopicPicker, setShowTopicPicker] = useState(false)

  // Flip card 200ms after it arrives
  useEffect(() => {
    setCardFlipped(false)
    if (state.currentCard) {
      const t = setTimeout(() => setCardFlipped(true), 200)
      return () => clearTimeout(t)
    }
  }, [state.cardKey])

  // Auto-dismiss milestone after 2.5s
  useEffect(() => {
    if (state.activeMilestone) {
      const t = setTimeout(clearMilestone, 2500)
      return () => clearTimeout(t)
    }
  }, [state.activeMilestone])

  const handleDrawClick = () => {
    setShowTopicPicker(true)
  }

  const handleTopicSelect = (topicId) => {
    setExitDirection('right')
    setShowTopicPicker(false)
    drawCard(topicId)
  }

  const handleSkip = () => {
    setExitDirection('left')
    skipCard()
  }

  const handleSave = () => {
    if (state.currentCard && isCardSaved(state.currentCard.id)) {
      unsaveCard(state.currentCard.id)
    } else {
      saveCard()
    }
  }

  const isCurrentSaved = state.currentCard ? isCardSaved(state.currentCard.id) : false
  const totalInSession = totalRemaining + state.totalDrawn
  const isDeckEmpty = totalRemaining === 0 && !state.currentCard

  const activeTopics = TOPIC_ORDER.filter(id =>
    state.selectedTopics.includes(id) && TOPICS[id]
  )

  const hasAnyRemaining = totalRemaining > 0

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'transparent' }}>
      {/* Header */}
      <div
        className="px-4 pt-5 pb-3 flex items-start justify-between gap-3"
        style={{ borderBottom: `1px solid ${theme.app.border}` }}
      >
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <button
            onClick={() => gotoScreen('topics')}
            className="flex items-center gap-1.5 text-sm font-medium w-fit"
            style={{ color: theme.app.textSub }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Topics
          </button>
          {/* Active topic pills — color coded, show remaining */}
          <div className="flex gap-1.5 flex-wrap">
            {activeTopics.slice(0, 5).map(id => {
              const remaining = state.topicDecks[id]?.length ?? 0
              const isEmpty = remaining === 0
              return (
                <div
                  key={id}
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: isEmpty ? '#F0EDE8' : TOPICS[id].color + '38',
                    color: isEmpty ? '#BBA898' : TOPICS[id].colorText,
                    textDecoration: isEmpty ? 'line-through' : 'none',
                  }}
                >
                  {TOPICS[id].icon} {remaining > 0 ? remaining : '✓'}
                </div>
              )
            })}
            {activeTopics.length > 5 && (
              <div className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: theme.app.pill, color: theme.app.textSub }}>
                +{activeTopics.length - 5}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-sm font-medium">
            <span className="font-semibold" style={{ color: theme.app.accent }}>{state.totalDrawn}</span>
            <span style={{ color: theme.app.textMuted }}>/{totalInSession} drawn</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => gotoScreen('saved')}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl"
              style={{ backgroundColor: theme.app.accentLight, color: theme.app.accent }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 11.5C6.5 11.5 1 8.2 1 4.5C1 2.8 2.3 1.5 4 1.5C5.1 1.5 5.9 2.1 6.5 2.8C7.1 2.1 7.9 1.5 9 1.5C10.7 1.5 12 2.8 12 4.5C12 8.2 6.5 11.5 6.5 11.5Z"
                      stroke="currentColor" strokeWidth="1.2" fill={state.savedCards?.length > 0 ? 'currentColor' : 'none'} />
              </svg>
              {state.savedCards?.length ?? 0}
            </button>
            <button
              onClick={toggleStats}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl"
              style={{ backgroundColor: theme.app.pill, color: theme.app.textSub }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="7" width="3" height="5" rx="1" fill="currentColor" />
                <rect x="5" y="4" width="3" height="8" rx="1" fill="currentColor" />
                <rect x="9" y="1.5" width="3" height="10.5" rx="1" fill="currentColor" />
              </svg>
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Main card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">

        {/* Card + Deck Stack */}
        <div className="relative mb-12" style={{ width: '300px', height: '420px' }}>
          {/* Deck stack behind */}
          {hasAnyRemaining && (
            <div className="absolute inset-0">
              <DeckStack remaining={totalRemaining} total={totalInSession} />
            </div>
          )}

          {/* Current card with animation */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
            <AnimatePresence mode="popLayout" custom={exitDirection}>
              {state.currentCard ? (
                <motion.div
                  key={state.cardKey}
                  custom={exitDirection}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Card card={state.currentCard} isFlipped={cardFlipped} />
                </motion.div>
              ) : !isDeckEmpty ? (
                // No current card yet — show face-down deck, tap to pick topic
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <motion.div
                    className="rounded-3xl card-shadow cursor-pointer flex flex-col items-center justify-center"
                    style={{
                      width: '300px',
                      height: '420px',
                      background: 'linear-gradient(150deg, #F5E6D3 0%, #E8D5C4 50%, #DCC9B8 100%)',
                    }}
                    whileHover={{ scale: 1.02, y: -6, boxShadow: '0 32px 80px rgba(0,0,0,0.55)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDrawClick}
                  >
                    <div className="text-5xl mb-3 opacity-50">💕</div>
                    <p className="font-serif italic text-lg opacity-40" style={{ color: '#8B5E52' }}>
                      Tap to choose a category
                    </p>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* All done */}
          {isDeckEmpty && state.totalDrawn > 0 && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="text-5xl mb-4">✨</div>
              <h2 className="font-serif text-3xl mb-2" style={{ color: theme.app.accent }}>All done!</h2>
              <p className="text-sm mb-6" style={{ color: theme.app.textSub }}>
                You drew {state.totalDrawn} card{state.totalDrawn !== 1 ? 's' : ''} together
              </p>
              <motion.button
                onClick={() => gotoScreen('topics')}
                className="px-8 py-3 rounded-2xl text-white font-semibold"
                style={{ background: `linear-gradient(135deg, ${theme.app.accentBright} 0%, ${theme.app.accent} 100%)`, boxShadow: theme.app.accentGlow }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        {!isDeckEmpty && (
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Skip — only visible when a card is showing */}
            <motion.button
              onClick={handleSkip}
              disabled={!state.currentCard}
              className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl"
              style={{
                backgroundColor: state.currentCard ? theme.app.pill : 'rgba(120,90,160,0.05)',
                color: state.currentCard ? theme.app.textSub : theme.app.textMuted,
              }}
              whileHover={state.currentCard ? { scale: 1.04, backgroundColor: 'rgba(120,90,160,0.14)' } : {}}
              whileTap={state.currentCard ? { scale: 0.97 } : {}}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10H15M15 10L11 6M15 10L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium">Skip</span>
            </motion.button>

            {/* Draw / Choose Category — main CTA */}
            <motion.button
              onClick={handleDrawClick}
              disabled={!hasAnyRemaining}
              className="flex flex-col items-center gap-1 px-8 py-3.5 rounded-2xl font-semibold"
              style={{
                background: hasAnyRemaining
                  ? `linear-gradient(135deg, ${theme.app.accentBright} 0%, ${theme.app.accent} 100%)`
                  : 'rgba(120,90,160,0.08)',
                color: hasAnyRemaining ? 'white' : theme.app.textMuted,
                boxShadow: hasAnyRemaining ? theme.app.accentGlow : 'none',
              }}
              whileHover={hasAnyRemaining ? { scale: 1.04, y: -2 } : {}}
              whileTap={hasAnyRemaining ? { scale: 0.97 } : {}}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="4" width="14" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <rect x="5" y="2" width="14" height="18" rx="3" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12L11 14L14 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">
                {state.currentCard ? 'Draw Next' : 'Choose Category'}
              </span>
            </motion.button>

            {/* Save/Heart */}
            <motion.button
              onClick={handleSave}
              disabled={!state.currentCard}
              className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl"
              style={{
                backgroundColor: isCurrentSaved ? theme.app.accentLight : (state.currentCard ? theme.app.pill : 'rgba(120,90,160,0.05)'),
                color: isCurrentSaved ? theme.app.accent : (state.currentCard ? theme.app.textSub : theme.app.textMuted),
              }}
              whileHover={state.currentCard ? { scale: 1.04 } : {}}
              whileTap={state.currentCard ? { scale: 0.97 } : {}}
            >
              <motion.svg
                width="20" height="20" viewBox="0 0 20 20" fill="none"
                animate={isCurrentSaved ? { scale: [1, 1.35, 1] } : {}}
                transition={{ duration: 0.35 }}
              >
                <path d="M10 17C10 17 2.5 12.8 2.5 7.5C2.5 5.2 4.3 3.5 6.5 3.5C8 3.5 9.2 4.3 10 5.3C10.8 4.3 12 3.5 13.5 3.5C15.7 3.5 17.5 5.2 17.5 7.5C17.5 12.8 10 17 10 17Z"
                      stroke="currentColor" strokeWidth="1.5"
                      fill={isCurrentSaved ? 'currentColor' : 'none'} />
              </motion.svg>
              <span className="text-xs font-medium">{isCurrentSaved ? 'Saved' : 'Save'}</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Card History */}
      {state.drawnCards.length > 0 && (
        <CardHistory cards={state.drawnCards.slice(0, 10)} />
      )}

      {/* Confetti */}
      <ConfettiEffect milestone={state.activeMilestone} />

      {/* Stats Modal */}
      {state.showStatsModal && (
        <StatsModal stats={stats} onClose={toggleStats} />
      )}

      {/* Topic Picker Sheet */}
      <AnimatePresence>
        {showTopicPicker && (
          <TopicPicker
            activeTopics={activeTopics}
            topicDecks={state.topicDecks}
            onSelect={handleTopicSelect}
            onClose={() => setShowTopicPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
