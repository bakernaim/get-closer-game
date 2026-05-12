import { motion, AnimatePresence } from 'framer-motion'
import { TOPICS, TOPIC_ORDER, QUICK_FILTERS } from '../data/questions.js'
import { theme } from '../theme.js'

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
}

const tileVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function TopicSelection({
  state,
  toggleTopic,
  selectAll,
  deselectAll,
  applyFilter,
  startGame,
  resumeGame,
  dismissResume,
  totalQuestionsSelected,
  onBack,
}) {
  const canStart = state.selectedTopics.length > 0

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* Back to Home */}
      {onBack && (
        <motion.button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium mb-6"
          style={{ color: theme.app.textSub }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Home
        </motion.button>
      )}

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-4xl mb-3">💕</div>
        <h1
          className="font-serif text-4xl mb-2"
          style={{ color: theme.app.text }}
        >
          Let's Get Closer
        </h1>
        <p
          className="text-base"
          style={{ color: theme.app.textSub }}
        >
          Choose the topics you'd like to explore together
        </p>
      </motion.div>

      {/* Quick Filters */}
      <motion.div
        className="flex gap-2 justify-center mb-6 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {Object.entries(QUICK_FILTERS).map(([key, filter]) => (
          <motion.button
            key={key}
            onClick={() => applyFilter(filter.topicIds)}
            className="px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors"
            style={{
              borderColor: theme.app.borderStrong,
              backgroundColor: 'white',
              color: theme.app.textSub,
            }}
            whileHover={{ scale: 1.04, backgroundColor: theme.app.accentLight }}
            whileTap={{ scale: 0.97 }}
          >
            {filter.icon} {filter.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Select Controls */}
      <motion.div
        className="flex items-center justify-between mb-4 px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex gap-3">
          <button
            onClick={selectAll}
            className="text-sm font-medium underline"
            style={{ color: theme.app.textMuted }}
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="text-sm font-medium underline"
            style={{ color: theme.app.textMuted }}
          >
            Deselect All
          </button>
        </div>
        <span className="text-sm" style={{ color: theme.app.textMuted }}>
          <span className="font-semibold" style={{ color: theme.app.text }}>{totalQuestionsSelected}</span> questions selected
        </span>
      </motion.div>

      {/* Topic Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {TOPIC_ORDER.map(topicId => {
          const topic = TOPICS[topicId]
          const isSelected = state.selectedTopics.includes(topicId)
          return (
            <motion.div
              key={topicId}
              variants={tileVariants}
              onClick={() => toggleTopic(topicId)}
              className="relative rounded-2xl p-4 cursor-pointer select-none"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${topic.color}50 0%, ${topic.color}25 100%)`
                  : 'white',
                border: `2px solid ${isSelected ? topic.color : theme.app.border}`,
                boxShadow: isSelected
                  ? `0 4px 20px ${topic.color}45`
                  : '0 1px 4px rgba(100,60,80,0.06)',
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Checkbox */}
              <div
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border-2"
                style={{
                  borderColor: isSelected ? topic.colorDark : 'rgba(120,90,160,0.25)',
                  backgroundColor: isSelected ? topic.color : 'transparent',
                }}
              >
                {isSelected && (
                  <motion.svg
                    width="10" height="8" viewBox="0 0 10 8" fill="none"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <path d="M1 4L3.5 6.5L9 1" stroke={topic.colorText} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                )}
              </div>

              {/* Icon */}
              <div className="text-2xl mb-2">{topic.icon}</div>

              {/* Name */}
              <div
                className="font-semibold text-sm mb-0.5"
                style={{ color: isSelected ? topic.colorText : theme.app.text }}
              >
                {topic.name}
              </div>

              {/* Description */}
              <div className="text-xs" style={{ color: theme.app.textSub }}>
                {topic.description}
              </div>

              {/* Question count */}
              <div
                className="text-xs mt-1 font-medium"
                style={{ color: isSelected ? topic.colorDark : theme.app.textMuted }}
              >
                {topic.questions.length} questions
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Start Button */}
      <motion.div
        className="sticky bottom-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={startGame}
          disabled={!canStart}
          className="w-full py-4 rounded-2xl font-semibold text-lg transition-all"
          style={{
            background: canStart
              ? `linear-gradient(135deg, ${theme.app.accentBright} 0%, ${theme.app.accent} 100%)`
              : 'rgba(120,90,150,0.1)',
            color: canStart ? 'white' : theme.app.textMuted,
            boxShadow: canStart ? theme.app.accentGlow : 'none',
            cursor: canStart ? 'pointer' : 'not-allowed',
          }}
          whileHover={canStart ? { scale: 1.02, boxShadow: '0 14px 36px rgba(217,64,120,0.50)' } : {}}
          whileTap={canStart ? { scale: 0.98 } : {}}
        >
          {canStart ? `Start Drawing · ${totalQuestionsSelected} cards` : 'Select at least one topic'}
        </motion.button>
      </motion.div>

      {/* Resume Prompt Modal */}
      <AnimatePresence>
        {state.showResumePrompt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(61, 44, 44, 0.3)' }}
              onClick={dismissResume}
            />
            <motion.div
              className="relative rounded-3xl p-8 w-full max-w-sm card-shadow"
              style={{ backgroundColor: 'white' }}
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="text-3xl mb-4 text-center">✨</div>
              <h2
                className="font-serif text-2xl text-center mb-2"
                style={{ color: theme.app.text }}
              >
                Welcome back!
              </h2>
              <p className="text-center text-sm mb-6" style={{ color: theme.app.textSub }}>
                You have an unfinished game. Would you like to continue where you left off?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={dismissResume}
                  className="flex-1 py-3 rounded-xl font-medium text-sm border-2"
                  style={{ borderColor: theme.app.border, color: theme.app.textSub }}
                >
                  Start Fresh
                </button>
                <motion.button
                  onClick={resumeGame}
                  className="flex-1 py-3 rounded-xl font-medium text-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${theme.app.accentBright} 0%, ${theme.app.accent} 100%)`, boxShadow: theme.app.accentGlow }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Resume Game
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
