import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState.js'
import TopicSelection from './components/TopicSelection.jsx'
import GameBoard from './components/GameBoard.jsx'
import SavedCards from './components/SavedCards.jsx'

const screenVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: [0.55, 0.055, 0.675, 0.19] },
  },
}

export default function App() {
  const game = useGameState()
  const { state } = game

  return (
    <div className="ambient-bg min-h-screen">
      <AnimatePresence mode="wait">
        {state.screen === 'topics' && (
          <motion.div key="topics" {...screenVariants} className="min-h-screen">
            <TopicSelection {...game} />
          </motion.div>
        )}
        {state.screen === 'game' && (
          <motion.div key="game" {...screenVariants} className="min-h-screen">
            <GameBoard {...game} />
          </motion.div>
        )}
        {state.screen === 'saved' && (
          <motion.div key="saved" {...screenVariants} className="min-h-screen">
            <SavedCards {...game} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
