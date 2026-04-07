import { useReducer, useEffect, useCallback } from 'react'
import { shuffle } from '../utils/shuffle.js'
import { buildPerTopicDecks, TOPICS, TOPIC_ORDER } from '../data/questions.js'

const STORAGE_KEY = 'letsGetCloser_v2'
const MILESTONES = [5, 10, 15, 25, 50]

const defaultState = {
  screen: 'topics',           // 'topics' | 'game' | 'saved'
  selectedTopics: TOPIC_ORDER,
  topicDecks: {},             // { [topicId]: Card[] } — per-topic shuffled queues
  drawnCards: [],
  savedCards: [],
  currentCard: null,
  cardKey: 0,
  totalDrawn: 0,
  activeMilestone: null,
  showResumePrompt: false,
  showStatsModal: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_TOPIC': {
      const already = state.selectedTopics.includes(action.topicId)
      return {
        ...state,
        selectedTopics: already
          ? state.selectedTopics.filter(id => id !== action.topicId)
          : [...state.selectedTopics, action.topicId],
      }
    }
    case 'SELECT_ALL_TOPICS':
      return { ...state, selectedTopics: TOPIC_ORDER }
    case 'DESELECT_ALL_TOPICS':
      return { ...state, selectedTopics: [] }
    case 'APPLY_QUICK_FILTER':
      return { ...state, selectedTopics: action.topicIds }

    case 'START_GAME': {
      // Build per-topic shuffled decks
      const decks = buildPerTopicDecks(state.selectedTopics)
      const topicDecks = Object.fromEntries(
        Object.entries(decks).map(([id, cards]) => [id, shuffle(cards)])
      )
      return {
        ...state,
        screen: 'game',
        topicDecks,
        drawnCards: [],
        currentCard: null,
        cardKey: 0,
        totalDrawn: 0,
        activeMilestone: null,
        showResumePrompt: false,
      }
    }

    case 'RESUME_GAME':
      return { ...state, screen: 'game', showResumePrompt: false }

    case 'DRAW_CARD': {
      // action.topicId — draw from a specific topic
      const topicDeck = state.topicDecks[action.topicId]
      if (!topicDeck || topicDeck.length === 0) return state

      const [nextCard, ...remainingTopicDeck] = topicDeck
      const newTotalDrawn = state.totalDrawn + 1
      const milestone = MILESTONES.includes(newTotalDrawn) ? newTotalDrawn : null
      const newDrawnCards = state.currentCard
        ? [state.currentCard, ...state.drawnCards]
        : state.drawnCards

      return {
        ...state,
        topicDecks: {
          ...state.topicDecks,
          [action.topicId]: remainingTopicDeck,
        },
        drawnCards: newDrawnCards,
        currentCard: nextCard,
        cardKey: state.cardKey + 1,
        totalDrawn: newTotalDrawn,
        activeMilestone: milestone,
      }
    }

    case 'SKIP_CARD': {
      // Put current card back at end of its topic deck, clear currentCard
      if (!state.currentCard) return state
      const { topicId } = state.currentCard
      const topicDeck = state.topicDecks[topicId] ?? []
      return {
        ...state,
        topicDecks: {
          ...state.topicDecks,
          [topicId]: [...topicDeck, state.currentCard],
        },
        drawnCards: state.currentCard
          ? [state.currentCard, ...state.drawnCards]
          : state.drawnCards,
        currentCard: null,
        cardKey: state.cardKey + 1,
      }
    }

    case 'SAVE_CARD': {
      if (!state.currentCard) return state
      const alreadySaved = state.savedCards.some(c => c.id === state.currentCard.id)
      if (alreadySaved) return state
      return { ...state, savedCards: [state.currentCard, ...state.savedCards] }
    }
    case 'UNSAVE_CARD':
      return {
        ...state,
        savedCards: state.savedCards.filter(c => c.id !== action.cardId),
      }
    case 'CLEAR_MILESTONE':
      return { ...state, activeMilestone: null }
    case 'GOTO_SCREEN':
      return { ...state, screen: action.screen }
    case 'TOGGLE_STATS_MODAL':
      return { ...state, showStatsModal: !state.showStatsModal }
    case 'DISMISS_RESUME_PROMPT':
      return { ...state, showResumePrompt: false }
    default:
      return state
  }
}

function totalRemainingFromDecks(topicDecks) {
  return Object.values(topicDecks ?? {}).reduce((sum, arr) => sum + arr.length, 0)
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const remaining = totalRemainingFromDecks(parsed.topicDecks)
      return {
        ...defaultState,
        selectedTopics: parsed.selectedTopics ?? defaultState.selectedTopics,
        savedCards: parsed.savedCards ?? [],
        topicDecks: parsed.topicDecks ?? {},
        drawnCards: parsed.drawnCards ?? [],
        totalDrawn: parsed.totalDrawn ?? 0,
        showResumePrompt: remaining > 0,
      }
    }
  } catch { /* ignore */ }
  return defaultState
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, loadInitialState)

  const totalRemaining = totalRemainingFromDecks(state.topicDecks)

  useEffect(() => {
    const toSave = {
      selectedTopics: state.selectedTopics,
      topicDecks: state.topicDecks,
      drawnCards: state.drawnCards,
      savedCards: state.savedCards,
      totalDrawn: state.totalDrawn,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch { /* ignore quota errors */ }
  }, [state.selectedTopics, state.topicDecks, state.drawnCards, state.savedCards, state.totalDrawn])

  const isCardSaved = useCallback(
    (cardId) => state.savedCards.some(c => c.id === cardId),
    [state.savedCards]
  )

  const totalQuestionsSelected = state.selectedTopics.reduce((sum, id) => {
    return sum + (TOPICS[id]?.questions.length ?? 0)
  }, 0)

  const stats = {
    totalDrawn: state.totalDrawn,
    totalSaved: state.savedCards.length,
    remaining: totalRemaining,
    totalInDeck: totalRemaining + state.totalDrawn,
    perTopic: TOPIC_ORDER.reduce((acc, id) => {
      acc[id] = {
        drawn: state.drawnCards.filter(c => c.topicId === id).length,
        total: TOPICS[id]?.questions.length ?? 0,
        remaining: state.topicDecks[id]?.length ?? 0,
      }
      return acc
    }, {}),
  }

  return {
    state,
    dispatch,
    stats,
    isCardSaved,
    totalQuestionsSelected,
    totalRemaining,
    // Action helpers
    toggleTopic: (id) => dispatch({ type: 'TOGGLE_TOPIC', topicId: id }),
    selectAll: () => dispatch({ type: 'SELECT_ALL_TOPICS' }),
    deselectAll: () => dispatch({ type: 'DESELECT_ALL_TOPICS' }),
    applyFilter: (topicIds) => dispatch({ type: 'APPLY_QUICK_FILTER', topicIds }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    resumeGame: () => dispatch({ type: 'RESUME_GAME' }),
    drawCard: (topicId) => dispatch({ type: 'DRAW_CARD', topicId }),
    skipCard: () => dispatch({ type: 'SKIP_CARD' }),
    saveCard: () => dispatch({ type: 'SAVE_CARD' }),
    unsaveCard: (id) => dispatch({ type: 'UNSAVE_CARD', cardId: id }),
    clearMilestone: () => dispatch({ type: 'CLEAR_MILESTONE' }),
    gotoScreen: (screen) => dispatch({ type: 'GOTO_SCREEN', screen }),
    toggleStats: () => dispatch({ type: 'TOGGLE_STATS_MODAL' }),
    dismissResume: () => dispatch({ type: 'DISMISS_RESUME_PROMPT' }),
  }
}
