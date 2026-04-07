import { motion } from 'framer-motion'

export default function DeckStack({ remaining, total, onClick }) {
  // Show 3 layers behind the main card, fading as deck depletes
  const fraction = total > 0 ? remaining / total : 0
  const layer1Opacity = fraction > 0.67 ? 0.45 : fraction > 0.33 ? 0.2 : 0
  const layer2Opacity = fraction > 0.33 ? 0.6 : fraction > 0.1 ? 0.3 : 0
  const layer3Opacity = fraction > 0 ? 0.75 : 0

  const layers = [
    { dx: 10, dy: 10, rotate: 4, opacity: layer1Opacity },
    { dx: 6, dy: 6, rotate: 2, opacity: layer2Opacity },
    { dx: 3, dy: 3, rotate: 1, opacity: layer3Opacity },
  ]

  return (
    <div className="relative" style={{ width: '300px', height: '420px' }}>
      {layers.map((layer, i) => (
        <motion.div
          key={i}
          className="absolute rounded-3xl"
          style={{
            width: '300px',
            height: '420px',
            right: -layer.dx,
            bottom: -layer.dy,
            rotate: layer.rotate,
            opacity: layer.opacity,
            background: 'linear-gradient(150deg, #F5E6D3 0%, #DCC9B8 100%)',
            boxShadow: '0 3px 12px rgba(180,120,80,0.10)',
            transition: 'opacity 0.6s ease',
            zIndex: -i - 1,
          }}
          animate={{ opacity: layer.opacity }}
          transition={{ duration: 0.6 }}
        />
      ))}

      {/* Remaining count badge */}
      {remaining > 0 && (
        <motion.div
          className="absolute -bottom-8 left-0 right-0 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xs font-medium" style={{ color: '#9B7B6B' }}>
            {remaining} card{remaining !== 1 ? 's' : ''} remaining
          </span>
        </motion.div>
      )}
    </div>
  )
}
