import { motion } from 'framer-motion'

export default function WaitingScreen({ title, subtitle, onLeave }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{
        background:
          'radial-gradient(ellipse at 20% 20%, rgba(255,80,140,0.18) 0%, transparent 55%),' +
          'radial-gradient(ellipse at 80% 75%, rgba(100,60,200,0.16) 0%, transparent 55%),' +
          '#FFF8FA',
      }}
    >
      {/* Pulsing heart */}
      <motion.div
        className="text-6xl mb-6"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        💕
      </motion.div>

      <motion.h2
        className="font-serif text-3xl mb-3"
        style={{ color: '#3D2B6B' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h2>

      <motion.p
        className="text-sm mb-8 max-w-xs leading-relaxed"
        style={{ color: 'rgba(100,80,140,0.6)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {subtitle}
      </motion.p>

      {/* Animated dots */}
      <div className="flex gap-2 mb-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'rgba(200,60,160,0.4)' }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>

      <button
        onClick={onLeave}
        className="text-sm font-medium px-5 py-2 rounded-xl"
        style={{ color: 'rgba(100,80,140,0.5)', backgroundColor: 'rgba(180,150,210,0.1)' }}
      >
        Leave game
      </button>
    </div>
  )
}
