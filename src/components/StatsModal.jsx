import { motion } from 'framer-motion'
import { TOPICS, TOPIC_ORDER } from '../data/questions.js'

export default function StatsModal({ stats, onClose }) {
  const topicsWithActivity = TOPIC_ORDER.filter(id => {
    const t = stats.perTopic[id]
    return t && (t.drawn > 0 || stats.totalDrawn === 0)
  })

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(61,44,44,0.25)' }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-sm rounded-3xl p-7 card-shadow overflow-y-auto"
        style={{ backgroundColor: 'white', maxHeight: '80vh' }}
        initial={{ scale: 0.85, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F0EDE8', color: '#9B7B6B' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="font-serif text-2xl mb-5" style={{ color: '#3D2C2C' }}>
          Your Progress
        </h2>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: stats.totalDrawn, label: 'Drawn' },
            { value: stats.totalSaved, label: 'Saved' },
            { value: stats.remaining, label: 'Remaining' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center"
              style={{ backgroundColor: '#FAF8F5' }}
            >
              <div className="font-serif text-2xl" style={{ color: '#C4687A' }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#9B7B6B' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Per-topic bars */}
        {stats.totalDrawn > 0 && (
          <>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#7A5A4A' }}>
              By Topic
            </h3>
            <div className="space-y-3">
              {topicsWithActivity.map(id => {
                const topic = TOPICS[id]
                const data = stats.perTopic[id]
                if (!data || data.drawn === 0) return null
                const pct = data.total > 0 ? (data.drawn / data.total) * 100 : 0
                return (
                  <div key={id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium" style={{ color: '#3D2C2C' }}>
                        {topic.icon} {topic.name}
                      </span>
                      <span className="text-xs" style={{ color: '#9B7B6B' }}>
                        {data.drawn}/{data.total}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F0EDE8' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: topic.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {stats.totalDrawn === 0 && (
          <p className="text-center text-sm" style={{ color: '#9B7B6B' }}>
            Draw your first card to see stats!
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
