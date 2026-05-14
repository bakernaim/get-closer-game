import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── Turkish Dama pure functions (mirrored from Dama.jsx) ─────────────────────
const isP1     = v => v === 1 || v === 3
const isP2     = v => v === 2 || v === 4
const isKing   = v => v === 3 || v === 4
const owns     = (v, p) => p === 1 ? isP1(v) : isP2(v)
const isEnemy  = (v, p) => p === 1 ? isP2(v) : isP1(v)
const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8
const ORTHO    = [[-1, 0], [1, 0], [0, -1], [0, 1]]

function walkDirs(v) {
  if (v === 3 || v === 4) return ORTHO
  if (v === 1) return [[-1, 0], [0, -1], [0, 1]]
  if (v === 2) return [[1, 0], [0, -1], [0, 1]]
  return []
}

function jumpsFrom(board, r, c, player, skip = []) {
  const v = board[r][c]
  const result = []
  if (isKing(v)) {
    for (const [dr, dc] of ORTHO) {
      let nr = r + dr, nc = c + dc, enemyPos = null
      while (inBounds(nr, nc)) {
        const cell = board[nr][nc]
        if (cell === 0) {
          if (enemyPos && !skip.some(([sr, sc]) => sr === enemyPos[0] && sc === enemyPos[1]))
            result.push({ toR: nr, toC: nc, capR: enemyPos[0], capC: enemyPos[1] })
        } else if (isEnemy(cell, player)) {
          if (enemyPos) break
          enemyPos = [nr, nc]
        } else break
        nr += dr; nc += dc
      }
    }
  } else {
    for (const [dr, dc] of walkDirs(v)) {
      const er = r + dr, ec = c + dc, lr = r + 2 * dr, lc = c + 2 * dc
      if (!inBounds(er, ec) || !inBounds(lr, lc)) continue
      if (!isEnemy(board[er][ec], player)) continue
      if (board[lr][lc] !== 0) continue
      if (skip.some(([sr, sc]) => sr === er && sc === ec)) continue
      result.push({ toR: lr, toC: lc, capR: er, capC: ec })
    }
  }
  return result
}

function walksFrom(board, r, c) {
  const v = board[r][c]
  const result = []
  if (isKing(v)) {
    for (const [dr, dc] of ORTHO) {
      let nr = r + dr, nc = c + dc
      while (inBounds(nr, nc) && board[nr][nc] === 0) {
        result.push({ toR: nr, toC: nc, capR: null, capC: null })
        nr += dr; nc += dc
      }
    }
  } else {
    for (const [dr, dc] of walkDirs(v)) {
      const nr = r + dr, nc = c + dc
      if (inBounds(nr, nc) && board[nr][nc] === 0)
        result.push({ toR: nr, toC: nc, capR: null, capC: null })
    }
  }
  return result
}

function anyJumps(board, player) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (owns(board[r][c], player) && jumpsFrom(board, r, c, player).length > 0) return true
  return false
}

function hasMoves(board, player) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      if (!owns(board[r][c], player)) continue
      if (jumpsFrom(board, r, c, player).length > 0) return true
      if (walksFrom(board, r, c).length > 0) return true
    }
  return false
}

function applyMove(board, fr, fc, tr, tc, capR, capC) {
  const next = board.map(row => [...row])
  const v = next[fr][fc]
  next[fr][fc] = 0
  if (capR != null) next[capR][capC] = 0
  let nv = v
  if (v === 1 && tr === 0) nv = 3
  if (v === 2 && tr === 7) nv = 4
  next[tr][tc] = nv
  return next
}

function createDamaBoard() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(0))
  for (let c = 0; c < 8; c++) {
    b[1][c] = 2; b[2][c] = 2
    b[5][c] = 1; b[6][c] = 1
  }
  return b
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export { anyJumps, jumpsFrom, walksFrom, owns, createDamaBoard }

export function useRemoteDama(sessionId, userId) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [partnerProfile, setPartnerProfile] = useState(null)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)

    supabase.from('game_sessions').select('*').eq('id', sessionId).single()
      .then(({ data }) => { setSession(data); setLoading(false) })

    const channel = supabase
      .channel(`dama:${sessionId}`)
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
  const board = gs.board ?? null
  const turn = gs.turn ?? 1
  const jumpPiece = gs.jumpPiece ?? null
  const skipCells = gs.skipCells ?? []

  const isMyTurn =
    turn === myPlayer &&
    gs.winner == null &&
    session?.status === 'playing'

  async function updateGs(newGs) {
    await supabase
      .from('game_sessions')
      .update({ game_state: newGs, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
  }

  const makeMove = useCallback(async (fr, fc, m) => {
    if (!session || !isMyTurn || !board) return
    const nb = applyMove(board, fr, fc, m.toR, m.toC, m.capR, m.capC)

    const wasPromoted =
      (nb[m.toR][m.toC] === 3 && board[fr][fc] === 1) ||
      (nb[m.toR][m.toC] === 4 && board[fr][fc] === 2)

    if (m.capR != null && !wasPromoted) {
      const newSkip = [...skipCells, [m.capR, m.capC]]
      const more = jumpsFrom(nb, m.toR, m.toC, myPlayer, newSkip)
      if (more.length > 0) {
        await updateGs({ ...gs, board: nb, jumpPiece: [m.toR, m.toC], skipCells: newSkip })
        return
      }
    }

    const next = myPlayer === 1 ? 2 : 1
    if (!hasMoves(nb, next)) {
      await updateGs({
        ...gs,
        board: nb,
        turn: myPlayer,
        jumpPiece: null,
        skipCells: [],
        winner: myPlayer,
        scores: { ...gs.scores, [myPlayer]: (gs.scores?.[myPlayer] ?? 0) + 1 },
      })
    } else {
      await updateGs({ ...gs, board: nb, turn: next, jumpPiece: null, skipCells: [] })
    }
  }, [session, isMyTurn, board, gs, myPlayer, skipCells])

  const playAgain = useCallback(async () => {
    if (!session) return
    await updateGs({
      board: createDamaBoard(),
      turn: 1,
      scores: gs.scores ?? { 1: 0, 2: 0 },
      winner: null,
      jumpPiece: null,
      skipCells: [],
    })
  }, [session, gs.scores])

  return {
    session,
    loading,
    remoteState: gs,
    board,
    turn,
    jumpPiece,
    skipCells,
    myPlayer,
    isMyTurn,
    isHost: session?.host_id === userId,
    partnerProfile,
    makeMove,
    playAgain,
  }
}
