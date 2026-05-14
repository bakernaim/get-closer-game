import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ onClose, reason = 'online' }) {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (tab === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      // on success, parent detects user change and proceeds
    } else {
      if (username.trim().length < 2) {
        setError('Username must be at least 2 characters')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, username.trim())
      if (error) setError(error.message)
      else setRegistered(true)
    }
    setLoading(false)
  }

  const reasonText = {
    online: {
      icon: '🌐',
      title: 'Play online with your partner',
      sub: 'Create a free account to invite your partner and play from different devices.',
    },
    general: {
      icon: '💕',
      title: 'Join Elfa',
      sub: 'Sign in to access all features and play online.',
    },
  }[reason] ?? { icon: '🌐', title: 'Sign in to continue', sub: '' }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(20,10,35,0.55)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative rounded-t-3xl px-6 pt-6 pb-10 w-full max-w-sm mx-auto"
        style={{
          background: 'linear-gradient(160deg, #FFFAFC 0%, #FFF4F8 100%)',
          boxShadow: '0 -8px 60px rgba(200,60,160,0.18)',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: 'rgba(200,150,210,0.35)' }} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(180,150,210,0.15)', color: 'rgba(100,80,140,0.5)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {registered ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
            <div className="text-4xl mb-3">💌</div>
            <h2 className="font-serif text-2xl mb-2" style={{ color: '#3D2B6B' }}>Check your email</h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(100,80,140,0.6)' }}>
              Confirm your email at <strong>{email}</strong>, then come back and sign in.
            </p>
            <button onClick={() => { setTab('login'); setRegistered(false) }}
              className="text-sm font-semibold" style={{ color: '#C040A0' }}>
              Back to Sign In
            </button>
          </motion.div>
        ) : (
          <>
            {/* Reason header */}
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">{reasonText.icon}</div>
              <h2 className="font-serif text-xl mb-1" style={{ color: '#3D2B6B' }}>{reasonText.title}</h2>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(100,80,140,0.55)' }}>{reasonText.sub}</p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-2xl p-1 mb-5" style={{ backgroundColor: 'rgba(180,150,210,0.12)' }}>
              {['register', 'login'].map((t) => (
                <button key={t} onClick={() => { setTab(t); setError('') }}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: tab === t ? 'white' : 'transparent',
                    color: tab === t ? '#3D2B6B' : 'rgba(100,80,140,0.5)',
                    boxShadow: tab === t ? '0 2px 12px rgba(180,100,200,0.15)' : 'none',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {tab === 'register' && (
                  <motion.input
                    key="username"
                    type="text"
                    placeholder="Your name (shown to partner)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{
                      backgroundColor: 'rgba(180,150,210,0.1)',
                      border: '1.5px solid rgba(180,150,210,0.25)',
                      color: '#3D2B6B',
                    }}
                  />
                )}
              </AnimatePresence>

              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ backgroundColor: 'rgba(180,150,210,0.1)', border: '1.5px solid rgba(180,150,210,0.25)', color: '#3D2B6B' }}
              />

              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ backgroundColor: 'rgba(180,150,210,0.1)', border: '1.5px solid rgba(180,150,210,0.25)', color: '#3D2B6B' }}
              />

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-center px-2" style={{ color: '#E05080' }}>
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm mt-1"
                style={{
                  background: 'linear-gradient(135deg, #F06080 0%, #C040A0 100%)',
                  boxShadow: '0 4px 20px rgba(200,60,160,0.35)',
                  opacity: loading ? 0.7 : 1,
                }}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Free Account'}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
