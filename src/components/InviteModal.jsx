import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

function initialGameState(gameType) {
  if (gameType === 'connect4') {
    return {
      board: Array.from({ length: 6 }, () => Array(7).fill(0)),
      currentPlayer: 1,
      scores: { 1: 0, 2: 0 },
      winner: null,
      winCells: [],
    }
  }
  if (gameType === 'dama') {
    const b = Array.from({ length: 8 }, () => Array(8).fill(0))
    for (let c = 0; c < 8; c++) { b[1][c] = 2; b[2][c] = 2; b[5][c] = 1; b[6][c] = 1 }
    return { board: b, turn: 1, scores: { 1: 0, 2: 0 }, winner: null, jumpPiece: null, skipCells: [] }
  }
  return {} // card game manages its own state
}

const GAME_LABELS = { card: "Let's Get Closer", connect4: 'Connect 4', dama: 'Dama' }

export default function InviteModal({ user, profile, gameType = 'card', onCreated, onClose }) {
  const [partnerNumber, setPartnerNumber] = useState('')
  const [partnerProfile, setPartnerProfile] = useState(null)
  const [lookupError, setLookupError] = useState('')
  const [looking, setLooking] = useState(false)
  const [creating, setCreating] = useState(false)

  async function handleLookup() {
    const num = parseInt(partnerNumber, 10)
    if (!num) return
    setLooking(true)
    setLookupError('')
    setPartnerProfile(null)

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, user_number')
      .eq('user_number', num)
      .single()

    setLooking(false)

    if (error || !data) {
      setLookupError('No player found with that number.')
      return
    }
    if (data.id === user.id) {
      setLookupError("That's your own number!")
      return
    }
    setPartnerProfile(data)
  }

  async function handleCreate() {
    if (!partnerProfile) return
    setCreating(true)

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        host_id: user.id,
        guest_id: partnerProfile.id,
        status: 'waiting',
        game_type: gameType,
        game_state: initialGameState(gameType),
      })
      .select()
      .single()

    setCreating(false)
    if (!error && data) {
      onCreated(data)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(30,15,50,0.4)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative w-full max-w-sm rounded-t-3xl px-6 pt-5 pb-10"
        style={{ backgroundColor: 'white', zIndex: 1 }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: '#E0D4F0' }} />

        <h2 className="font-serif text-2xl mb-1" style={{ color: '#3D2B6B' }}>Invite Your Partner</h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(100,80,140,0.55)' }}>
          Playing <strong>{GAME_LABELS[gameType]}</strong> online. Ask them to open the app — their player number is shown at the top of the home screen.
        </p>

        {/* Your number */}
        <div
          className="flex items-center gap-3 rounded-2xl p-3.5 mb-5"
          style={{ backgroundColor: 'rgba(200,60,160,0.07)', border: '1px solid rgba(200,60,160,0.15)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: 'rgba(200,60,160,0.15)', color: '#C040A0' }}
          >
            #{profile?.user_number}
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: 'rgba(100,80,140,0.5)' }}>YOUR NUMBER</div>
            <div className="font-semibold" style={{ color: '#3D2B6B' }}>{profile?.username}</div>
          </div>
        </div>

        {/* Partner number input */}
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="Partner's player number"
            value={partnerNumber}
            onChange={(e) => { setPartnerNumber(e.target.value); setPartnerProfile(null); setLookupError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              backgroundColor: 'rgba(180,150,210,0.1)',
              border: '1.5px solid rgba(180,150,210,0.25)',
              color: '#3D2B6B',
            }}
          />
          <motion.button
            onClick={handleLookup}
            disabled={!partnerNumber || looking}
            className="px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #F06080 0%, #C040A0 100%)',
              color: 'white',
              opacity: !partnerNumber || looking ? 0.5 : 1,
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {looking ? '...' : 'Find'}
          </motion.button>
        </div>

        <AnimatePresence>
          {lookupError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm mb-3 px-1"
              style={{ color: '#E05080' }}
            >
              {lookupError}
            </motion.p>
          )}

          {partnerProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              <div
                className="flex items-center justify-between rounded-2xl p-3.5"
                style={{ backgroundColor: 'rgba(80,200,120,0.08)', border: '1px solid rgba(80,200,120,0.2)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: 'rgba(80,200,120,0.15)', color: '#40A060' }}
                  >
                    #{partnerProfile.user_number}
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'rgba(60,140,80,0.6)' }}>FOUND</div>
                    <div className="font-semibold" style={{ color: '#2B5040' }}>{partnerProfile.username}</div>
                  </div>
                </div>
                <div style={{ color: '#40A060', fontSize: '1.2rem' }}>✓</div>
              </div>

              <motion.button
                onClick={handleCreate}
                disabled={creating}
                className="w-full mt-3 py-4 rounded-2xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #F06080 0%, #C040A0 100%)',
                  boxShadow: '0 4px 24px rgba(200,60,160,0.35)',
                  opacity: creating ? 0.7 : 1,
                  fontSize: '1rem',
                }}
                whileHover={!creating ? { scale: 1.02, y: -1 } : {}}
                whileTap={!creating ? { scale: 0.98 } : {}}
              >
                {creating ? 'Sending invite...' : `Invite ${partnerProfile.username} 💕`}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
