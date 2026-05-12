import { motion } from 'framer-motion'
import TopicIllustration from './TopicIllustration.jsx'
import { theme } from '../theme.js'

// Card back decorative SVG pattern
function CardBackPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-15"
      viewBox="0 0 300 420"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="backPattern" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M18 4 L21 13 L31 13 L23 19 L26 28 L18 22 L10 28 L13 19 L5 13 L15 13Z"
                fill="#C4687A" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="300" height="420" fill="url(#backPattern)" />
    </svg>
  )
}

export default function Card({ card, isFlipped = false, variant = 'full' }) {
  const isMini = variant === 'mini'

  if (isMini) {
    // Mini card for history carousel — no flip animation, just show face
    return (
      <div
        className="relative rounded-xl overflow-hidden shrink-0"
        style={{
          width: '76px',
          height: '108px',
          background: card
            ? `linear-gradient(150deg, ${card.topicColor}55 0%, ${card.topicColor}28 100%)`
            : '#F5EDE8',
          boxShadow: '0 2px 8px rgba(180,120,80,0.12)',
        }}
      >
        {card && (
          <>
            <div className="absolute inset-0 w-full h-full opacity-20 flex items-end justify-end p-1">
              <TopicIllustration topicId={card.topicId} color={card.topicColor} className="w-12 h-12" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <p
                className="font-serif italic text-center leading-tight"
                style={{
                  fontSize: '0.42rem',
                  color: '#3D2C2C',
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                "{card.question}"
              </p>
            </div>
            {/* Topic dot */}
            <div
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: card.topicColor }}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div
      className="relative select-none"
      style={{
        width: '300px',
        height: '420px',
        perspective: '1200px',
      }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* ── Card Back ── */}
        <div
          className="absolute inset-0 rounded-3xl card-shadow overflow-hidden flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: theme.getCloser.cardBack,
          }}
        >
          <CardBackPattern />
          {/* Center branding */}
          <div className="relative z-10 text-center">
            <div className="text-3xl mb-2 opacity-60">💕</div>
            <p
              className="font-serif italic text-lg opacity-50"
              style={{ color: '#8B5E52' }}
            >
              Let's Get Closer
            </p>
          </div>
          {/* Corner flourishes */}
          <div className="absolute top-4 left-4 opacity-20">
            <svg width="28" height="28" viewBox="0 0 28 28"><path d="M14 3 L17 11 L26 11 L19 16 L22 24 L14 19 L6 24 L9 16 L2 11 L11 11Z" fill="#C4687A" /></svg>
          </div>
          <div className="absolute bottom-4 right-4 opacity-20" style={{ transform: 'rotate(180deg)' }}>
            <svg width="28" height="28" viewBox="0 0 28 28"><path d="M14 3 L17 11 L26 11 L19 16 L22 24 L14 19 L6 24 L9 16 L2 11 L11 11Z" fill="#C4687A" /></svg>
          </div>
        </div>

        {/* ── Card Front ── */}
        <div
          className="absolute inset-0 rounded-3xl card-shadow overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: card
              ? `linear-gradient(150deg, ${card.topicColor}88 0%, ${card.topicColor}44 55%, ${card.topicColorDark}22 100%), ${theme.getCloser.cardFront}`
              : '#F5EDE8',
          }}
        >
          {card && (
            <>
              {/* Background illustration — large, bottom-right, faded */}
              <div className="absolute bottom-0 right-0 w-52 h-52 opacity-30">
                <TopicIllustration topicId={card.topicId} color={card.topicColor} className="w-full h-full" />
              </div>

              {/* Top-left decorative star */}
              <div className="absolute top-5 left-5 opacity-25">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path d="M10 2 L12 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8 8Z"
                        fill={card.topicColor} />
                </svg>
              </div>

              {/* Topic badge — top right */}
              <motion.div
                className="absolute top-5 right-5 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1"
                style={{
                  backgroundColor: card.topicColor,
                  color: card.topicColorText,
                  boxShadow: `0 2px 8px ${card.topicColor}60`,
                }}
                initial={{ scale: 0.7, opacity: 0, y: -8 }}
                animate={{ scale: [0.7, 1.08, 1], opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
              >
                <span>{card.topicIcon}</span>
                <span>{card.topicName}</span>
              </motion.div>

              {/* Question text — centered */}
              <div className="absolute inset-0 flex items-center justify-center p-10 pt-16">
                <motion.p
                  className="font-serif italic text-center leading-relaxed"
                  style={{
                    color: '#3D2C2C',
                    fontSize: card.question.length > 70
                      ? '1.15rem'
                      : card.question.length > 45
                        ? '1.3rem'
                        : '1.5rem',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.45 }}
                >
                  "{card.question}"
                </motion.p>
              </div>

              {/* Bottom accent line */}
              <motion.div
                className="absolute bottom-10 left-10 right-10 h-px"
                style={{ backgroundColor: card.topicColor, opacity: 0.3 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              />
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
