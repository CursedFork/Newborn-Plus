/** Kids Doodle — original SVG artwork. Colorful hand-drawn-style line art. */
export default function KidsDoodle() {
  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="1440" height="900" fill="#FAFAFA" />

      {/* === RAINBOWS === */}
      {/* Big rainbow top-center */}
      <g transform="translate(720, 200)">
        {[
          ['#FF4444', 200], ['#FF8800', 178], ['#FFCC00', 156],
          ['#44BB44', 134], ['#4488FF', 112], ['#8844CC', 90],
        ].map(([color, r]) => (
          <path key={r} d={`M-${r} 0 A${r} ${r} 0 0 1 ${r} 0`}
            stroke={color as string} strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.85" />
        ))}
      </g>
      {/* Small rainbow bottom-left */}
      <g transform="translate(220, 720)">
        {[
          ['#FF4444', 100], ['#FF8800', 82], ['#FFCC00', 64],
          ['#44BB44', 46], ['#4488FF', 28],
        ].map(([color, r]) => (
          <path key={r} d={`M-${r} 0 A${r} ${r} 0 0 1 ${r} 0`}
            stroke={color as string} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.8" />
        ))}
      </g>
      {/* Tiny rainbow top-right */}
      <g transform="translate(1300, 180)">
        {[
          ['#FF4444', 70], ['#FF8800', 56], ['#FFCC00', 42], ['#44BB44', 28],
        ].map(([color, r]) => (
          <path key={r} d={`M-${r} 0 A${r} ${r} 0 0 1 ${r} 0`}
            stroke={color as string} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.8" />
        ))}
      </g>

      {/* === CLOUDS === */}
      {/* Cloud 1 */}
      <g transform="translate(200, 120)" stroke="#66BBFF" strokeWidth="3.5" fill="none">
        <circle cx="0" cy="0" r="35" />
        <circle cx="30" cy="-12" r="28" />
        <circle cx="58" cy="-4" r="32" />
        <circle cx="84" cy="5" r="24" />
        <circle cx="-26" cy="6" r="22" />
      </g>
      {/* Cloud 2 (filled, pink) */}
      <g transform="translate(1100, 80)" stroke="#FF99CC" strokeWidth="3" fill="#FFC0D8" opacity="0.7">
        <circle cx="0" cy="0" r="30" />
        <circle cx="26" cy="-10" r="24" />
        <circle cx="50" cy="-2" r="28" />
        <circle cx="72" cy="6" r="20" />
        <circle cx="-22" cy="5" r="18" />
      </g>
      {/* Cloud 3 (outline) */}
      <g transform="translate(520, 780)" stroke="#88CCFF" strokeWidth="3" fill="none">
        <circle cx="0" cy="0" r="28" />
        <circle cx="24" cy="-9" r="22" />
        <circle cx="46" cy="-2" r="25" />
        <circle cx="-18" cy="4" r="18" />
      </g>

      {/* === STARS === */}
      {[
        [100, 60, 20, '#FF8800'],
        [400, 90, 16, '#FFCC00'],
        [880, 40, 22, '#FF4488'],
        [1050, 120, 15, '#44BBFF'],
        [1380, 60, 18, '#FFCC00'],
        [300, 480, 14, '#FF8800'],
        [1200, 460, 16, '#44BB44'],
        [640, 820, 13, '#FF4488'],
        [1380, 760, 15, '#8844CC'],
        [80, 820, 14, '#44BBFF'],
        [980, 800, 12, '#FFCC00'],
      ].map(([x, y, s, c], i) => {
        const pts = Array.from({ length: 10 }, (_, k) => {
          const angle = (k * Math.PI) / 5 - Math.PI / 2
          const r = k % 2 === 0 ? Number(s) : Number(s) * 0.4
          return `${Number(x) + Math.cos(angle) * r},${Number(y) + Math.sin(angle) * r}`
        }).join(' ')
        return <polygon key={i} points={pts} fill={String(c)} stroke={String(c)} strokeWidth="1" opacity="0.85" />
      })}

      {/* === SUN === */}
      <g transform="translate(130, 350)">
        <circle cx="0" cy="0" r="32" fill="#FFD700" stroke="#FF8800" strokeWidth="3" opacity="0.85" />
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a) => (
          <line key={a}
            x1={Math.cos(a * Math.PI / 180) * 38}
            y1={Math.sin(a * Math.PI / 180) * 38}
            x2={Math.cos(a * Math.PI / 180) * 50}
            y2={Math.sin(a * Math.PI / 180) * 50}
            stroke="#FF8800" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
        ))}
        {/* Smile */}
        <path d="M-12 10 Q0 22 12 10" stroke="#FF8800" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="-8" cy="2" r="3.5" fill="#FF8800" />
        <circle cx="8" cy="2" r="3.5" fill="#FF8800" />
      </g>

      {/* === FLOWERS === */}
      {/* Flower 1 */}
      <g transform="translate(440, 700)">
        <line x1="0" y1="0" x2="0" y2="-60" stroke="#44BB44" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1="-35" x2="-20" y2="-20" stroke="#44BB44" strokeWidth="3" strokeLinecap="round" />
        {[0,60,120,180,240,300].map((a) => (
          <ellipse key={a} cx={Math.cos((a - 90) * Math.PI / 180) * 20}
            cy={Math.sin((a - 90) * Math.PI / 180) * 20 - 60}
            rx="10" ry="16" fill="#FF6699" opacity="0.85"
            transform={`rotate(${a}, ${Math.cos((a - 90) * Math.PI / 180) * 20}, ${Math.sin((a - 90) * Math.PI / 180) * 20 - 60})`} />
        ))}
        <circle cx="0" cy="-60" r="13" fill="#FFEE44" stroke="#FF8800" strokeWidth="2" />
      </g>
      {/* Flower 2 */}
      <g transform="translate(1020, 680)">
        <line x1="0" y1="0" x2="0" y2="-55" stroke="#44BB44" strokeWidth="3.5" strokeLinecap="round" />
        {[0,72,144,216,288].map((a) => (
          <ellipse key={a} cx={Math.cos((a - 90) * Math.PI / 180) * 18}
            cy={Math.sin((a - 90) * Math.PI / 180) * 18 - 55}
            rx="9" ry="15" fill="#FF8844" opacity="0.85"
            transform={`rotate(${a}, ${Math.cos((a - 90) * Math.PI / 180) * 18}, ${Math.sin((a - 90) * Math.PI / 180) * 18 - 55})`} />
        ))}
        <circle cx="0" cy="-55" r="11" fill="#FF4488" />
      </g>
      {/* Flower 3 */}
      <g transform="translate(780, 820)">
        <line x1="0" y1="0" x2="0" y2="-45" stroke="#44BB44" strokeWidth="3" strokeLinecap="round" />
        {[0,45,90,135,180,225,270,315].map((a) => (
          <ellipse key={a} cx={Math.cos((a - 90) * Math.PI / 180) * 16}
            cy={Math.sin((a - 90) * Math.PI / 180) * 16 - 45}
            rx="8" ry="12" fill="white"
            stroke="#44BBFF" strokeWidth="2.5" opacity="0.9"
            transform={`rotate(${a}, ${Math.cos((a - 90) * Math.PI / 180) * 16}, ${Math.sin((a - 90) * Math.PI / 180) * 16 - 45})`} />
        ))}
        <circle cx="0" cy="-45" r="10" fill="#FFEE44" />
      </g>

      {/* === TREES === */}
      <g transform="translate(1350, 680)">
        <rect x="-8" y="-50" width="16" height="50" rx="4" fill="#8B5E30" />
        <polygon points="0,-120 -45,-50 45,-50" fill="#44BB44" />
        <polygon points="0,-88 -35,-30 35,-30" fill="#55CC55" />
      </g>
      <g transform="translate(60, 760)">
        <rect x="-6" y="-40" width="12" height="40" rx="3" fill="#8B5E30" />
        <polygon points="0,-95 -36,-40 36,-40" fill="#44BB44" />
        <polygon points="0,-68 -28,-24 28,-24" fill="#55CC55" />
      </g>

      {/* === ANIMAL FACES === */}
      {/* Bear face */}
      <g transform="translate(350, 200)" stroke="#FF8844" strokeWidth="3" fill="none">
        <circle cx="0" cy="0" r="40" />
        <circle cx="-22" cy="-28" r="14" />
        <circle cx="22" cy="-28" r="14" />
        <circle cx="0" cy="12" r="16" />
        <circle cx="-12" cy="4" r="5" fill="#FF8844" />
        <circle cx="12" cy="4" r="5" fill="#FF8844" />
        <ellipse cx="0" cy="16" rx="6" ry="4" fill="#FF8844" />
        <path d="M-10 22 Q0 30 10 22" strokeLinecap="round" />
      </g>
      {/* Bunny face */}
      <g transform="translate(1260, 650)" stroke="#FF88CC" strokeWidth="3" fill="none">
        <circle cx="0" cy="0" r="35" />
        <ellipse cx="-14" cy="-40" rx="8" ry="22" />
        <ellipse cx="14" cy="-40" rx="8" ry="22" />
        <circle cx="-10" cy="2" r="4" fill="#FF88CC" />
        <circle cx="10" cy="2" r="4" fill="#FF88CC" />
        <ellipse cx="0" cy="10" rx="5" ry="3" fill="#FFAACC" />
        <path d="M-8 15 Q0 22 8 15" strokeLinecap="round" />
        <line x1="-16" y1="8" x2="-36" y2="4" />
        <line x1="-16" y1="12" x2="-36" y2="12" />
        <line x1="16" y1="8" x2="36" y2="4" />
        <line x1="16" y1="12" x2="36" y2="12" />
      </g>
      {/* Lion face */}
      <g transform="translate(1100, 260)">
        {/* Mane */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a) => (
          <ellipse key={a}
            cx={Math.cos(a * Math.PI / 180) * 50}
            cy={Math.sin(a * Math.PI / 180) * 50}
            rx="14" ry="22"
            fill="#FFAA22" opacity="0.8"
            transform={`rotate(${a}, ${Math.cos(a * Math.PI / 180) * 50}, ${Math.sin(a * Math.PI / 180) * 50})`} />
        ))}
        <circle cx="0" cy="0" r="36" fill="#FFC84A" stroke="#FF8800" strokeWidth="2.5" />
        <circle cx="-10" cy="-5" r="5.5" fill="#8B5E00" />
        <circle cx="10" cy="-5" r="5.5" fill="#8B5E00" />
        <circle cx="-9" cy="-6" r="2.5" fill="black" />
        <circle cx="11" cy="-6" r="2.5" fill="black" />
        <ellipse cx="0" cy="10" rx="9" ry="6" fill="#FF8844" stroke="#FF5500" strokeWidth="2" />
        <path d="M-12 16 Q0 24 12 16" stroke="#FF5500" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Whiskers */}
        <line x1="-18" y1="8" x2="-42" y2="4" stroke="#FF8800" strokeWidth="2" />
        <line x1="-18" y1="12" x2="-42" y2="14" stroke="#FF8800" strokeWidth="2" />
        <line x1="18" y1="8" x2="42" y2="4" stroke="#FF8800" strokeWidth="2" />
        <line x1="18" y1="12" x2="42" y2="14" stroke="#FF8800" strokeWidth="2" />
      </g>

      {/* === HEARTS === */}
      {[
        [600, 160, 0.9, '#FF4488'],
        [1400, 400, 0.85, '#FF8844'],
        [80, 500, 0.8, '#FF4444'],
        [920, 860, 0.85, '#FF44AA'],
        [1300, 840, 0.8, '#FF6666'],
      ].map(([x, y, op, c], i) => (
        <path key={i}
          d={`M${x} ${y} C${x} ${Number(y) - 14} ${Number(x) - 18} ${Number(y) - 28} ${Number(x) - 18} ${Number(y) - 18} C${Number(x) - 18} ${Number(y) - 8} ${x} ${Number(y) + 4} ${x} ${Number(y) + 16} C${x} ${Number(y) + 4} ${Number(x) + 18} ${Number(y) - 8} ${Number(x) + 18} ${Number(y) - 18} C${Number(x) + 18} ${Number(y) - 28} ${x} ${Number(y) - 14} ${x} ${y} Z`}
          fill={String(c)} opacity={Number(op)} />
      ))}

      {/* === MUSHROOMS === */}
      <g transform="translate(690, 760)">
        <rect x="-8" y="-30" width="16" height="30" rx="4" fill="#F5E8D0" stroke="#DDB870" strokeWidth="2" />
        <ellipse cx="0" cy="-30" rx="28" ry="18" fill="#FF4444" stroke="#CC2222" strokeWidth="2" />
        <circle cx="-10" cy="-36" r="5" fill="white" opacity="0.8" />
        <circle cx="6" cy="-30" r="4" fill="white" opacity="0.8" />
        <circle cx="-2" cy="-46" r="3.5" fill="white" opacity="0.75" />
      </g>
      <g transform="translate(380, 800)">
        <rect x="-6" y="-22" width="12" height="22" rx="3" fill="#F5E8D0" stroke="#DDB870" strokeWidth="2" />
        <ellipse cx="0" cy="-22" rx="22" ry="13" fill="#FF8844" stroke="#CC5500" strokeWidth="2" />
        <circle cx="-7" cy="-27" r="4" fill="white" opacity="0.8" />
        <circle cx="5" cy="-22" r="3" fill="white" opacity="0.75" />
      </g>

      {/* === PAW PRINTS === */}
      {[
        [1190, 760], [1210, 790], [1175, 810],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <ellipse cx="0" cy="0" rx="10" ry="12" fill="#AA88FF" opacity="0.7" />
          <circle cx="-8" cy="-12" r="5" fill="#AA88FF" opacity="0.7" />
          <circle cx="0" cy="-14" r="5" fill="#AA88FF" opacity="0.7" />
          <circle cx="8" cy="-12" r="5" fill="#AA88FF" opacity="0.7" />
          <circle cx="-12" cy="-5" r="4" fill="#AA88FF" opacity="0.7" />
        </g>
      ))}

      {/* === ICE CREAM === */}
      <g transform="translate(1380, 320)">
        <polygon points="0,60 -22,0 22,0" fill="#DEB887" stroke="#C4A060" strokeWidth="2" />
        <circle cx="0" cy="-4" r="24" fill="#FFB6C1" stroke="#FF88AA" strokeWidth="2" />
        <circle cx="0" cy="-18" r="18" fill="#FFDAB9" stroke="#FFA07A" strokeWidth="2" />
      </g>

      {/* === DRAGONFLY === */}
      <g transform="translate(840, 520)">
        <ellipse cx="0" cy="0" rx="5" ry="25" fill="#44CCCC" opacity="0.85" />
        <ellipse cx="-22" cy="-8" rx="22" ry="10" fill="#88EEFF" opacity="0.7" transform="rotate(-15 -22 -8)" />
        <ellipse cx="22" cy="-8" rx="22" ry="10" fill="#88EEFF" opacity="0.7" transform="rotate(15 22 -8)" />
        <ellipse cx="-18" cy="5" rx="18" ry="8" fill="#AAEEFF" opacity="0.65" transform="rotate(10 -18 5)" />
        <ellipse cx="18" cy="5" rx="18" ry="8" fill="#AAEEFF" opacity="0.65" transform="rotate(-10 18 5)" />
        <circle cx="0" cy="-24" r="6" fill="#44CCCC" />
        <circle cx="-2" cy="-25" r="2.5" fill="#005050" />
        <circle cx="2" cy="-25" r="2.5" fill="#005050" />
      </g>
    </svg>
  )
}
