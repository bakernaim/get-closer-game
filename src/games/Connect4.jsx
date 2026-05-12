import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../theme.js'

const ROWS = 6
const COLS = 7

const P = {
  1: theme.connect4.p1,
  2: theme.connect4.p2,
}

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function dropDisc(board, col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      const next = board.map(r => [...r])
      next[row][col] = player
      return { board: next, row }
    }
  }
  return null
}

function checkWin(board, row, col, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]
  for (const [dr, dc] of dirs) {
    let count = 1
    for (const m of [1, -1]) {
      let r = row + dr * m, c = col + dc * m
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++; r += dr * m; c += dc * m
      }
    }
    if (count >= 4) return true
  }
  return false
}

function getWinningCells(board) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const p = board[row][col]
      if (!p) continue
      for (const [dr, dc] of dirs) {
        const cells = [[row, col]]
        for (let i = 1; i < 4; i++) {
          const r = row + dr * i, c = col + dc * i
          if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== p) break
          cells.push([r, c])
        }
        if (cells.length === 4) return cells
      }
    }
  }
  return []
}

// Victory fanfare — ascending arpeggio + chord bloom
function playWin() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime
    // Rising arpeggio
    ;[392, 523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      const s = t + i * 0.1
      osc.frequency.setValueAtTime(freq, s)
      gain.gain.setValueAtTime(0, s)
      gain.gain.linearRampToValueAtTime(0.28, s + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, s + 0.6)
      osc.start(s); osc.stop(s + 0.65)
    })
    // Final chord bloom
    ;[523, 659, 784].forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      const s = t + 0.55
      osc.frequency.setValueAtTime(freq * 2, s)
      gain.gain.setValueAtTime(0.16, s)
      gain.gain.exponentialRampToValueAtTime(0.001, s + 1.1)
      osc.start(s); osc.stop(s + 1.2)
    })
    setTimeout(() => ctx.close(), 2500)
  } catch (_) {}
}

// Slide + thud sound when dropping a disc
function playDrop() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime
    // Sliding sweep: disc sliding down the column
    const osc = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc.connect(g1); g1.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(900, t)
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.2)
    g1.gain.setValueAtTime(0.1, t)
    g1.gain.linearRampToValueAtTime(0, t + 0.2)
    osc.start(t); osc.stop(t + 0.2)
    // Landing thud: lowpass-filtered noise burst
    const len = Math.floor(ctx.sampleRate * 0.12)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'; lp.frequency.value = 360; lp.Q.value = 1.2
    const g2 = ctx.createGain()
    g2.gain.setValueAtTime(0.85, t + 0.18)
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
    src.connect(lp); lp.connect(g2); g2.connect(ctx.destination)
    src.start(t + 0.18); src.stop(t + 0.34)
    src.onended = () => ctx.close()
  } catch (_) {}
}

function isBoardFull(board) {
  return board[0].every(cell => cell !== 0)
}

function getLowestEmptyRow(board, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row
  }
  return -1
}

// Falling confetti particles
function WinParticles({ color }) {
  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 10 + 5,
      delay: Math.random() * 1.2,
      duration: Math.random() * 2 + 1.8,
      drift: (Math.random() - 0.5) * 120,
      hue: [color, '#FFFFFF', '#E8A840', '#FFD6DF', color][i % 5],
      shape: i % 3 === 0 ? '3px' : '50%',
      rotate: Math.random() * 360,
    }))
  , [color])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 60 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width: p.size, height: p.size,
            borderRadius: p.shape,
            backgroundColor: p.hue,
            left: `${p.x}%`,
            top: -20,
          }}
          initial={{ y: -20, opacity: 1, rotate: p.rotate, x: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 60 : 900,
            opacity: [1, 1, 1, 0],
            rotate: p.rotate + 360 * (Math.random() > 0.5 ? 1 : -1),
            x: p.drift,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
            repeat: Infinity,
            repeatDelay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}

// Win celebration overlay
function WinOverlay({ winner, scores, onPlayAgain }) {
  const isDraw = winner === 0
  const color = isDraw ? '#9B7B6B' : P[winner].disc

  return (
    <>
      {!isDraw && <WinParticles color={P[winner].disc} />}

      <motion.div
        className="fixed inset-0 flex items-center justify-center px-6"
        style={{ zIndex: 55 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: isDraw
              ? 'rgba(10,5,8,0.85)'
              : `radial-gradient(ellipse at 50% 40%, ${P[winner].glow.replace('0.7','0.25')} 0%, rgba(10,5,8,0.88) 60%)`,
            backdropFilter: 'blur(12px)',
          }}
        />

        {/* Card */}
        <motion.div
          className="relative rounded-3xl p-8 w-full max-w-xs text-center"
          style={{
            background: isDraw
              ? 'linear-gradient(160deg, #1E1418 0%, #160C10 100%)'
              : `linear-gradient(160deg, ${P[winner].dim.replace('0.15','0.25')} 0%, #160C10 100%)`,
            border: `1px solid ${isDraw ? 'rgba(255,255,255,0.08)' : P[winner].disc + '40'}`,
            boxShadow: isDraw
              ? '0 24px 80px rgba(0,0,0,0.6)'
              : `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${P[winner].glow.replace('0.7','0.2')}`,
          }}
          initial={{ scale: 0.7, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
        >
          {/* Icon */}
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.25 }}
            style={{ filter: isDraw ? 'none' : `drop-shadow(0 0 20px ${P[winner].disc})` }}
          >
            {isDraw ? '🤝' : '🏆'}
          </motion.div>

          {/* Title */}
          <motion.h2
            className="font-serif mb-1"
            style={{ color: isDraw ? '#C8B0A8' : P[winner].disc, fontSize: '1.8rem', lineHeight: 1.1 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {isDraw ? "It's a Draw!" : `Player ${winner} Wins!`}
          </motion.h2>

          {!isDraw && (
            <motion.p
              className="text-sm mb-6"
              style={{ color: 'rgba(200,175,165,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {P[winner].label} takes the point
            </motion.p>
          )}
          {isDraw && <div className="mb-6" />}

          {/* Scores */}
          <motion.div
            className="flex gap-3 mb-7"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[1, 2].map(p => (
              <div
                key={p}
                className="flex-1 rounded-2xl py-3"
                style={{
                  background: p === winner && !isDraw ? P[p].dim : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${p === winner && !isDraw ? P[p].disc + '40' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full mx-auto mb-1.5"
                  style={{ backgroundColor: P[p].disc, boxShadow: `0 2px 8px ${P[p].shadow}` }}
                />
                <div className="text-2xl font-serif font-bold" style={{ color: p === winner && !isDraw ? P[p].disc : '#C8B0A8' }}>
                  {scores[p]}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Play Again */}
          <motion.button
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white"
            style={{
              background: isDraw
                ? 'linear-gradient(135deg, #6A4A5A 0%, #4A2A3A 100%)'
                : `linear-gradient(135deg, ${P[winner].disc} 0%, ${P[winner].disc}AA 100%)`,
              boxShadow: isDraw
                ? '0 8px 24px rgba(80,40,60,0.4)'
                : `0 8px 28px ${P[winner].shadow}`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Play Again
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  )
}

export default function Connect4({ onBack }) {
  const [board, setBoard] = useState(createBoard)
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [winner, setWinner] = useState(null)
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [winCells, setWinCells] = useState([])
  const [hoverCol, setHoverCol] = useState(null)
  const [lastDrop, setLastDrop] = useState(null)

  const isOver = winner !== null

  const handleColClick = useCallback((col) => {
    if (isOver || board[0][col] !== 0) return
    const result = dropDisc(board, col, currentPlayer)
    if (!result) return
    const { board: newBoard, row } = result
    playDrop()
    setBoard(newBoard)
    setLastDrop({ row, col })
    if (checkWin(newBoard, row, col, currentPlayer)) {
      playWin()
      setWinner(currentPlayer)
      setWinCells(getWinningCells(newBoard))
      setScores(s => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }))
    } else if (isBoardFull(newBoard)) {
      setWinner(0)
    } else {
      setCurrentPlayer(p => p === 1 ? 2 : 1)
    }
  }, [board, currentPlayer, isOver])

  const resetGame = () => {
    setBoard(createBoard())
    setCurrentPlayer(1)
    setWinner(null)
    setWinCells([])
    setLastDrop(null)
    setHoverCol(null)
  }

  const isWinCell = (row, col) => winCells.some(([r, c]) => r === row && c === col)

  return (
    <div
      className="min-h-screen flex flex-col"
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl"
          style={{ color: theme.app.textSub, backgroundColor: theme.app.pill, border: `1px solid ${theme.app.border}` }}
          whileHover={{ backgroundColor: 'rgba(140,100,200,0.15)' }}
          whileTap={{ scale: 0.97 }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Home
        </motion.button>

        <h1 className="font-serif text-xl" style={{ color: theme.app.text }}>Connect 4</h1>

        <motion.button
          onClick={() => { resetGame(); setScores({ 1: 0, 2: 0 }) }}
          className="text-xs font-medium px-3.5 py-2 rounded-xl"
          style={{ color: theme.app.textMuted, backgroundColor: theme.app.pill, border: `1px solid ${theme.app.border}` }}
          whileHover={{ backgroundColor: 'rgba(140,100,200,0.15)' }}
          whileTap={{ scale: 0.97 }}
        >
          Reset
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center px-3 py-4 gap-4">
        {/* Score Board */}
        <div className="w-full flex gap-3" style={{ maxWidth: 480 }}>
          {[1, 2].map(p => (
            <motion.div
              key={p}
              className="flex-1 rounded-2xl p-3.5 flex flex-col items-center gap-1"
              style={{
                background: currentPlayer === p && !isOver
                  ? `linear-gradient(135deg, ${P[p].dim} 0%, rgba(255,255,255,0.85) 100%)`
                  : 'rgba(255,255,255,0.65)',
                border: `1px solid ${currentPlayer === p && !isOver ? P[p].disc + '60' : theme.app.border}`,
                transition: 'all 0.3s ease',
                boxShadow: currentPlayer === p && !isOver ? `0 4px 20px ${P[p].shadow.replace('0.45','0.22')}` : '0 1px 4px rgba(100,60,80,0.06)',
                backdropFilter: 'blur(8px)',
              }}
              animate={currentPlayer === p && !isOver ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-8 h-8 rounded-full"
                style={{
                  backgroundColor: P[p].disc,
                  boxShadow: currentPlayer === p && !isOver ? `0 4px 16px ${P[p].shadow}, 0 0 20px ${P[p].glow.replace('0.7','0.4')}` : `0 2px 8px ${P[p].shadow}`,
                }}
                animate={currentPlayer === p && !isOver ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-xs font-medium" style={{ color: theme.app.textMuted }}>
                Player {p}
              </span>
              <span className="text-2xl font-semibold font-serif" style={{ color: currentPlayer === p && !isOver ? P[p].disc : theme.app.textSub }}>
                {scores[p]}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Turn indicator */}
        <AnimatePresence mode="wait">
          {!isOver && (
            <motion.div
              key={`turn-${currentPlayer}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: P[currentPlayer].dim,
                color: P[currentPlayer].disc,
                border: `1px solid ${P[currentPlayer].disc}30`,
              }}
              initial={{ opacity: 0, scale: 0.85, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 6 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: P[currentPlayer].disc, boxShadow: `0 0 8px ${P[currentPlayer].glow}` }}
              />
              Player {currentPlayer}'s turn
            </motion.div>
          )}
        </AnimatePresence>

        {/* Board */}
        <div
          className="rounded-3xl select-none"
          style={{
            '--cell': 'min(calc((100vw - 96px) / 7), 90px)',
            width: '100%',
            maxWidth: 700,
            padding: '12px',
            background: theme.connect4.boardBg,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Column hover preview */}
          <div className="flex gap-2 mb-2">
            {Array.from({ length: COLS }, (_, col) => (
              <div key={col} className="flex justify-center items-center" style={{ width: 'var(--cell)', height: 'calc(var(--cell) * 0.38)' }}>
                <AnimatePresence>
                  {hoverCol === col && !isOver && board[0][col] === 0 && (
                    <motion.div
                      className="rounded-full"
                      style={{
                        width: 'calc(var(--cell) * 0.38)',
                        aspectRatio: '1',
                        backgroundColor: P[currentPlayer].disc,
                        boxShadow: `0 0 10px ${P[currentPlayer].glow}`,
                      }}
                      initial={{ opacity: 0, y: -8, scale: 0.6 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.6 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col gap-2">
            {board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-2">
                {row.map((cell, colIdx) => {
                  const winning = isWinCell(rowIdx, colIdx)
                  const isNew = lastDrop?.row === rowIdx && lastDrop?.col === colIdx
                  const previewRow = hoverCol === colIdx && !isOver ? getLowestEmptyRow(board, colIdx) : -1
                  const isPreview = previewRow === rowIdx

                  return (
                    <motion.div
                      key={colIdx}
                      className="rounded-full cursor-pointer"
                      style={{
                        width: 'var(--cell)',
                        aspectRatio: '1',
                        backgroundColor: cell === 0
                          ? isPreview ? P[currentPlayer].disc + '28' : 'rgba(255,255,255,0.07)'
                          : P[cell].disc,
                        boxShadow: winning
                          ? `0 0 0 3px white, 0 0 20px ${P[cell].glow}, 0 0 40px ${P[cell].disc}60`
                          : cell !== 0
                            ? `0 3px 12px ${P[cell].shadow}, inset 0 1px 0 rgba(255,255,255,0.25)`
                            : 'inset 0 2px 6px rgba(0,0,0,0.4)',
                        transition: 'background-color 0.12s ease',
                      }}
                      onClick={() => handleColClick(colIdx)}
                      onMouseEnter={() => setHoverCol(colIdx)}
                      onMouseLeave={() => setHoverCol(null)}
                      initial={isNew ? { y: -500, scaleY: 0.8 } : false}
                      animate={
                        isNew
                          ? { y: 0, scaleY: [0.8, 1.08, 0.96, 1] }
                          : winning
                            ? { scale: [1, 1.18, 1], boxShadow: [
                                `0 0 0 3px white, 0 0 20px ${P[cell].glow}`,
                                `0 0 0 4px white, 0 0 40px ${P[cell].glow}, 0 0 60px ${P[cell].disc}80`,
                                `0 0 0 3px white, 0 0 20px ${P[cell].glow}`,
                              ]}
                            : {}
                      }
                      transition={
                        isNew
                          ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                          : winning
                            ? { duration: 0.8, repeat: Infinity, repeatDelay: 0.4, delay: winCells.findIndex(([r,c]) => r===rowIdx && c===colIdx) * 0.08 }
                            : {}
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Overlay */}
      <AnimatePresence>
        {isOver && (
          <WinOverlay
            winner={winner}
            scores={scores}
            onPlayAgain={resetGame}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
