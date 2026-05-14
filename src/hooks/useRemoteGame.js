import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { buildPerTopicDecks, TOPICS, TOPIC_ORDER } from '../data/questions'
import { shuffle } from '../utils/shuffle'

const MILESTONES = [5, 10, 15, 25, 50]

export function useRemoteGame(sessionId, userId) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeMilestone, setActiveMilestone] = useState(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [partnerProfile, setPartnerProfile] = useState(null)

  // Fetch session + subscribe to realtime changes
  useEffect(() => {
    if (!sessionId) return
    setLoading(true)

    supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data }) => {
        setSession(data)
        setLoading(false)
      })

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => setSession(payload.new),
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  // Fetch partner's profile
  useEffect(() => {
    if (!session || !userId) return
    const partnerId = session.host_id === userId ? session.guest_id : session.host_id
    if (!partnerId) return
    supabase
      .from('profiles')
      .select('username, user_number')
      .eq('id', partnerId)
      .single()
      .then(({ data }) => setPartnerProfile(data))
  }, [session?.host_id, session?.guest_id, userId])

  const myRole = session?.host_id === userId ? 'host' : 'guest'
  const isMyTurn = session?.current_turn === myRole

  async function updateSession(updates) {
    if (!session) return
    await supabase
      .from('game_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', session.id)
  }

  // Map Supabase session to the state shape that GameBoard + TopicSelection expect
  const state = session
    ? {
        screen: session.status === 'playing' ? 'game' : 'topics',
        selectedTopics: session.selected_topics ?? [],
        topicDecks: session.topic_decks ?? {},
        drawnCards: session.drawn_cards ?? [],
        savedCards: session.saved_cards ?? [],
        currentCard: session.current_card ?? null,
        cardKey: session.card_key ?? 0,
        totalDrawn: session.total_drawn ?? 0,
        activeMilestone,
        showResumePrompt: false,
        showStatsModal,
      }
    : null

  // ── Actions (only host can change topics) ───────────────────────────────────

  const toggleTopic = useCallback((id) => {
    if (!session || myRole !== 'host') return
    const selected = session.selected_topics ?? []
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id]
    updateSession({ selected_topics: next })
  }, [session, myRole])

  const selectAll = useCallback(() => {
    if (myRole !== 'host') return
    updateSession({ selected_topics: TOPIC_ORDER })
  }, [myRole, session])

  const deselectAll = useCallback(() => {
    if (myRole !== 'host') return
    updateSession({ selected_topics: [] })
  }, [myRole, session])

  const applyFilter = useCallback((topicIds) => {
    if (myRole !== 'host') return
    updateSession({ selected_topics: topicIds })
  }, [myRole, session])

  const startGame = useCallback(() => {
    if (!session || myRole !== 'host') return
    const decks = buildPerTopicDecks(session.selected_topics ?? [])
    const topicDecks = Object.fromEntries(
      Object.entries(decks).map(([id, cards]) => [id, shuffle(cards)]),
    )
    updateSession({ status: 'playing', topic_decks: topicDecks, current_turn: 'host' })
  }, [session, myRole])

  const drawCard = useCallback((topicId) => {
    if (!session || !isMyTurn) return
    const topicDeck = (session.topic_decks ?? {})[topicId]
    if (!topicDeck?.length) return

    const [nextCard, ...remaining] = topicDeck
    const newTotal = (session.total_drawn ?? 0) + 1
    const milestone = MILESTONES.includes(newTotal) ? newTotal : null
    const newDrawnCards = session.current_card
      ? [session.current_card, ...(session.drawn_cards ?? [])]
      : (session.drawn_cards ?? [])

    if (milestone) setActiveMilestone(milestone)

    updateSession({
      topic_decks: { ...session.topic_decks, [topicId]: remaining },
      current_card: nextCard,
      drawn_cards: newDrawnCards,
      total_drawn: newTotal,
      card_key: (session.card_key ?? 0) + 1,
      current_turn: myRole === 'host' ? 'guest' : 'host',
    })
  }, [session, isMyTurn, myRole])

  const skipCard = useCallback(() => {
    if (!session || !isMyTurn || !session.current_card) return
    const { topicId } = session.current_card
    const topicDeck = (session.topic_decks ?? {})[topicId] ?? []
    const newDrawnCards = session.current_card
      ? [session.current_card, ...(session.drawn_cards ?? [])]
      : (session.drawn_cards ?? [])
    updateSession({
      topic_decks: { ...session.topic_decks, [topicId]: [...topicDeck, session.current_card] },
      drawn_cards: newDrawnCards,
      current_card: null,
      card_key: (session.card_key ?? 0) + 1,
      current_turn: myRole === 'host' ? 'guest' : 'host',
    })
  }, [session, isMyTurn, myRole])

  const saveCard = useCallback(() => {
    if (!session?.current_card) return
    const already = (session.saved_cards ?? []).some((c) => c.id === session.current_card.id)
    if (already) return
    updateSession({ saved_cards: [session.current_card, ...(session.saved_cards ?? [])] })
  }, [session])

  const unsaveCard = useCallback((cardId) => {
    if (!session) return
    updateSession({ saved_cards: (session.saved_cards ?? []).filter((c) => c.id !== cardId) })
  }, [session])

  const gotoScreen = useCallback((screen) => {
    if (!session) return
    if (screen === 'topics') updateSession({ status: 'topic_selection' })
  }, [session])

  const clearMilestone = useCallback(() => setActiveMilestone(null), [])
  const toggleStats = useCallback(() => setShowStatsModal((v) => !v), [])

  // ── Computed values ──────────────────────────────────────────────────────────

  const totalRemaining = Object.values(session?.topic_decks ?? {}).reduce(
    (sum, arr) => sum + arr.length,
    0,
  )

  const isCardSaved = useCallback(
    (cardId) => (session?.saved_cards ?? []).some((c) => c.id === cardId),
    [session?.saved_cards],
  )

  const totalQuestionsSelected = (session?.selected_topics ?? []).reduce(
    (sum, id) => sum + (TOPICS[id]?.questions.length ?? 0),
    0,
  )

  const stats = {
    totalDrawn: session?.total_drawn ?? 0,
    totalSaved: (session?.saved_cards ?? []).length,
    remaining: totalRemaining,
    totalInDeck: totalRemaining + (session?.total_drawn ?? 0),
    perTopic: TOPIC_ORDER.reduce((acc, id) => {
      acc[id] = {
        drawn: (session?.drawn_cards ?? []).filter((c) => c.topicId === id).length,
        total: TOPICS[id]?.questions.length ?? 0,
        remaining: (session?.topic_decks ?? {})[id]?.length ?? 0,
      }
      return acc
    }, {}),
  }

  return {
    session,
    loading,
    state,
    stats,
    isCardSaved,
    totalQuestionsSelected,
    totalRemaining,
    myRole,
    isMyTurn,
    partnerProfile,
    // Actions
    toggleTopic,
    selectAll,
    deselectAll,
    applyFilter,
    startGame,
    resumeGame: () => {},
    drawCard,
    skipCard,
    saveCard,
    unsaveCard,
    clearMilestone,
    gotoScreen,
    toggleStats,
    dismissResume: () => {},
    dispatch: () => {},
  }
}
