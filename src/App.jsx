import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState.js'
import Home from './pages/Home.jsx'
import TopicSelection from './components/TopicSelection.jsx'
import GameBoard from './components/GameBoard.jsx'
import SavedCards from './components/SavedCards.jsx'
import Connect4 from './games/Connect4.jsx'
import Dama from './games/Dama.jsx'

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
  const [activeGame, setActiveGame] = useState(null) // null=home, 'getCloser', 'connect4'
  const game = useGameState()
  const { state } = game

  const handleSelectGame = (gameId) => {
    setActiveGame(gameId)
    if (gameId === 'getCloser') {
      game.gotoScreen('topics')
    }
  }

  const handleBackToHome = () => {
    setActiveGame(null)
  }

  return (
    <div className="ambient-bg min-h-screen">
      <AnimatePresence mode="wait">
        {activeGame === null && (
          <motion.div key="home" {...screenVariants} className="min-h-screen">
            <Home onSelectGame={handleSelectGame} />
          </motion.div>
        )}

        {activeGame === 'getCloser' && state.screen === 'topics' && (
          <motion.div key="topics" {...screenVariants} className="min-h-screen">
            <TopicSelection {...game} onBack={handleBackToHome} />
          </motion.div>
        )}
        {activeGame === 'getCloser' && state.screen === 'game' && (
          <motion.div key="game" {...screenVariants} className="min-h-screen">
            <GameBoard {...game} />
          </motion.div>
        )}
        {activeGame === 'getCloser' && state.screen === 'saved' && (
          <motion.div key="saved" {...screenVariants} className="min-h-screen">
            <SavedCards {...game} />
          </motion.div>
        )}

        {activeGame === 'connect4' && (
          <motion.div key="connect4" {...screenVariants} className="min-h-screen">
            <Connect4 onBack={handleBackToHome} />
          </motion.div>
        )}

        {activeGame === 'dama' && (
          <motion.div key="dama" {...screenVariants} className="min-h-screen">
            <Dama onBack={handleBackToHome} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
