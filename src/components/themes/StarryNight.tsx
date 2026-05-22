/** Starry Night — original SVG artwork. Deep night sky, great for dark mode. */
export default function StarryNight() {
  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06082A" />
          <stop offset="50%" stopColor="#0D1145" />
          <stop offset="100%" stopColor="#1A1848" />
        </linearGradient>
        <radialGradient id="sn-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF8E8" />
          <stop offset="60%" stopColor="#FFEEC0" />
          <stop offset="100%" stopColor="#FFD88A" />
        </radialGradient>
        <radialGradient id="sn-glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4040B0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4040B0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sn-glow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2060A0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2060A0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sn-glow3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#603080" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#603080" stopOpacity="0" />
        </radialGradient>
        <filter id="sn-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="sn-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Sky */}
      <rect width="1440" height="900" fill="url(#sn-sky)" />

      {/* Nebula clouds */}
      <ellipse cx="400" cy="200" rx="280" ry="180" fill="url(#sn-glow1)" />
      <ellipse cx="900" cy="300" rx="320" ry="200" fill="url(#sn-glow2)" />
      <ellipse cx="1200" cy="160" rx="240" ry="150" fill="url(#sn-glow3)" />
      <ellipse cx="200" cy="500" rx="200" ry="140" fill="url(#sn-glow2)" opacity="0.6" />
      <ellipse cx="1100" cy="550" rx="260" ry="160" fill="url(#sn-glow1)" opacity="0.5" />

      {/* Moon (crescent) */}
      <g transform="translate(260, 140)">
        {/* Full moon glow */}
        <circle cx="0" cy="0" r="80" fill="#FFEEC0" opacity="0.12" />
        <circle cx="0" cy="0" r="60" fill="#FFEEC0" opacity="0.15" />
        {/* Moon disc */}
        <circle cx="0" cy="0" r="52" fill="url(#sn-moon)" />
        {/* Crescent shadow to create crescent shape */}
        <circle cx="22" cy="-8" r="44" fill="#0A0C28" />
        {/* Moon surface details */}
        <circle cx="-15" cy="-18" r="6" fill="#E8D8A0" opacity="0.4" />
        <circle cx="-22" cy="10" r="4" fill="#E8D8A0" opacity="0.35" />
        <circle cx="-8" cy="22" r="3" fill="#E8D8A0" opacity="0.3" />
      </g>

      {/* Shooting star */}
      <g transform="translate(900, 80) rotate(-30)">
        <line x1="0" y1="0" x2="-180" y2="0" stroke="white" strokeWidth="2.5"
          strokeLinecap="round" opacity="0.85"
          style={{ filter: 'blur(1px)' }} />
        <circle cx="0" cy="0" r="4" fill="white" opacity="0.95" />
        <line x1="0" y1="0" x2="-120" y2="0" stroke="white" strokeWidth="1.5"
          strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Shooting star 2 (smaller) */}
      <g transform="translate(1200, 350) rotate(-25)">
        <line x1="0" y1="0" x2="-100" y2="0" stroke="#AACCFF" strokeWidth="1.8"
          strokeLinecap="round" opacity="0.75" />
        <circle cx="0" cy="0" r="3" fill="#CCDDFF" opacity="0.9" />
      </g>

      {/* Stars — many sizes and brightnesses */}
      {[
        // [x, y, r, opacity]
        [80, 80, 2.5, 0.95], [140, 180, 1.8, 0.8], [200, 60, 3, 0.9],
        [320, 40, 2, 0.85], [380, 130, 1.5, 0.75], [460, 70, 2.8, 0.9],
        [520, 200, 2, 0.8], [580, 50, 1.8, 0.85], [640, 140, 3.2, 0.95],
        [700, 80, 1.5, 0.75], [760, 200, 2.2, 0.85], [820, 60, 1.8, 0.8],
        [860, 160, 3, 0.9], [960, 40, 2, 0.85], [1020, 180, 2.5, 0.9],
        [1080, 80, 1.8, 0.8], [1140, 220, 2, 0.85], [1200, 60, 3, 0.9],
        [1260, 140, 1.5, 0.75], [1340, 80, 2.8, 0.9], [1400, 200, 2, 0.8],
        [100, 300, 1.8, 0.7], [180, 380, 2.5, 0.85], [240, 280, 1.5, 0.75],
        [350, 350, 2, 0.8], [440, 320, 1.8, 0.7], [500, 400, 2.2, 0.85],
        [600, 280, 1.5, 0.75], [660, 380, 2, 0.8], [740, 310, 3, 0.9],
        [800, 420, 1.8, 0.75], [880, 360, 2.5, 0.85], [940, 280, 1.5, 0.7],
        [1010, 400, 2, 0.8], [1060, 320, 1.8, 0.75], [1150, 380, 2.5, 0.85],
        [1220, 300, 1.5, 0.7], [1300, 380, 2, 0.8], [1380, 320, 1.8, 0.75],
        [60, 500, 2, 0.75], [150, 560, 1.5, 0.7], [250, 480, 2.5, 0.85],
        [320, 600, 1.8, 0.75], [420, 540, 2, 0.8], [500, 620, 1.5, 0.7],
        [580, 500, 2.2, 0.8], [680, 580, 1.8, 0.75], [740, 500, 2.5, 0.85],
        [820, 620, 1.5, 0.7], [900, 540, 2, 0.8], [980, 600, 1.8, 0.75],
        [1060, 520, 2.5, 0.85], [1140, 600, 1.5, 0.7], [1220, 540, 2, 0.8],
        [1300, 600, 1.8, 0.75], [1400, 540, 2.2, 0.8],
        [80, 700, 1.5, 0.7], [200, 760, 2, 0.75], [300, 700, 1.8, 0.7],
        [420, 780, 2.5, 0.8], [520, 720, 1.5, 0.65], [620, 800, 2, 0.75],
        [740, 740, 1.8, 0.7], [840, 800, 2.2, 0.8], [960, 740, 1.5, 0.65],
        [1060, 800, 2, 0.75], [1180, 740, 1.8, 0.7], [1280, 800, 2.5, 0.8],
        [1400, 760, 1.5, 0.7],
      ].map(([x, y, r, op], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={op} />
      ))}

      {/* Bright sparkle stars — 4-point */}
      {[
        [640, 140, 6, 0.9, '#FFFFFF'],
        [1020, 180, 5, 0.85, '#E8F0FF'],
        [200, 60, 5, 0.9, '#FFFFFF'],
        [1340, 80, 6, 0.88, '#F8F8FF'],
        [740, 310, 7, 0.95, '#FFFFFF'],
        [500, 400, 5, 0.85, '#E8EEFF'],
      ].map(([x, y, s, op, c], i) => (
        <g key={i}>
          <line x1={Number(x) - Number(s)} y1={y as number} x2={Number(x) + Number(s)} y2={y as number}
            stroke={String(c)} strokeWidth="1.5" opacity={Number(op)} />
          <line x1={x as number} y1={Number(y) - Number(s)} x2={x as number} y2={Number(y) + Number(s)}
            stroke={String(c)} strokeWidth="1.5" opacity={Number(op)} />
          <line x1={Number(x) - Number(s) * 0.6} y1={Number(y) - Number(s) * 0.6}
            x2={Number(x) + Number(s) * 0.6} y2={Number(y) + Number(s) * 0.6}
            stroke={String(c)} strokeWidth="1" opacity={Number(op) * 0.7} />
          <line x1={Number(x) + Number(s) * 0.6} y1={Number(y) - Number(s) * 0.6}
            x2={Number(x) - Number(s) * 0.6} y2={Number(y) + Number(s) * 0.6}
            stroke={String(c)} strokeWidth="1" opacity={Number(op) * 0.7} />
        </g>
      ))}

      {/* Silhouetted rolling hills at bottom */}
      <path
        d="M-10 900 L-10 780 C200 720 400 760 640 740 C840 725 1040 755 1240 740 C1360 732 1450 748 1450 756 L1450 900 Z"
        fill="#080A20" opacity="0.95"
      />
      <path
        d="M-10 900 L-10 840 C150 810 350 830 560 818 C760 808 960 825 1160 816 C1320 808 1450 822 1450 828 L1450 900 Z"
        fill="#06081A" opacity="0.98"
      />

      {/* Trees silhouetted on hills */}
      {[120, 280, 480, 680, 850, 1050, 1200, 1370].map((x, i) => {
        const h = 60 + (i % 3) * 20
        const w = 18 + (i % 2) * 8
        return (
          <g key={x} transform={`translate(${x}, 742)`}>
            <rect x={-w / 6} y={-h * 0.35} width={w / 3} height={h * 0.35} fill="#080A20" />
            <polygon points={`0,${-h} ${-w},${-h * 0.35} ${w},${-h * 0.35}`} fill="#080A20" />
            <polygon points={`0,${-h * 0.7} ${-w * 0.75},${-h * 0.28} ${w * 0.75},${-h * 0.28}`} fill="#0A0C25" />
          </g>
        )
      })}

      {/* Warm light from a window (cottage) */}
      <g transform="translate(950, 790)">
        <rect x="-20" y="-50" width="40" height="50" rx="3" fill="#080A20" />
        <polygon points="-26,-50 26,-50 0,-80" fill="#060818" />
        <rect x="-10" y="-38" width="20" height="22" rx="2" fill="#FFD060" opacity="0.85" />
        <rect x="-10" y="-38" width="20" height="22" rx="2" fill="#FFD060" opacity="0.3"
          style={{ filter: 'blur(4px)' }} />
      </g>

      {/* Fireflies */}
      {[
        [400, 760, '#FFE870'], [550, 800, '#AAFF88'],
        [750, 820, '#FFE870'], [1100, 770, '#AAFF88'],
        [1250, 810, '#FFE870'], [300, 810, '#AAFF88'],
      ].map(([x, y, c], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="3.5" fill={String(c)} opacity="0.85" />
      ))}
    </svg>
  )
}
