import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ROWS = 6, COLS = 7

function dropDisc(board, col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      const next = board.map(r => [...r])
      next[row][col] = player
      return { board: next, row }
    }
  }
  return null
}

function checkWin(board, row, col, player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (const [dr, dc] of dirs) {
    let count = 1
    for (const m of [1, -1]) {
      let r = row + dr * m, c = col + dc * m
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++; r += dr * m; c += dc * m
      }
    }
    if (count >= 4) return true
  }
  return false
}

function getWinningCells(board) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const p = board[row][col]
      if (!p) continue
      for (const [dr, dc] of dirs) {
        const cells = [[row, col]]
        for (let i = 1; i < 4; i++) {
          const r = row + dr * i, c = col + dc * i
          if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== p) break
          cells.push([r, c])
        }
        if (cells.length === 4) return cells
      }
    }
  }
  return []
}

function isBoardFull(board) {
  return board[0].every(cell => cell !== 0)
}

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

export function useRemoteConnect4(sessionId, userId) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [partnerProfile, setPartnerProfile] = useState(null)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)

    supabase.from('game_sessions').select('*').eq('id', sessionId).single()
      .then(({ data }) => { setSession(data); setLoading(false) })

    const channel = supabase
      .channel(`c4:${sessionId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => setSession(payload.new),
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId])

  useEffect(() => {
    if (!session || !userId) return
    const partnerId = session.host_id === userId ? session.guest_id : session.host_id
    if (!partnerId) return
    supabase.from('profiles').select('username, user_number').eq('id', partnerId).single()
      .then(({ data }) => setPartnerProfile(data))
  }, [session?.host_id, session?.guest_id, userId])

  const myPlayer = session?.host_id === userId ? 1 : 2
  const gs = session?.game_state ?? {}

  const isMyTurn =
    (gs.currentPlayer ?? 1) === myPlayer &&
    gs.winner == null &&
    session?.status === 'playing'

  async function updateGs(newGs) {
    await supabase
      .from('game_sessions')
      .update({ game_state: newGs, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
  }

  const dropCol = useCallback(async (col) => {
    if (!session || !isMyTurn) return
    const board = gs.board
    if (!board || board[0][col] !== 0) return

    const result = dropDisc(board, col, myPlayer)
    if (!result) return

    const { board: newBoard, row } = result

    if (checkWin(newBoard, row, col, myPlayer)) {
      await updateGs({
        ...gs,
        board: newBoard,
        winner: myPlayer,
        winCells: getWinningCells(newBoard),
        scores: { ...gs.scores, [myPlayer]: (gs.scores?.[myPlayer] ?? 0) + 1 },
      })
    } else if (isBoardFull(newBoard)) {
      await updateGs({ ...gs, board: newBoard, winner: 0 })
    } else {
      await updateGs({ ...gs, board: newBoard, currentPlayer: myPlayer === 1 ? 2 : 1 })
    }
  }, [session, isMyTurn, gs, myPlayer])

  const playAgain = useCallback(async () => {
    if (!session) return
    await updateGs({
      board: emptyBoard(),
      currentPlayer: 1,
      scores: gs.scores ?? { 1: 0, 2: 0 },
      winner: null,
      winCells: [],
    })
  }, [session, gs.scores])

  return {
    session,
    loading,
    remoteState: gs,
    myPlayer,
    isMyTurn,
    isHost: session?.host_id === userId,
    partnerProfile,
    dropCol,
    playAgain,
  }
}
