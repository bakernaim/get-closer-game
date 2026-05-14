import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'
import { useGameState } from './hooks/useGameState.js'
import { useRemoteGame } from './hooks/useRemoteGame.js'
import { useRemoteConnect4 } from './hooks/useRemoteConnect4.js'
import { useRemoteDama } from './hooks/useRemoteDama.js'
import { supabase } from './lib/supabase'
import Home from './pages/Home.jsx'
import AuthModal from './components/AuthModal.jsx'
import TopicSelection from './components/TopicSelection.jsx'
import GameBoard from './components/GameBoard.jsx'
import SavedCards from './components/SavedCards.jsx'
import Connect4 from './games/Connect4.jsx'
import Dama from './games/Dama.jsx'
import WaitingScreen from './components/WaitingScreen.jsx'
import InviteModal from './components/InviteModal.jsx'

const screenVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: [0.55, 0.055, 0.675, 0.19] } },
}

export default function App() {
  const { user, profile, loading: authLoading } = useAuth()

  // Local game state (unchanged flow)
  const [activeGame, setActiveGame] = useState(null)
  const localGame = useGameState()

  // Remote game state
  const [remoteSessionId, setRemoteSessionId] = useState(null)
  const [pendingInvite, setPendingInvite] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteGameType, setInviteGameType] = useState('card')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingOnlineGame, setPendingOnlineGame] = useState(null)

  // After login, auto-open invite modal if user was trying to play online
  useEffect(() => {
    if (user && pendingOnlineGame) {
      setInviteGameType(pendingOnlineGame)
      setPendingOnlineGame(null)
      setShowAuthModal(false)
      setShowInviteModal(true)
    }
  }, [user])

  const remoteGame      = useRemoteGame(remoteSessionId, user?.id)
  const remoteConnect4  = useRemoteConnect4(remoteSessionId, user?.id)
  const remoteDama      = useRemoteDama(remoteSessionId, user?.id)

  // Subscribe to incoming invites (sessions where I'm the guest and status = 'waiting')
  useEffect(() => {
    if (!user) { setPendingInvite(null); return }

    // Check for existing pending invites
    supabase
      .from('game_sessions')
      .select('*')
      .eq('guest_id', user.id)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setPendingInvite(data[0]) })

    // Listen for new invites in realtime
    const channel = supabase
      .channel(`invites:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_sessions', filter: `guest_id=eq.${user.id}` },
        (payload) => { if (payload.new.status === 'waiting') setPendingInvite(payload.new) },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `guest_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.status === 'waiting') setPendingInvite(payload.new)
          else if (pendingInvite?.id === payload.new.id) setPendingInvite(null)
        },
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user?.id])

  // When remote session transitions to topic_selection or playing, clear the pending invite
  useEffect(() => {
    if (remoteGame.session?.status && remoteGame.session.status !== 'waiting') {
      setPendingInvite(null)
    }
  }, [remoteGame.session?.status])

  function handleSelectGame(gameId) {
    setActiveGame(gameId)
    if (gameId === 'getCloser') localGame.gotoScreen('topics')
  }

  function handleBackToHome() {
    setActiveGame(null)
    setRemoteSessionId(null)
  }

  function handleLeaveRemoteGame() {
    setRemoteSessionId(null)
    setActiveGame(null)
  }

  async function handleAcceptInvite(invite) {
    const newStatus = invite.game_type === 'card' ? 'topic_selection' : 'playing'
    await supabase
      .from('game_sessions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', invite.id)
    setPendingInvite(null)
    setRemoteSessionId(invite.id)
    setActiveGame(`${invite.game_type ?? 'card'}-remote`)
  }

  function handleInviteCreated(session) {
    setShowInviteModal(false)
    setRemoteSessionId(session.id)
    setActiveGame(`${session.game_type ?? 'card'}-remote`)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  function handlePlayOnline(gameType) {
    if (!user) {
      setPendingOnlineGame(gameType)
      setShowAuthModal(true)
    } else {
      setInviteGameType(gameType)
      setShowInviteModal(true)
    }
  }

  const { session: rs } = remoteGame

  return (
    <div className="ambient-bg min-h-screen">
      <AnimatePresence mode="wait">

        {/* ── Home ─────────────────────────────────────────────── */}
        {activeGame === null && (
          <motion.div key="home" {...screenVariants} className="min-h-screen">
            <Home
              onSelectGame={handleSelectGame}
              onPlayOnline={handlePlayOnline}
              onSignIn={() => setShowAuthModal(true)}
              pendingInvite={pendingInvite}
              onAcceptInvite={handleAcceptInvite}
              onDeclineInvite={() => setPendingInvite(null)}
            />
          </motion.div>
        )}

        {/* ── Local: Let's Get Closer ───────────────────────────── */}
        {activeGame === 'getCloser' && localGame.state.screen === 'topics' && (
          <motion.div key="topics" {...screenVariants} className="min-h-screen">
            <TopicSelection {...localGame} onBack={handleBackToHome} />
          </motion.div>
        )}
        {activeGame === 'getCloser' && localGame.state.screen === 'game' && (
          <motion.div key="game" {...screenVariants} className="min-h-screen">
            <GameBoard {...localGame} />
          </motion.div>
        )}
        {activeGame === 'getCloser' && localGame.state.screen === 'saved' && (
          <motion.div key="saved" {...screenVariants} className="min-h-screen">
            <SavedCards {...localGame} />
          </motion.div>
        )}

        {/* ── Remote: Let's Get Closer ─────────────────────────── */}
        {activeGame === 'getCloser-remote' && (
          <motion.div key="remote" {...screenVariants} className="min-h-screen">
            <RemoteGameFlow
              remoteGame={remoteGame}
              myRole={remoteGame.myRole}
              partnerProfile={remoteGame.partnerProfile}
              onLeave={handleLeaveRemoteGame}
              profile={profile}
            />
          </motion.div>
        )}

        {/* ── Connect 4 local ───────────────────────────────────── */}
        {activeGame === 'connect4' && (
          <motion.div key="connect4" {...screenVariants} className="min-h-screen">
            <Connect4 onBack={handleBackToHome} />
          </motion.div>
        )}

        {/* ── Connect 4 remote ──────────────────────────────────── */}
        {activeGame === 'connect4-remote' && (
          <motion.div key="connect4-remote" {...screenVariants} className="min-h-screen">
            <RemoteGameWrapper
              session={remoteConnect4.session}
              loading={remoteConnect4.loading}
              myRole={remoteConnect4.myPlayer === 1 ? 'host' : 'guest'}
              partnerProfile={remoteConnect4.partnerProfile}
              profile={profile}
              onLeave={handleLeaveRemoteGame}
            >
              <Connect4
                onBack={handleLeaveRemoteGame}
                isRemote
                myPlayer={remoteConnect4.myPlayer}
                isMyTurn={remoteConnect4.isMyTurn}
                remoteState={remoteConnect4.remoteState}
                onRemoteDrop={remoteConnect4.dropCol}
                onPlayAgain={remoteConnect4.playAgain}
                partnerName={remoteConnect4.partnerProfile?.username ?? 'Partner'}
              />
            </RemoteGameWrapper>
          </motion.div>
        )}

        {/* ── Dama local ────────────────────────────────────────── */}
        {activeGame === 'dama' && (
          <motion.div key="dama" {...screenVariants} className="min-h-screen">
            <Dama onBack={handleBackToHome} />
          </motion.div>
        )}

        {/* ── Dama remote ───────────────────────────────────────── */}
        {activeGame === 'dama-remote' && (
          <motion.div key="dama-remote" {...screenVariants} className="min-h-screen">
            <RemoteGameWrapper
              session={remoteDama.session}
              loading={remoteDama.loading}
              myRole={remoteDama.myPlayer === 1 ? 'host' : 'guest'}
              partnerProfile={remoteDama.partnerProfile}
              profile={profile}
              onLeave={handleLeaveRemoteGame}
            >
              <Dama
                onBack={handleLeaveRemoteGame}
                isRemote
                myPlayer={remoteDama.myPlayer}
                isMyTurn={remoteDama.isMyTurn}
                remoteBoard={remoteDama.board}
                remoteTurn={remoteDama.turn}
                remoteScores={remoteDama.remoteState?.scores}
                remoteWinner={remoteDama.remoteState?.winner ?? null}
                remoteJumpPiece={remoteDama.jumpPiece}
                remoteSkipCells={remoteDama.skipCells}
                onRemoteMove={remoteDama.makeMove}
                onPlayAgain={remoteDama.playAgain}
                partnerName={remoteDama.partnerProfile?.username ?? 'Partner'}
              />
            </RemoteGameWrapper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite modal */}
      <AnimatePresence>
        {showInviteModal && user && (
          <InviteModal
            user={user}
            profile={profile}
            gameType={inviteGameType}
            onCreated={handleInviteCreated}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Auth modal (shown when guest tries to play online) */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            reason="online"
            onClose={() => { setShowAuthModal(false); setPendingOnlineGame(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Remote game sub-router ───────────────────────────────────────────────────
function RemoteGameFlow({ remoteGame, myRole, partnerProfile, onLeave, profile }) {
  const { session, loading, state } = remoteGame
  const partnerName = partnerProfile?.username ?? 'Partner'

  if (loading || !session) {
    return (
      <WaitingScreen
        title="Connecting..."
        subtitle="Setting up your game session."
        onLeave={onLeave}
      />
    )
  }

  // Host waiting for guest to accept
  if (session.status === 'waiting' && myRole === 'host') {
    return (
      <WaitingScreen
        title={`Waiting for ${partnerName}`}
        subtitle={`Ask them to open the app and accept your invite. Your number is #${profile?.user_number}.`}
        onLeave={onLeave}
      />
    )
  }

  // Guest waiting (shouldn't normally be in this state but just in case)
  if (session.status === 'waiting' && myRole === 'guest') {
    return (
      <WaitingScreen
        title="Joining game..."
        subtitle="Connecting you to the session."
        onLeave={onLeave}
      />
    )
  }

  // Topic selection — only host controls topics; guest waits
  if (session.status === 'topic_selection') {
    if (myRole === 'host') {
      return (
        <AnimatePresence mode="wait">
          <motion.div key="topics-remote" {...screenVariants} className="min-h-screen">
            <TopicSelection {...remoteGame} onBack={onLeave} />
          </motion.div>
        </AnimatePresence>
      )
    }
    return (
      <WaitingScreen
        title={`Waiting for ${partnerName}`}
        subtitle={`${partnerName} is choosing topics for your session.`}
        onLeave={onLeave}
      />
    )
  }

  // Game in progress
  if (session.status === 'playing') {
    if (state.screen === 'saved') {
      return (
        <AnimatePresence mode="wait">
          <motion.div key="saved-remote" {...screenVariants} className="min-h-screen">
            <SavedCards {...remoteGame} />
          </motion.div>
        </AnimatePresence>
      )
    }
    return (
      <AnimatePresence mode="wait">
        <motion.div key="game-remote" {...screenVariants} className="min-h-screen">
          <GameBoard
            {...remoteGame}
            isRemote
            isMyTurn={remoteGame.isMyTurn}
            partnerName={partnerName}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  // Finished
  return (
    <WaitingScreen
      title="Game over!"
      subtitle="You've drawn all the cards. Thanks for playing together."
      onLeave={onLeave}
    />
  )
}

// ── Wrapper for board games (Connect4 / Dama) — handles waiting state ────────
function RemoteGameWrapper({ session, loading, myRole, partnerProfile, profile, onLeave, children }) {
  const partnerName = partnerProfile?.username ?? 'Partner'

  if (loading || !session) {
    return <WaitingScreen title="Connecting..." subtitle="Setting up your game session." onLeave={onLeave} />
  }

  if (session.status === 'waiting' && myRole === 'host') {
    return (
      <WaitingScreen
        title={`Waiting for ${partnerName}`}
        subtitle={`Ask them to open the app and accept your invite. Your number is #${profile?.user_number}.`}
        onLeave={onLeave}
      />
    )
  }

  if (session.status === 'waiting' && myRole === 'guest') {
    return <WaitingScreen title="Joining game..." subtitle="Connecting you to the session." onLeave={onLeave} />
  }

  return children
}
