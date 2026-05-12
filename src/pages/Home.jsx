import { motion } from 'framer-motion'
import { theme } from '../theme.js'

// Decorative mini Connect 4 grid
function MiniGrid() {
  const layout = [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 2, 1, 0, 0],
    [2, 2, 1, 1, 0],
  ]
  const colors = { 0: 'rgba(255,255,255,0.12)', 1: theme.connect4.p2.disc, 2: theme.connect4.p1.disc }
  return (
    <div className="flex flex-col gap-1.5 opacity-90">
      {layout.map((row, r) => (
        <div key={r} className="flex gap-1.5">
          {row.map((cell, c) => (
            <div
              key={c}
              style={{
                width: 18, height: 18,
                borderRadius: '50%',
                backgroundColor: colors[cell],
                boxShadow: cell !== 0 ? `0 2px 8px ${colors[cell]}99` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Decorative floating cards
function MiniCards() {
  return (
    <div className="relative" style={{ width: 80, height: 90 }}>
      {[
        { rotate: -14, x: 0, y: 8, bg: 'rgba(255,255,255,0.10)', delay: 0 },
        { rotate: -4, x: 8, y: 4, bg: 'rgba(255,255,255,0.16)', delay: 0.05 },
        { rotate: 6, x: 16, y: 0, bg: 'rgba(255,255,255,0.22)', delay: 0.1 },
      ].map((card, i) => (
        <motion.div
          key={i}
          className="absolute rounded-xl"
          style={{
            width: 44, height: 62,
            background: card.bg,
            border: '1px solid rgba(255,255,255,0.2)',
            rotate: card.rotate,
            x: card.x, y: card.y,
            backdropFilter: 'blur(4px)',
          }}
          animate={{ y: [card.y, card.y - 4, card.y] }}
          transition={{ duration: 3, delay: card.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex items-center justify-center h-full text-lg opacity-60">
            {i === 2 ? '💕' : ''}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Decorative mini Turkish Dama board — pieces fill full rows
function MiniDama() {
  // 5-col slice of the 8-col board to keep it compact
  // Row 0: empty, Row 1: P2 (all), Row 2: empty, Row 3: P1 (all), Row 4: empty
  const COLS = 5
  const rows = [
    Array(COLS).fill('b'),   // P2 row
    Array(COLS).fill(0),     // empty
    Array(COLS).fill(0),     // empty
    Array(COLS).fill('r'),   // P1 row
  ]
  return (
    <div className="flex flex-col gap-1 opacity-90">
      {rows.map((row, r) => (
        <div key={r} className="flex gap-1">
          {row.map((cell, c) => (
            <div key={c}
              style={{
                width: 14, height: 14,
                borderRadius: '3px',
                backgroundColor: (r + c) % 2 === 0 ? theme.dama.tileLight : theme.dama.tileDark,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {cell !== 0 && (
                <div style={{
                  width: 10, height: 10,
                  borderRadius: '50%',
                  backgroundColor: cell === 'r' ? theme.dama.p1.disc : theme.dama.p2.disc,
                  boxShadow: `0 1px 4px ${cell === 'r' ? theme.dama.p1.shadow : theme.dama.p2.shadow}`,
                }} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const GAMES = [
  {
    id: 'getCloser',
    name: "Let's Get Closer",
    icon: '💕',
    description: 'Draw meaningful conversation cards. Deepen connections. Fall a little more in love.',
    players: '2+ players',
    tag: 'Conversation',
    bg: theme.getCloser.homeBg,
    glow: theme.getCloser.homeGlow,
    accent: theme.getCloser.homeAccent,
    accentDim: theme.getCloser.homeAccentDim,
    btnBg: theme.getCloser.homeBtnBg,
    btnShadow: theme.getCloser.homeBtnShadow,
    decoration: <MiniCards />,
  },
  {
    id: 'connect4',
    name: 'Connect 4',
    icon: '🔵',
    description: 'Outsmart your opponent. Drop your disc. Connect four before they do.',
    players: '2 players',
    tag: 'Strategy',
    bg: theme.connect4.homeBg,
    glow: theme.connect4.homeGlow,
    accent: theme.connect4.homeAccent,
    accentDim: theme.connect4.homeAccentDim,
    btnBg: theme.connect4.homeBtnBg,
    btnShadow: theme.connect4.homeBtnShadow,
    decoration: <MiniGrid />,
  },
  {
    id: 'dama',
    name: 'Dama',
    icon: '♟',
    description: "Capture all your opponent's pieces. Jump, chain, and crown your kings to victory.",
    players: '2 players',
    tag: 'Classic',
    bg: theme.dama.homeBg,
    glow: theme.dama.homeGlow,
    accent: theme.dama.homeAccent,
    accentDim: theme.dama.homeAccentDim,
    btnBg: theme.dama.homeBtnBg,
    btnShadow: theme.dama.homeBtnShadow,
    decoration: <MiniDama />,
  },
]

export default function Home({ onSelectGame }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse at 18% 12%, rgba(255,80,140,0.22) 0%, transparent 50%),' +
          'radial-gradient(ellipse at 82% 85%, rgba(60,150,255,0.22) 0%, transparent 50%),' +
          'radial-gradient(ellipse at 76% 18%, rgba(185,60,255,0.17) 0%, transparent 50%),' +
          'radial-gradient(ellipse at 28% 80%, rgba(255,185,50,0.16) 0%, transparent 50%),' +
          '#FFF8FA',
      }}
    >
      <div className="flex-1 flex flex-col px-5 py-12 max-w-lg mx-auto w-full">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.img
            src="/logo.png"
            alt="Elfa"
            className="mx-auto mb-4"
            style={{ width: 220, height: 'auto', filter: 'drop-shadow(0 4px 28px rgba(217,64,120,0.30)) drop-shadow(0 2px 8px rgba(100,60,180,0.20))' }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          />
          <p style={{ color: 'rgba(110,80,160,0.55)', fontSize: '0.85rem', letterSpacing: '0.1em', fontWeight: 600 }}>
            GAMES THAT BRING YOU CLOSER
          </p>
        </motion.div>

        {/* Game Cards */}
        <div className="flex flex-col gap-4 flex-1">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={() => onSelectGame(game.id)}
              className="relative overflow-hidden rounded-3xl cursor-pointer select-none"
              style={{
                background: game.bg,
                boxShadow: `0 4px 32px ${game.glow}, inset 0 1px 0 rgba(255,255,255,0.07)`,
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              whileHover={{ scale: 1.025, y: -4, boxShadow: `0 12px 48px ${game.glow}, inset 0 1px 0 rgba(255,255,255,0.10)` }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            >
              {/* Ambient glow blob inside card */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${game.glow} 0%, transparent 70%)`,
                  transform: 'translate(30%, -30%)',
                }}
              />

              <div className="relative flex items-center justify-between p-6 gap-4">
                {/* Left: content */}
                <div className="flex-1 min-w-0">
                  <div className="text-3xl mb-3">{game.icon}</div>
                  <h2
                    className="font-serif mb-2"
                    style={{ color: '#F5EDE8', fontSize: '1.45rem', lineHeight: 1.2 }}
                  >
                    {game.name}
                  </h2>
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: 'rgba(210,190,185,0.65)', maxWidth: '22ch' }}
                  >
                    {game.description}
                  </p>

                  <div className="flex items-center gap-2.5">
                    {/* Tag */}
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: game.accentDim, color: game.accent, border: `1px solid ${game.accent}30` }}
                    >
                      {game.tag}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(200,175,165,0.4)' }}>
                      {game.players}
                    </span>
                  </div>
                </div>

                {/* Right: decoration + button */}
                <div className="flex flex-col items-center gap-5 flex-shrink-0">
                  <div className="opacity-80">{game.decoration}</div>
                  <motion.div
                    className="flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold text-white gap-2"
                    style={{ background: game.btnBg, boxShadow: game.btnShadow, whiteSpace: 'nowrap' }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Play
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs mt-10"
          style={{ color: 'rgba(110,80,160,0.35)', letterSpacing: '0.06em' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          MORE GAMES COMING SOON
        </motion.p>
      </div>
    </div>
  )
}
