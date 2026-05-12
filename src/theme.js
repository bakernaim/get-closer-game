// ─── Central Theme ───────────────────────────────────────────────────────────
// Change colors here to reskin the entire app.

export const theme = {
  // ── App-wide palette ────────────────────────────────────────────────────
  app: {
    bg: '#FFF8FA',                           // Page background
    accent: '#D94078',                        // Primary brand accent (rose-pink)
    accentBright: '#F0508A',                  // Hover / highlight variant
    accentLight: 'rgba(217,64,120,0.12)',     // Accent with low opacity
    accentGlow: '0 8px 28px rgba(217,64,120,0.40)',
    text: '#28183C',                          // Primary body text
    textSub: '#7055A8',                       // Secondary / label text
    textMuted: 'rgba(110,88,160,0.45)',       // Placeholder / muted
    border: 'rgba(120,90,160,0.14)',          // Subtle borders
    borderStrong: 'rgba(120,90,160,0.28)',    // Visible borders
    pill: 'rgba(140,100,200,0.10)',           // Neutral pill background
  },

  // ── Let's Get Closer card game ──────────────────────────────────────────
  getCloser: {
    // Home card
    homeBg: 'linear-gradient(135deg, #7A1A3A 0%, #48091A 100%)',
    homeGlow: 'rgba(230,90,130,0.30)',
    homeAccent: '#FF6080',
    homeAccentDim: 'rgba(255,96,128,0.18)',
    homeBtnBg: 'linear-gradient(135deg, #D44070 0%, #8E2848 100%)',
    homeBtnShadow: '0 8px 28px rgba(212,64,112,0.55)',
    // Playing card faces
    cardFront: 'linear-gradient(150deg, #F8F3EE 0%, #F0EAE2 100%)',
    cardBack: 'linear-gradient(150deg, #F5E6D3 0%, #E8D5C4 50%, #DCC9B8 100%)',
  },

  // ── Connect 4 ───────────────────────────────────────────────────────────
  connect4: {
    // Home card
    homeBg: 'linear-gradient(135deg, #0D2C5C 0%, #071428 100%)',
    homeGlow: 'rgba(70,130,220,0.30)',
    homeAccent: '#60AAFF',
    homeAccentDim: 'rgba(96,170,255,0.18)',
    homeBtnBg: 'linear-gradient(135deg, #3878CC 0%, #1B4898 100%)',
    homeBtnShadow: '0 8px 28px rgba(56,120,204,0.55)',
    // In-game board
    boardBg: 'linear-gradient(160deg, #1A2A4A 0%, #0D1828 100%)',
    // Players
    p1: { disc: '#FF5060', glow: 'rgba(255,80,96,0.7)',  shadow: 'rgba(255,80,96,0.45)',  dim: 'rgba(255,80,96,0.15)',  label: 'Player 1' },
    p2: { disc: '#FFB828', glow: 'rgba(255,184,40,0.7)', shadow: 'rgba(255,184,40,0.45)', dim: 'rgba(255,184,40,0.15)', label: 'Player 2' },
  },

  // ── Dama ────────────────────────────────────────────────────────────────
  dama: {
    // Home card
    homeBg: 'linear-gradient(135deg, #3C1208 0%, #200804 100%)',
    homeGlow: 'rgba(240,80,55,0.24)',
    homeAccent: '#FF8860',
    homeAccentDim: 'rgba(255,136,96,0.18)',
    homeBtnBg: 'linear-gradient(135deg, #C02818 0%, #820E08 100%)',
    homeBtnShadow: '0 8px 28px rgba(192,40,24,0.55)',
    // In-game board
    boardBg: 'linear-gradient(160deg, #3A1E08 0%, #250E02 100%)',
    tileLight: '#C89040',
    tileDark: '#2C1204',
    // Players
    p1: { disc: '#FF3850', glow: 'rgba(255,56,80,0.7)',   shadow: 'rgba(255,56,80,0.4)',   dim: 'rgba(255,56,80,0.15)'  },
    p2: { disc: '#FFD060', glow: 'rgba(255,208,96,0.7)',  shadow: 'rgba(255,208,96,0.4)',  dim: 'rgba(255,208,96,0.15)' },
  },
}
