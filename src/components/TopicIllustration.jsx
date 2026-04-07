// Inline SVG illustrations for each topic — abstract, soft shapes using topic color

const illustrations = {
  thisOrThat: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="65" fill={color} fillOpacity="0.2" />
      <path d="M60 100 Q100 55 140 100 Q100 145 60 100Z" fill={color} fillOpacity="0.45" />
      <circle cx="78" cy="88" r="14" fill={color} fillOpacity="0.7" />
      <circle cx="122" cy="112" r="14" fill={color} fillOpacity="0.7" />
      <line x1="100" y1="40" x2="100" y2="160" stroke={color} strokeWidth="2" strokeOpacity="0.3" />
    </svg>
  ),

  dreams: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 30 L108 68 L148 68 L116 90 L128 128 L100 106 L72 128 L84 90 L52 68 L92 68Z"
            fill={color} fillOpacity="0.55" />
      <circle cx="48" cy="48" r="10" fill={color} fillOpacity="0.35" />
      <circle cx="160" cy="145" r="8" fill={color} fillOpacity="0.35" />
      <circle cx="162" cy="55" r="5" fill={color} fillOpacity="0.55" />
      <circle cx="40" cy="155" r="6" fill={color} fillOpacity="0.4" />
    </svg>
  ),

  childhood: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="90" r="45" fill={color} fillOpacity="0.3" />
      <circle cx="60" cy="130" r="25" fill={color} fillOpacity="0.25" />
      <circle cx="145" cy="125" r="30" fill={color} fillOpacity="0.2" />
      <path d="M75 85 Q100 60 125 85" stroke={color} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" fill="none" />
      <circle cx="85" cy="88" r="6" fill={color} fillOpacity="0.8" />
      <circle cx="115" cy="88" r="6" fill={color} fillOpacity="0.8" />
    </svg>
  ),

  love: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 158 C100 158 32 115 32 72 C32 50 48 38 68 38 C82 38 94 46 100 58 C106 46 118 38 132 38 C152 38 168 50 168 72 C168 115 100 158 100 158Z"
            fill={color} fillOpacity="0.5" />
      <path d="M100 138 C100 138 52 107 52 80 C52 66 63 57 77 59 C88 61 97 70 100 79 C103 70 112 61 123 59 C137 57 148 66 148 80 C148 107 100 138 100 138Z"
            fill={color} fillOpacity="0.3" />
      <circle cx="55" cy="55" r="8" fill={color} fillOpacity="0.25" />
      <circle cx="148" cy="158" r="6" fill={color} fillOpacity="0.2" />
    </svg>
  ),

  secrets: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="60" fill={color} fillOpacity="0.25" />
      <circle cx="100" cy="100" r="40" fill={color} fillOpacity="0.2" />
      <circle cx="100" cy="100" r="20" fill={color} fillOpacity="0.45" />
      <path d="M60 60 L80 80" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
      <path d="M140 60 L120 80" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
      <path d="M100 160 L100 140" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
    </svg>
  ),

  fantasy: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 30 Q130 70 170 65 Q145 95 165 130 Q130 120 100 155 Q70 120 35 130 Q55 95 30 65 Q70 70 100 30Z"
            fill={color} fillOpacity="0.4" />
      <circle cx="100" cy="100" r="18" fill={color} fillOpacity="0.6" />
      <circle cx="55" cy="55" r="7" fill={color} fillOpacity="0.45" />
      <circle cx="148" cy="50" r="5" fill={color} fillOpacity="0.45" />
      <circle cx="152" cy="148" r="6" fill={color} fillOpacity="0.4" />
      <circle cx="48" cy="145" r="4" fill={color} fillOpacity="0.4" />
    </svg>
  ),

  values: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 40 L100 160 M40 100 L160 100" stroke={color} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.3" />
      <circle cx="100" cy="100" r="45" fill={color} fillOpacity="0.2" />
      <circle cx="100" cy="100" r="25" fill={color} fillOpacity="0.3" />
      <circle cx="100" cy="100" r="10" fill={color} fillOpacity="0.6" />
      <circle cx="100" cy="55" r="6" fill={color} fillOpacity="0.4" />
      <circle cx="100" cy="145" r="6" fill={color} fillOpacity="0.4" />
      <circle cx="55" cy="100" r="6" fill={color} fillOpacity="0.4" />
      <circle cx="145" cy="100" r="6" fill={color} fillOpacity="0.4" />
    </svg>
  ),

  funny: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="95" r="55" fill={color} fillOpacity="0.35" />
      <circle cx="80" cy="85" r="8" fill={color} fillOpacity="0.8" />
      <circle cx="120" cy="85" r="8" fill={color} fillOpacity="0.8" />
      <path d="M72 112 Q100 138 128 112" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
      <path d="M45 45 Q55 35 65 45" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.4" />
      <path d="M135 45 Q145 35 155 45" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.4" />
    </svg>
  ),

  physical: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 158 C100 158 32 118 32 75 C32 53 48 40 68 40 C82 40 94 49 100 61 C106 49 118 40 132 40 C152 40 168 53 168 75 C168 118 100 158 100 158Z"
            fill={color} fillOpacity="0.4" />
      <path d="M60 80 C60 80 70 95 85 95 C95 95 100 85 100 85 C100 85 105 95 115 95 C130 95 140 80 140 80"
            stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
      <circle cx="50" cy="148" r="8" fill={color} fillOpacity="0.2" />
      <circle cx="155" cy="55" r="6" fill={color} fillOpacity="0.2" />
    </svg>
  ),

  future: ({ color }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 160 Q60 80 100 50 Q140 80 160 160" fill={color} fillOpacity="0.2" />
      <path d="M60 160 Q75 100 100 75 Q125 100 140 160" fill={color} fillOpacity="0.25" />
      <path d="M80 160 Q90 120 100 105 Q110 120 120 160" fill={color} fillOpacity="0.35" />
      <circle cx="100" cy="90" r="12" fill={color} fillOpacity="0.6" />
      <circle cx="100" cy="58" r="7" fill={color} fillOpacity="0.7" />
      <circle cx="100" cy="35" r="4" fill={color} fillOpacity="0.5" />
    </svg>
  ),
}

export default function TopicIllustration({ topicId, color, className = '' }) {
  const Illustration = illustrations[topicId]
  if (!Illustration) return null
  return (
    <div className={className} aria-hidden="true">
      <Illustration color={color} />
    </div>
  )
}
