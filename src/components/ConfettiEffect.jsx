import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLE_COLORS = ['#FFB3C6', '#C9B8E8', '#FFE57A', '#A8E6CF', '#FFAD9F', '#FFD4A3']
const PARTICLE_COUNT = 28

const MILESTONE_MESSAGES = {
  5: { text: '5 cards! 💕', sub: "You're opening up" },
  10: { text: '10 cards! ✨', sub: "Getting closer" },
  15: { text: '15 cards! 🌟', sub: "Deep connection" },
  25: { text: '25 cards! 🎉', sub: "You're so close!" },
}

export default function ConfettiEffect({ milestone }) {
  const particles = useMemo(() => (
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2
      const radius = 120 + Math.random() * 220
      return {
        id: i,
        x: Math.cos(angle) * radius * (0.6 + Math.random() * 0.8),
        y: Math.sin(angle) * radius * (0.5 + Math.random() * 0.8) - 60,
        rotate: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 1.2,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        isHeart: i % 3 === 0,
        delay: Math.random() * 0.25,
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [milestone])

  const message = MILESTONE_MESSAGES[milestone]

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          {/* Milestone text badge */}
          <motion.div
            className="relative z-10 text-center px-8 py-5 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 40px rgba(196,104,122,0.25)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <div className="font-serif text-2xl mb-1" style={{ color: '#C4687A' }}>
              {message?.text}
            </div>
            <div className="text-sm" style={{ color: '#9B7B6B' }}>
              {message?.sub}
            </div>
          </motion.div>

          {/* Particles */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                color: p.color,
                fontSize: p.isHeart ? '1.4rem' : '0.65rem',
                lineHeight: 1,
              }}
              initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: p.x,
                y: p.y,
                rotate: p.rotate,
                scale: p.scale,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.8,
                delay: p.delay,
                ease: [0.2, 0.8, 0.4, 1],
                opacity: { times: [0, 0.1, 0.7, 1] },
              }}
            >
              {p.isHeart ? '♥' : '●'}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
