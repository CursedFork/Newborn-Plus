/** Abstract Waves — original SVG artwork. Playful organic blob shapes. */
export default function AbstractWaves() {
  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cream base */}
      <rect width="1440" height="900" fill="#FEFAEF" />

      {/* Large orange blob — lower left */}
      <path
        d="M-80 900 C-80 700 40 620 160 580 C280 540 380 600 360 700 C340 800 200 860 80 900 Z"
        fill="#F97316" opacity="0.88"
      />
      <path
        d="M-80 900 C20 820 100 760 180 740 C260 720 320 760 300 840 C280 900 100 900 -80 900 Z"
        fill="#EA6010" opacity="0.7"
      />

      {/* Large teal blob — lower right */}
      <path
        d="M1440 900 C1440 720 1380 640 1280 600 C1180 560 1100 620 1140 740 C1180 860 1360 900 1440 900 Z"
        fill="#0D9488" opacity="0.85"
      />
      <path
        d="M1440 900 C1360 840 1300 800 1280 780 C1260 760 1280 820 1380 900 Z"
        fill="#0A7A70" opacity="0.6"
      />

      {/* Large sky-blue blob — upper right */}
      <path
        d="M1200 -50 C1320 20 1440 100 1440 220 C1440 120 1400 40 1440 -50 Z"
        fill="#38BDF8" opacity="0.75"
      />
      <path
        d="M1100 -50 C1240 10 1380 80 1440 180 C1440 80 1360 -10 1440 -50 Z"
        fill="#0EA5E9" opacity="0.65"
      />
      <path
        d="M960 -50 C1060 0 1200 60 1280 140 C1320 80 1200 -20 1060 -50 Z"
        fill="#7DD3FC" opacity="0.6"
      />

      {/* Sandy/gold blob — upper left */}
      <path
        d="M-80 -50 C40 20 120 100 100 220 C80 160 20 60 -80 -50 Z"
        fill="#FCD34D" opacity="0.7"
      />
      <path
        d="M-80 -50 C80 40 200 130 160 280 C120 200 0 80 -80 -50 Z"
        fill="#FBBF24" opacity="0.55"
      />

      {/* Pink/coral blob — upper center-left */}
      <path
        d="M240 -50 C320 40 380 120 340 220 C300 320 180 280 160 180 C140 80 200 0 240 -50 Z"
        fill="#FB7185" opacity="0.72"
      />
      <path
        d="M280 -50 C360 30 400 100 370 190 C340 150 300 60 280 -50 Z"
        fill="#F43F5E" opacity="0.5"
      />

      {/* Sage green blob — left center */}
      <path
        d="M-80 400 C-20 340 80 320 140 380 C200 440 160 540 80 560 C0 580 -80 520 -80 400 Z"
        fill="#86EFAC" opacity="0.65"
      />

      {/* Decorative accents */}
      {/* Stars */}
      {[
        [680, 120, 14], [820, 200, 10], [540, 340, 8],
        [1020, 360, 12], [380, 520, 9], [1160, 500, 10],
        [760, 680, 8], [480, 760, 11], [1020, 730, 9],
        [200, 300, 10], [1250, 280, 8], [650, 820, 7],
      ].map(([x, y, s], i) => {
        const pts = Array.from({ length: 10 }, (_, k) => {
          const angle = (k * Math.PI) / 5 - Math.PI / 2
          const r = k % 2 === 0 ? s : s * 0.42
          return `${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`
        }).join(' ')
        const colors = ['#F97316','#0D9488','#0EA5E9','#FBBF24','#FB7185','#86EFAC']
        return <polygon key={i} points={pts} fill={colors[i % colors.length]} opacity="0.75" />
      })}

      {/* Dashes / marks */}
      {[
        [600, 80, 0, '#0D9488'],
        [900, 160, -30, '#F97316'],
        [440, 280, 45, '#38BDF8'],
        [1080, 420, -15, '#FB7185'],
        [300, 640, 20, '#FBBF24'],
        [1100, 620, -40, '#0D9488'],
        [700, 780, 10, '#F97316'],
        [550, 480, -25, '#86EFAC'],
      ].map(([x, y, r, c], i) => (
        <rect key={i} x={Number(x) - 18} y={Number(y) - 4} width="36" height="8" rx="4"
          fill={String(c)} opacity="0.7" transform={`rotate(${r}, ${x}, ${y})`} />
      ))}

      {/* Circles */}
      {[
        [740, 280, 10, '#FB7185'],
        [920, 480, 8, '#FBBF24'],
        [580, 640, 12, '#0EA5E9'],
        [1180, 340, 9, '#F97316'],
        [320, 420, 7, '#0D9488'],
        [860, 760, 11, '#FB7185'],
      ].map(([x, y, r, c], i) => (
        <circle key={i} cx={Number(x)} cy={Number(y)} r={Number(r)}
          fill="none" stroke={String(c)} strokeWidth="3" opacity="0.7" />
      ))}

      {/* X marks */}
      {[
        [500, 200, '#0D9488'],
        [1050, 260, '#F97316'],
        [640, 570, '#FB7185'],
        [1200, 640, '#FBBF24'],
        [280, 750, '#38BDF8'],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${15 + i * 8})`}>
          <line x1="-10" y1="-10" x2="10" y2="10" stroke={String(c)} strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
          <line x1="10" y1="-10" x2="-10" y2="10" stroke={String(c)} strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
        </g>
      ))}

      {/* Squiggles */}
      <path d="M680 350 C700 335 720 365 740 350 C760 335 780 365 800 350"
        stroke="#0D9488" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M360 660 C380 645 400 675 420 660 C440 645 460 675 480 660"
        stroke="#F97316" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M1000 180 C1020 165 1040 195 1060 180"
        stroke="#FB7185" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />

      {/* Dots cluster */}
      {[
        [860, 300], [872, 315], [848, 316], [860, 328], [876, 306], [845, 302],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill="#FBBF24" opacity="0.7" />
      ))}
      {[
        [540, 720], [552, 735], [528, 735], [540, 748],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#0D9488" opacity="0.65" />
      ))}
    </svg>
  )
}
