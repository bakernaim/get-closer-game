import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TOPICS, TOPIC_ORDER } from '../data/questions.js'
import TopicIllustration from './TopicIllustration.jsx'

export default function SavedCards({ state, unsaveCard, gotoScreen }) {
  const [filterTopic, setFilterTopic] = useState(null)

  const savedCards = state.savedCards ?? []
  const filteredCards = filterTopic
    ? savedCards.filter(c => c.topicId === filterTopic)
    : savedCards

  // Topics that have saved cards
  const topicsWithSaved = TOPIC_ORDER.filter(id =>
    savedCards.some(c => c.topicId === id)
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
      {/* Header */}
      <div
        className="px-5 pt-6 pb-4"
        style={{ borderBottom: '1px solid rgba(180,120,80,0.08)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => gotoScreen('game')}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: '#9B7B6B' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        </div>
        <h1 className="font-serif text-3xl mb-1" style={{ color: '#3D2C2C' }}>
          Saved Moments
        </h1>
        <p className="text-sm" style={{ color: '#9B7B6B' }}>
          {savedCards.length} card{savedCards.length !== 1 ? 's' : ''} saved
        </p>

        {/* Topic filter pills */}
        {topicsWithSaved.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setFilterTopic(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors"
              style={{
                borderColor: filterTopic === null ? '#C4687A' : '#E8D5C4',
                backgroundColor: filterTopic === null ? '#C4687A' : 'white',
                color: filterTopic === null ? 'white' : '#9B7B6B',
              }}
            >
              All
            </button>
            {topicsWithSaved.map(id => {
              const topic = TOPICS[id]
              const isActive = filterTopic === id
              return (
                <motion.button
                  key={id}
                  onClick={() => setFilterTopic(isActive ? null : id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors"
                  style={{
                    borderColor: isActive ? topic.colorDark : topic.color + '60',
                    backgroundColor: isActive ? topic.color : 'white',
                    color: isActive ? topic.colorText : '#7A5A4A',
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {topic.icon} {topic.name}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Empty state */}
      {savedCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="text-5xl mb-4 opacity-30">💕</div>
          <h2 className="font-serif text-xl mb-2" style={{ color: '#3D2C2C' }}>
            No saved cards yet
          </h2>
          <p className="text-sm mb-6" style={{ color: '#9B7B6B' }}>
            Tap the heart button while drawing cards to save your favorite questions here.
          </p>
          <motion.button
            onClick={() => gotoScreen('game')}
            className="px-6 py-3 rounded-2xl text-white font-medium text-sm"
            style={{ background: 'linear-gradient(135deg, #C4687A 0%, #A04060 100%)' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Go Draw Cards
          </motion.button>
        </div>
      )}

      {/* Card grid */}
      {filteredCards.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-2 gap-3 p-5"
        >
          <AnimatePresence>
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  background: `linear-gradient(150deg, ${card.topicColor}50 0%, ${card.topicColor}25 100%)`,
                  boxShadow: `0 3px 12px ${card.topicColor}30`,
                  minHeight: '160px',
                }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {/* Background illustration */}
                <div className="absolute bottom-0 right-0 w-20 h-20 opacity-20">
                  <TopicIllustration topicId={card.topicId} color={card.topicColor} className="w-full h-full" />
                </div>

                {/* Topic badge */}
                <div
                  className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: card.topicColor, color: card.topicColorText }}
                >
                  {card.topicIcon}
                </div>

                {/* Question */}
                <div className="p-4 pr-8">
                  <p
                    className="font-serif italic text-sm leading-relaxed"
                    style={{ color: '#3D2C2C' }}
                  >
                    "{card.question}"
                  </p>
                </div>

                {/* Unsave button — appears on hover */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); unsaveCard(card.id) }}
                  className="absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#C4687A' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* No results for filter */}
      {filteredCards.length === 0 && savedCards.length > 0 && (
        <div className="text-center py-12" style={{ color: '#9B7B6B' }}>
          No saved cards for this topic
        </div>
      )}
    </div>
  )
}
