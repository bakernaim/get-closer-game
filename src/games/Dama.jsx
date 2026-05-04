import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Sound effects — realistic board piece sounds ─────────────────────────────
function _noise(ctx, durationSec) {
  const len = Math.floor(ctx.sampleRate * durationSec)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  return src
}

// Light wooden tap — piece placed on board
function playMove() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime
    const src = _noise(ctx, 0.08)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'; bp.frequency.value = 950; bp.Q.value = 2.8
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.55, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065)
    src.connect(bp); bp.connect(gain); gain.connect(ctx.destination)
    src.start(t); src.stop(t + 0.09)
    src.onended = () => ctx.close()
  } catch (_) {}
}

// Hard thud + secondary crack — piece captured
function playCapture() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime
    // Primary deep thud
    const src1 = _noise(ctx, 0.14)
    const bp1 = ctx.createBiquadFilter()
    bp1.type = 'bandpass'; bp1.frequency.value = 480; bp1.Q.value = 1.6
    const g1 = ctx.createGain()
    g1.gain.setValueAtTime(1.0, t)
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.13)
    src1.connect(bp1); bp1.connect(g1); g1.connect(ctx.destination)
    src1.start(t); src1.stop(t + 0.15)
    // Secondary crack (captured piece bouncing)
    const src2 = _noise(ctx, 0.06)
    const bp2 = ctx.createBiquadFilter()
    bp2.type = 'bandpass'; bp2.frequency.value = 1400; bp2.Q.value = 3.5
    const g2 = ctx.createGain()
    g2.gain.setValueAtTime(0.45, t + 0.07)
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
    src2.connect(bp2); bp2.connect(g2); g2.connect(ctx.destination)
    src2.start(t + 0.07); src2.stop(t + 0.15)
    src1.onended = () => ctx.close()
  } catch (_) {}
}

// Victory — party horn blast (sawtooth + vibrato + bandpass, staggered horns)
function playWin() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime

    function horn(freq, delay, dur, vol) {
      const s = t + delay
      // Two detuned sawtooth oscillators for thickness
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      osc1.type = osc2.type = 'sawtooth'
      // Pitch bend up on attack — the "tooting" blow
      osc1.frequency.setValueAtTime(freq * 0.86, s)
      osc1.frequency.exponentialRampToValueAtTime(freq, s + 0.06)
      osc2.frequency.setValueAtTime(freq * 0.86 * 1.02, s)
      osc2.frequency.exponentialRampToValueAtTime(freq * 1.02, s + 0.06)
      // Vibrato LFO
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 5.5
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = freq * 0.014
      lfo.connect(lfoGain)
      lfoGain.connect(osc1.frequency)
      lfoGain.connect(osc2.frequency)
      // Bandpass filter — nasal party-horn character
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'; bp.frequency.value = freq * 1.6; bp.Q.value = 1.1
      // Gain envelope
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, s)
      gain.gain.linearRampToValueAtTime(vol, s + 0.05)
      gain.gain.setValueAtTime(vol * 0.8, s + dur - 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, s + dur)
      osc1.connect(bp); osc2.connect(bp); bp.connect(gain); gain.connect(ctx.destination)
      lfo.start(s); lfo.stop(s + dur + 0.05)
      osc1.start(s); osc1.stop(s + dur + 0.05)
      osc2.start(s); osc2.stop(s + dur + 0.05)
    }

    // Six staggered party horns at festive pitches
    horn(523, 0.00, 1.0,  0.15)  // C5
    horn(659, 0.07, 0.95, 0.13)  // E5
    horn(784, 0.13, 1.05, 0.13)  // G5
    horn(440, 0.04, 0.9,  0.12)  // A4
    horn(587, 0.10, 1.0,  0.12)  // D5
    horn(698, 0.18, 0.88, 0.11)  // F5
    setTimeout(() => ctx.close(), 3000)
  } catch (_) {}
}

// Rising tones — king promotion fanfare
function playKing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const t = ctx.currentTime
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      const s = t + i * 0.1
      osc.frequency.setValueAtTime(freq, s)
      gain.gain.setValueAtTime(0, s)
      gain.gain.linearRampToValueAtTime(0.25, s + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, s + 0.42)
      osc.start(s); osc.stop(s + 0.45)
    })
    setTimeout(() => ctx.close(), 1400)
  } catch (_) {}
}

// ─── Turkish Dama Rules ───────────────────────────────────────────────────────
// 0=empty  1=P1 man  2=P2 man  3=P1 king  4=P2 king
//
// Setup  : P2 fills rows 1–2 (all 8 cols), P1 fills rows 5–6 (all 8 cols)
// Move   : men move FORWARD + SIDEWAYS (orthogonal, not diagonal, not backward)
//          kings move all 4 orthogonal directions
// Capture: men capture forward + sideways only (no backward); kings capture all 4 directions
// King   : man reaching opponent's back row is promoted
// Mandatory capture + multi-jump chain required

const isP1    = v => v === 1 || v === 3
const isP2    = v => v === 2 || v === 4
const isKing  = v => v === 3 || v === 4
const owns    = (v, p) => p === 1 ? isP1(v) : isP2(v)
const isEnemy = (v, p) => p === 1 ? isP2(v) : isP1(v)
const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8

const ORTHO = [[-1,0],[1,0],[0,-1],[0,1]]

// Movement directions (walk only — not capture)
function walkDirs(v) {
  if (v === 3 || v === 4) return ORTHO          // kings: all 4
  if (v === 1) return [[-1,0],[0,-1],[0,1]]      // P1 men: up + sides
  if (v === 2) return [[1,0],[0,-1],[0,1]]       // P2 men: down + sides
  return []
}

// ─── Board setup ─────────────────────────────────────────────────────────────
function createBoard() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(0))
  for (let c = 0; c < 8; c++) {
    b[1][c] = 2   // P2 — row 1
    b[2][c] = 2   // P2 — row 2
    b[5][c] = 1   // P1 — row 5
    b[6][c] = 1   // P1 — row 6
  }
  return b
}

// ─── Move generation ─────────────────────────────────────────────────────────
// Capture: all 4 orthogonal directions
// Flying king: slides to find the first enemy, then can land on any empty square beyond it
function jumpsFrom(board, r, c, player, skip = []) {
  const v = board[r][c]
  const result = []

  if (isKing(v)) {
    for (const [dr, dc] of ORTHO) {
      let nr = r + dr, nc = c + dc
      let enemyPos = null
      while (inBounds(nr, nc)) {
        const cell = board[nr][nc]
        if (cell === 0) {
          // Empty square: if we already passed an enemy, this is a valid landing
          if (enemyPos && !skip.some(([sr, sc]) => sr === enemyPos[0] && sc === enemyPos[1])) {
            result.push({ toR: nr, toC: nc, capR: enemyPos[0], capC: enemyPos[1] })
          }
        } else if (isEnemy(cell, player)) {
          if (enemyPos) break  // two enemies in a row — can't jump through both
          enemyPos = [nr, nc]
        } else {
          break  // own piece blocks the slide
        }
        nr += dr; nc += dc
      }
    }
  } else {
    // Regular man: capture only forward + sideways (same dirs as walking — no backward)
    for (const [dr, dc] of walkDirs(v)) {
      const er = r + dr, ec = c + dc
      const lr = r + 2 * dr, lc = c + 2 * dc
      if (!inBounds(er, ec) || !inBounds(lr, lc)) continue
      if (!isEnemy(board[er][ec], player)) continue
      if (board[lr][lc] !== 0) continue
      if (skip.some(([sr, sc]) => sr === er && sc === ec)) continue
      result.push({ toR: lr, toC: lc, capR: er, capC: ec })
    }
  }
  return result
}

// Walk: only in allowed move directions
// Flying king: slides any number of squares until blocked
function walksFrom(board, r, c) {
  const v = board[r][c]
  const result = []
  if (isKing(v)) {
    for (const [dr, dc] of ORTHO) {
      let nr = r + dr, nc = c + dc
      while (inBounds(nr, nc) && board[nr][nc] === 0) {
        result.push({ toR: nr, toC: nc, capR: null, capC: null })
        nr += dr; nc += dc
      }
    }
  } else {
    for (const [dr, dc] of walkDirs(v)) {
      const nr = r + dr, nc = c + dc
      if (inBounds(nr, nc) && board[nr][nc] === 0)
        result.push({ toR: nr, toC: nc, capR: null, capC: null })
    }
  }
  return result
}

function anyJumps(board, player) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (owns(board[r][c], player) && jumpsFrom(board, r, c, player).length > 0) return true
  return false
}

function hasMoves(board, player) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      if (!owns(board[r][c], player)) continue
      if (jumpsFrom(board, r, c, player).length > 0) return true
      if (walksFrom(board, r, c).length > 0) return true
    }
  return false
}

// ─── Apply move ───────────────────────────────────────────────────────────────
function applyMove(board, fr, fc, tr, tc, capR, capC) {
  const next = board.map(row => [...row])
  const v = next[fr][fc]
  next[fr][fc] = 0
  if (capR != null) next[capR][capC] = 0
  let nv = v
  if (v === 1 && tr === 0) nv = 3   // P1 promoted at top row
  if (v === 2 && tr === 7) nv = 4   // P2 promoted at bottom row
  next[tr][tc] = nv
  return next
}

// ─── Player palette ───────────────────────────────────────────────────────────
const P = {
  1: { disc: '#D83850', glow: 'rgba(216,56,80,0.7)',   shadow: 'rgba(216,56,80,0.4)',   dim: 'rgba(216,56,80,0.15)' },
  2: { disc: '#E8C878', glow: 'rgba(232,200,120,0.7)', shadow: 'rgba(232,200,120,0.4)', dim: 'rgba(232,200,120,0.15)' },
}

// ─── Win particles ────────────────────────────────────────────────────────────
function WinParticles({ color }) {
  const particles = useMemo(() =>
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 10 + 5,
      delay: Math.random() * 1.2,
      duration: Math.random() * 2 + 1.8,
      drift: (Math.random() - 0.5) * 100,
      hue: [color, '#FFFFFF', '#E8C878', '#FFD6DF', color][i % 5],
      shape: i % 3 === 0 ? '3px' : '50%',
    }))
  , [color])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 60 }}>
      {particles.map(p => (
        <motion.div key={p.id} className="absolute"
          style={{ width: p.size, height: p.size, borderRadius: p.shape, backgroundColor: p.hue, left: `${p.x}%`, top: -20 }}
          initial={{ y: -20, opacity: 1, x: 0 }}
          animate={{ y: typeof window !== 'undefined' ? window.innerHeight + 60 : 900, opacity: [1,1,1,0], x: p.drift }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn', repeat: Infinity, repeatDelay: Math.random() * 0.5 }}
        />
      ))}
    </div>
  )
}

// ─── Win Overlay ──────────────────────────────────────────────────────────────
function WinOverlay({ winner, scores, onPlayAgain }) {
  return (
    <>
      <WinParticles color={P[winner].disc} />
      <motion.div className="fixed inset-0 flex items-center justify-center px-6"
        style={{ zIndex: 55 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${P[winner].glow.replace('0.7','0.22')} 0%, rgba(8,4,10,0.88) 60%)`,
            backdropFilter: 'blur(14px)',
          }}
        />
        <motion.div className="relative rounded-3xl p-8 w-full max-w-xs text-center"
          style={{
            background: `linear-gradient(160deg, ${P[winner].dim.replace('0.15','0.28')} 0%, #100810 100%)`,
            border: `1px solid ${P[winner].disc}40`,
            boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${P[winner].glow.replace('0.7','0.18')}`,
          }}
          initial={{ scale: 0.7, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
        >
          <motion.div className="text-6xl mb-4"
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.25 }}
            style={{ filter: `drop-shadow(0 0 20px ${P[winner].disc})` }}
          >
            👑
          </motion.div>
          <motion.h2 className="font-serif mb-1"
            style={{ color: P[winner].disc, fontSize: '1.8rem', lineHeight: 1.1 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          >
            Player {winner} Wins!
          </motion.h2>
          <motion.p className="text-sm mb-6"
            style={{ color: 'rgba(200,175,165,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          >
            No moves remaining
          </motion.p>

          <motion.div className="flex gap-3 mb-7"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            {[1, 2].map(p => (
              <div key={p} className="flex-1 rounded-2xl py-3"
                style={{
                  background: p === winner ? P[p].dim : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${p === winner ? P[p].disc + '40' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div className="w-5 h-5 rounded-full mx-auto mb-1.5"
                  style={{ backgroundColor: P[p].disc, boxShadow: `0 2px 8px ${P[p].shadow}` }} />
                <div className="text-2xl font-serif font-bold" style={{ color: p === winner ? P[p].disc : '#C8B0A8' }}>
                  {scores[p]}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.button onClick={onPlayAgain}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white"
            style={{
              background: `linear-gradient(135deg, ${P[winner].disc} 0%, ${P[winner].disc}AA 100%)`,
              boxShadow: `0 8px 28px ${P[winner].shadow}`,
            }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
          >
            Play Again
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dama({ onBack }) {
  const [board, setBoard]         = useState(createBoard)
  const [turn, setTurn]           = useState(1)
  const [sel, setSel]             = useState(null)   // [r,c]
  const [moves, setMoves]         = useState([])
  const [jumpPiece, setJumpPiece] = useState(null)   // [r,c] during multi-jump
  const [skipCells, setSkipCells] = useState([])
  const [winner, setWinner]       = useState(null)
  const [scores, setScores]       = useState({ 1: 0, 2: 0 })

  const isOver   = winner !== null
  const mustJump = jumpPiece != null || anyJumps(board, turn)

  // Pieces the current player is forced to capture with
  const capturablePieces = useMemo(() => {
    if (!mustJump) return null
    const set = new Set()
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (owns(board[r][c], turn) && jumpsFrom(board, r, c, turn).length > 0)
          set.add(`${r},${c}`)
    return set
  }, [board, turn, mustJump])

  function handleClick(r, c) {
    if (isOver) return

    if (jumpPiece) {
      const m = moves.find(m => m.toR === r && m.toC === c)
      if (m) doMove(jumpPiece[0], jumpPiece[1], m)
      return
    }

    if (owns(board[r][c], turn)) {
      const pJumps = jumpsFrom(board, r, c, turn)
      if (mustJump && pJumps.length === 0) return
      const pMoves = (mustJump || pJumps.length > 0) ? pJumps : walksFrom(board, r, c)
      setSel([r, c])
      setMoves(pMoves)
      return
    }

    if (sel) {
      const m = moves.find(m => m.toR === r && m.toC === c)
      if (m) { doMove(sel[0], sel[1], m); return }
    }

    setSel(null)
    setMoves([])
  }

  function doMove(fr, fc, m) {
    const nb = applyMove(board, fr, fc, m.toR, m.toC, m.capR, m.capC)
    setBoard(nb)

    const wasPromoted = (nb[m.toR][m.toC] === 3 && board[fr][fc] === 1) ||
                        (nb[m.toR][m.toC] === 4 && board[fr][fc] === 2)

    if (m.capR != null) {
      playCapture()
      if (wasPromoted) playKing()
      const newSkip = [...skipCells, [m.capR, m.capC]]
      if (!wasPromoted) {
        const more = jumpsFrom(nb, m.toR, m.toC, turn, newSkip)
        if (more.length > 0) {
          setSel([m.toR, m.toC])
          setJumpPiece([m.toR, m.toC])
          setMoves(more)
          setSkipCells(newSkip)
          return
        }
      }
    } else {
      playMove()
      if (wasPromoted) playKing()
    }
    endTurn(nb)
  }

  function endTurn(nb) {
    setSel(null); setMoves([]); setJumpPiece(null); setSkipCells([])
    const next = turn === 1 ? 2 : 1
    if (!hasMoves(nb, next)) {
      playWin()
      setWinner(turn)
      setScores(s => ({ ...s, [turn]: s[turn] + 1 }))
    } else {
      setTurn(next)
    }
  }

  function resetGame() {
    setBoard(createBoard()); setTurn(1); setSel(null)
    setMoves([]); setJumpPiece(null); setSkipCells([]); setWinner(null)
  }

  const isSelected  = (r, c) => sel && sel[0] === r && sel[1] === c
  const isValidDest = (r, c) => moves.some(m => m.toR === r && m.toC === c)
  const isCapTgt    = (r, c) => moves.some(m => m.capR === r && m.capC === c)
  // alternating board colors — purely decorative in Turkish Dama
  const isLight     = (r, c) => (r + c) % 2 === 0

  return (
    <div className="min-h-screen flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(180,60,60,0.1) 0%, transparent 55%),' +
          '#0A0508',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <motion.button onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl"
          style={{ color: 'rgba(200,175,165,0.7)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.10)' }} whileTap={{ scale: 0.97 }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Home
        </motion.button>

        <div className="text-center">
          <h1 className="font-serif text-xl" style={{ color: '#F0E8E0' }}>Dama</h1>
          <p className="text-xs" style={{ color: 'rgba(200,175,165,0.4)', letterSpacing: '0.05em' }}>TURKISH</p>
        </div>

        <motion.button onClick={() => { resetGame(); setScores({ 1: 0, 2: 0 }) }}
          className="text-xs font-medium px-3.5 py-2 rounded-xl"
          style={{ color: 'rgba(200,175,165,0.5)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.10)' }} whileTap={{ scale: 0.97 }}
        >
          Reset
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center px-3 py-2 gap-3">

        {/* Scores */}
        <div className="w-full flex gap-3" style={{ maxWidth: 480 }}>
          {[1, 2].map(p => (
            <motion.div key={p}
              className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-1"
              style={{
                background: turn === p && !isOver ? `linear-gradient(135deg, ${P[p].dim} 0%, rgba(255,255,255,0.03) 100%)` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${turn === p && !isOver ? P[p].disc + '50' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.3s ease',
                boxShadow: turn === p && !isOver ? `0 4px 20px ${P[p].shadow.replace('0.4','0.18')}` : 'none',
              }}
              animate={turn === p && !isOver ? { scale: 1.02 } : { scale: 1 }}
            >
              <motion.div className="w-6 h-6 rounded-full"
                style={{ backgroundColor: P[p].disc, boxShadow: turn === p && !isOver ? `0 4px 14px ${P[p].shadow}, 0 0 18px ${P[p].glow.replace('0.7','0.35')}` : `0 2px 8px ${P[p].shadow}` }}
                animate={turn === p && !isOver ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="text-xs font-medium" style={{ color: 'rgba(200,175,165,0.5)' }}>P{p}</span>
              <span className="text-xl font-semibold font-serif" style={{ color: turn === p && !isOver ? P[p].disc : '#C8B0A8' }}>
                {scores[p]}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Turn indicator */}
        <AnimatePresence mode="wait">
          {!isOver && (
            <motion.div key={`turn-${turn}`}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: P[turn].dim, color: P[turn].disc, border: `1px solid ${P[turn].disc}30` }}
              initial={{ opacity: 0, scale: 0.85, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 6 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: P[turn].disc, boxShadow: `0 0 8px ${P[turn].glow}` }} />
              {mustJump ? `Player ${turn} — must capture!` : `Player ${turn}'s turn`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Board — all squares active, alternating colors for aesthetics */}
        <div className="rounded-2xl select-none overflow-hidden"
          style={{
            '--cell': 'min(calc((100vw - 58px) / 8), 80px)',
            width: '100%',
            maxWidth: 700,
            padding: '10px',
            background: 'linear-gradient(160deg, #3A1E08 0%, #250E02 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex flex-col gap-0.5">
            {board.map((row, r) => (
              <div key={r} className="flex gap-0.5">
                {row.map((cell, c) => {
                  const light       = isLight(r, c)
                  const selected    = isSelected(r, c)
                  const validDst    = isValidDest(r, c)
                  const capTgt      = isCapTgt(r, c)
                  const king        = isKing(cell)
                  const owner       = isP1(cell) ? 1 : isP2(cell) ? 2 : null
                  const mustCapHere = mustJump && !selected && capturablePieces?.has(`${r},${c}`)

                  return (
                    <motion.div key={c}
                      onClick={() => handleClick(r, c)}
                      className="flex items-center justify-center relative"
                      style={{
                        width: 'var(--cell)',
                        aspectRatio: '1',
                        borderRadius: 'max(4px, calc(var(--cell) * 0.08))',
                        backgroundColor: selected
                          ? `${P[owner]?.disc}22`
                          : validDst && !cell
                            ? `${P[turn].disc}18`
                            : light ? '#C49040' : '#2C1204',
                        cursor: !isOver ? 'pointer' : 'default',
                        boxShadow: selected
                          ? `inset 0 0 0 2px ${P[owner]?.disc}, 0 0 14px ${P[owner]?.glow}`
                          : capTgt && cell
                            ? `inset 0 0 0 2px rgba(255,100,100,0.8)`
                            : 'none',
                        transition: 'background-color 0.12s ease, box-shadow 0.15s ease',
                      }}
                      whileHover={!isOver && !cell ? { backgroundColor: `${P[turn].disc}25` } : {}}
                    >
                      {/* Move dot on empty valid squares */}
                      {validDst && !cell && (
                        <motion.div className="rounded-full"
                          style={{ width: '30%', aspectRatio: '1', backgroundColor: P[turn].disc, opacity: 0.75 }}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.1, repeat: Infinity }}
                        />
                      )}

                      {/* Piece */}
                      {cell !== 0 && (
                        <motion.div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: '78%',
                            aspectRatio: '1',
                            background: `radial-gradient(circle at 35% 30%, ${P[owner].disc}EE, ${P[owner].disc})`,
                            boxShadow: selected
                              ? `0 0 0 2.5px white, 0 0 16px ${P[owner].glow}, 0 3px 10px ${P[owner].shadow}`
                              : mustCapHere
                                ? `0 0 0 2.5px #F5C542, 0 0 14px rgba(245,197,66,0.75), 0 3px 10px ${P[owner].shadow}`
                                : capTgt
                                  ? `0 0 0 2px rgba(255,80,80,0.85), 0 3px 10px ${P[owner].shadow}`
                                  : `0 3px 8px ${P[owner].shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                            transition: 'box-shadow 0.2s ease',
                            fontSize: 'calc(var(--cell) * 0.3)',
                          }}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={
                            selected
                              ? { scale: [1.05, 1.12, 1.05] }
                              : mustCapHere
                                ? { scale: [1, 1.1, 1], boxShadow: [
                                    `0 0 0 2px #F5C542, 0 0 10px rgba(245,197,66,0.6), 0 3px 10px ${P[owner].shadow}`,
                                    `0 0 0 3px #F5C542, 0 0 22px rgba(245,197,66,0.9), 0 3px 10px ${P[owner].shadow}`,
                                    `0 0 0 2px #F5C542, 0 0 10px rgba(245,197,66,0.6), 0 3px 10px ${P[owner].shadow}`,
                                  ]}
                                : { scale: 1, opacity: 1 }
                          }
                          transition={
                            selected
                              ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                              : mustCapHere
                                ? { duration: 0.85, repeat: Infinity, ease: 'easeInOut' }
                                : { type: 'spring', stiffness: 400, damping: 20 }
                          }
                        >
                          {king && (
                            <span style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 3px rgba(0,0,0,0.6)', lineHeight: 1 }}>
                              ♛
                            </span>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <motion.p className="text-xs text-center pb-2"
          style={{ color: 'rgba(180,150,140,0.3)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          Move forward & sideways · Capture any direction · ♛ King · Captures mandatory
        </motion.p>
      </div>

      <AnimatePresence>
        {isOver && <WinOverlay winner={winner} scores={scores} onPlayAgain={resetGame} />}
      </AnimatePresence>
    </div>
  )
}
