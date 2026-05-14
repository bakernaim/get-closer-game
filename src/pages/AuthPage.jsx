import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState('login') // 'login' | 'register'
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
    } else {
      if (username.trim().length < 2) {
        setError('Username must be at least 2 characters')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, username.trim())
      if (error) {
        setError(error.message)
      } else {
        setRegistered(true)
      }
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{
        background:
          'radial-gradient(ellipse at 20% 15%, rgba(255,80,140,0.22) 0%, transparent 55%),' +
          'radial-gradient(ellipse at 80% 80%, rgba(60,120,255,0.2) 0%, transparent 55%),' +
          '#FFF8FA',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.img
            src="/logo.png"
            alt="Elfa"
            className="mx-auto mb-3"
            style={{ width: 160, filter: 'drop-shadow(0 4px 20px rgba(217,64,120,0.28))' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          />
          <p style={{ color: 'rgba(110,80,160,0.55)', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 600 }}>
            GAMES THAT BRING YOU CLOSER
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 48px rgba(200,100,160,0.12), 0 1px 0 rgba(255,255,255,0.8)',
            border: '1px solid rgba(220,200,230,0.5)',
          }}
        >
          {registered ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-4xl mb-3">💌</div>
              <h2 className="font-serif text-2xl mb-2" style={{ color: '#3D2B6B' }}>Check your email</h2>
              <p style={{ color: 'rgba(100,80,140,0.65)', fontSize: '0.9rem' }}>
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back to sign in.
              </p>
              <button
                onClick={() => { setTab('login'); setRegistered(false) }}
                className="mt-5 text-sm font-semibold"
                style={{ color: '#C040A0' }}
              >
                Back to Sign In
              </button>
            </motion.div>
          ) : (
            <>
              {/* Tabs */}
              <div
                className="flex rounded-2xl p-1 mb-6"
                style={{ backgroundColor: 'rgba(180,150,210,0.12)' }}
              >
                {['login', 'register'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError('') }}
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

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {tab === 'register' && (
                    <motion.div
                      key="username"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <input
                        type="text"
                        placeholder="Your name (shown to partner)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                        style={{
                          backgroundColor: 'rgba(180,150,210,0.1)',
                          border: '1.5px solid rgba(180,150,210,0.25)',
                          color: '#3D2B6B',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(180,150,210,0.1)',
                    border: '1.5px solid rgba(180,150,210,0.25)',
                    color: '#3D2B6B',
                  }}
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                  style={{
                    backgroundColor: 'rgba(180,150,210,0.1)',
                    border: '1.5px solid rgba(180,150,210,0.25)',
                    color: '#3D2B6B',
                  }}
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-center px-2"
                    style={{ color: '#E05080' }}
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #F06080 0%, #C040A0 100%)',
                    boxShadow: '0 4px 20px rgba(200,60,160,0.35)',
                    opacity: loading ? 0.7 : 1,
                  }}
                  whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                </motion.button>
              </form>
            </>
          )}
        </div>

        {tab === 'register' && !registered && (
          <p className="text-center text-xs mt-4" style={{ color: 'rgba(110,80,160,0.4)' }}>
            After registering you'll get a unique player number to share with your partner.
          </p>
        )}
      </motion.div>
    </div>
  )
}
