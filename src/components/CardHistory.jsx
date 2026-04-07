import { motion } from 'framer-motion'
import Card from './Card.jsx'

export default function CardHistory({ cards }) {
  if (!cards || cards.length === 0) return null

  return (
    <div
      className="py-4 pb-6"
      style={{ borderTop: '1px solid rgba(180,120,80,0.08)' }}
    >
      <p
        className="text-xs font-medium px-5 mb-3"
        style={{ color: '#9B7B6B' }}
      >
        Previous cards
      </p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 32, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              delay: index === 0 ? 0.05 : 0,
              type: 'spring',
              stiffness: 280,
              damping: 24,
            }}
            whileHover={{ scale: 1.06, y: -3 }}
            className="cursor-pointer flex-shrink-0"
          >
            <Card card={card} variant="mini" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
