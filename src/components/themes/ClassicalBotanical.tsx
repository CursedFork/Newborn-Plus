/** Classical Botanical — original SVG artwork. Elegant chinoiserie-inspired garden. */
export default function ClassicalBotanical() {
  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9F5EE" />
          <stop offset="100%" stopColor="#EDE5D8" />
        </linearGradient>
        <linearGradient id="cb-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4DDED" />
          <stop offset="100%" stopColor="#9FC4DA" />
        </linearGradient>
      </defs>

      {/* Warm cream background */}
      <rect width="1440" height="900" fill="url(#cb-bg)" />

      {/* Distant misty mountains */}
      <path d="M-10 520 C150 360 320 420 500 380 C680 340 750 400 900 360 C1050 320 1200 380 1450 340 L1450 520 Z"
        fill="#D8CFC4" opacity="0.5" />
      <path d="M-10 560 C200 440 380 490 560 460 C740 430 880 470 1060 445 C1240 420 1380 460 1450 445 L1450 560 Z"
        fill="#C8BFB4" opacity="0.45" />

      {/* Still water / lake */}
      <path d="M200 680 C400 650 700 660 1000 648 C1200 640 1350 650 1450 645 L1450 760 C1350 770 1150 765 900 775 C650 785 380 775 200 780 Z"
        fill="url(#cb-water)" opacity="0.55" />
      {/* Water shimmer lines */}
      <path d="M280 710 Q500 702 720 706" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M350 726 Q600 718 850 720" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4" />
      <path d="M450 742 Q680 736 920 738" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />

      {/* Gazebo / pavilion structure */}
      <g transform="translate(580, 0)">
        {/* Columns */}
        {[-120, -60, 0, 60, 120].map((x) => (
          <rect key={x} x={x - 6} y="430" width="12" height="240" rx="6" fill="#DDD5C8" />
        ))}
        {/* Dome base */}
        <path d="M-145 430 C-120 420 120 420 145 430 L140 435 C100 426 -100 426 -140 435 Z" fill="#C9C0B2" />
        {/* Dome */}
        <path d="M-130 430 C-80 310 80 310 130 430 Z" fill="#B8CDD8" opacity="0.8" />
        <path d="M-100 430 C-60 340 60 340 100 430 Z" fill="#C8D8E4" opacity="0.7" />
        {/* Dome top spire */}
        <line x1="0" y1="310" x2="0" y2="260" stroke="#B0A898" strokeWidth="4" />
        <circle cx="0" cy="255" r="8" fill="#C8B898" />
        {/* Arch */}
        <path d="M-60 670 L-60 520 A60 60 0 0 1 60 520 L60 670" fill="#D8D0C4" opacity="0.6" />
        {/* Floor */}
        <rect x="-145" y="668" width="290" height="10" rx="4" fill="#C9C0B2" />
        {/* Steps */}
        <rect x="-155" y="675" width="310" height="8" rx="3" fill="#BFB5A5" />
        <rect x="-165" y="680" width="330" height="8" rx="3" fill="#B5AA98" />
      </g>

      {/* Climbing roses on gazebo */}
      {[440, 520, 640, 720].map((x) => (
        <g key={x}>
          <path d={`M${x} 670 C${x - 15} 600 ${x + 10} 540 ${x - 5} 480 C${x + 20} 440 ${x + 5} 420 ${x} 410`}
            stroke="#8BA878" strokeWidth="3" fill="none" />
          {/* Leaves */}
          <ellipse cx={x - 10} cy="580" rx="12" ry="8" fill="#7A9E68" transform={`rotate(-30 ${x - 10} 580)`} />
          <ellipse cx={x + 8} cy="510" rx="11" ry="7" fill="#8CB07A" transform={`rotate(20 ${x + 8} 510)`} />
          <ellipse cx={x - 5} cy="448" rx="10" ry="6" fill="#7A9E68" transform={`rotate(-15 ${x - 5} 448)`} />
          {/* Rose blooms */}
          <circle cx={x + 5} cy="540" r="9" fill="#E8A0A0" opacity="0.9" />
          <circle cx={x + 2} cy="540" r="6" fill="#D87878" opacity="0.8" />
          <circle cx={x - 8} cy="475" r="8" fill="#F0B8C0" opacity="0.9" />
          <circle cx={x - 5} cy="475" r="5" fill="#E09090" opacity="0.8" />
        </g>
      ))}

      {/* Tall elegant tree — left */}
      <g transform="translate(180, 0)">
        <path d="M0 900 L0 380 C-8 350 8 320 0 280 C-12 240 5 210 0 180" stroke="#7A6A55" strokeWidth="22" fill="none" strokeLinecap="round" />
        {/* Branches */}
        <path d="M0 500 C-60 460 -120 440 -160 420" stroke="#7A6A55" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M0 420 C50 380 110 355 155 340" stroke="#7A6A55" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M0 350 C-70 315 -130 298 -175 285" stroke="#7A6A55" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M0 300 C55 268 100 252 140 240" stroke="#7A6A55" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M0 240 C-50 218 -95 205 -130 196" stroke="#7A6A55" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Blossom clusters */}
        {[-160,-100,155,140,0,-130,80].map((bx, i) => {
          const by = [420, 465, 340, 240, 280, 196, 198][i]
          return (
            <g key={i}>
              {[-12,-5,5,12,0].map((ox) => [-10,-4,4][0] !== undefined && (
                [-10,-4,4].map((oy, j) => (
                  <circle key={`${ox}-${j}`} cx={bx + ox} cy={by + oy} r={4.5} fill="#F2C8D0" opacity="0.85" />
                ))
              ))}
              <circle cx={bx} cy={by} r="3.5" fill="#E8A0B0" opacity="0.9" />
            </g>
          )
        })}
        {/* Small leaves */}
        {[-160, 155, -130, 140].map((bx, i) => {
          const by = [430, 348, 205, 250][i]
          return (
            <g key={i}>
              <ellipse cx={bx + 15} cy={by - 8} rx="14" ry="7" fill="#8AAA74" opacity="0.8" transform={`rotate(-20 ${bx + 15} ${by - 8})`} />
              <ellipse cx={bx - 8} cy={by + 5} rx="12" ry="6" fill="#9ABB84" opacity="0.75" transform={`rotate(15 ${bx - 8} ${by + 5})`} />
            </g>
          )
        })}
      </g>

      {/* Tall elegant tree — right */}
      <g transform="translate(1280, 0)">
        <path d="M0 900 L0 360 C8 330 -8 300 0 260 C10 225 -5 200 0 170" stroke="#7A6A55" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M0 480 C55 442 110 425 148 408" stroke="#7A6A55" strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d="M0 400 C-50 362 -105 342 -148 328" stroke="#7A6A55" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M0 330 C60 298 115 280 155 266" stroke="#7A6A55" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M0 268 C-48 242 -90 228 -125 218" stroke="#7A6A55" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Blossoms */}
        {[148, -148, 155, -125, 0].map((bx, i) => {
          const by = [408, 328, 266, 218, 260][i]
          return (
            <g key={i}>
              {[-11,-4,5,11].map((ox) => (
                [-9,0,8].map((oy, j) => (
                  <circle key={`${ox}-${j}`} cx={bx + ox} cy={by + oy} r={4} fill="#F0C0CC" opacity="0.85" />
                ))
              ))}
              <circle cx={bx} cy={by} r="3" fill="#E0909C" opacity="0.9" />
            </g>
          )
        })}
      </g>

      {/* Peacock — left mid */}
      <g transform="translate(300, 680)">
        {/* Fan tail */}
        {[-60,-45,-30,-15,0,15,30,45,60].map((angle) => (
          <g key={angle} transform={`rotate(${angle - 80}, 0, 0)`}>
            <path d="M0 0 L-4 -90 L0 -100 L4 -90 Z" fill="#1A7A5A" opacity="0.8" />
            <ellipse cx="0" cy="-95" rx="12" ry="16" fill="#1A7A5A" opacity="0.75" />
            <ellipse cx="0" cy="-95" rx="6" ry="9" fill="#4AA870" opacity="0.8" />
            <circle cx="0" cy="-95" r="3.5" fill="#7ADBA0" opacity="0.85" />
            <circle cx="0" cy="-95" r="1.5" fill="#1A4A30" />
          </g>
        ))}
        {/* Body */}
        <ellipse cx="0" cy="0" rx="22" ry="14" fill="#1A6A4A" />
        {/* Head */}
        <circle cx="24" cy="-12" r="10" fill="#1A7A5A" />
        {/* Beak */}
        <path d="M34 -12 L42 -10 L34 -8 Z" fill="#D4A840" />
        {/* Eye */}
        <circle cx="27" cy="-14" r="3" fill="white" />
        <circle cx="28" cy="-14" r="1.5" fill="#1A1A1A" />
        {/* Crest */}
        {[-4,0,4].map((ox) => (
          <path key={ox} d={`M${24 + ox} -22 L${24 + ox} -36`} stroke="#4ABDA0" strokeWidth="1.5" fill="none" />
        ))}
        {[-4,0,4].map((ox) => (
          <circle key={ox} cx={24 + ox} cy="-37" r="3" fill="#4ABDA0" />
        ))}
        {/* Legs */}
        <line x1="-5" y1="14" x2="-10" y2="30" stroke="#8A8060" strokeWidth="2.5" />
        <line x1="5" y1="14" x2="8" y2="30" stroke="#8A8060" strokeWidth="2.5" />
      </g>

      {/* Heron — right */}
      <g transform="translate(1150, 700)">
        {/* Body */}
        <ellipse cx="0" cy="0" rx="20" ry="10" fill="#C8C0B8" />
        {/* Long neck */}
        <path d="M10 -10 C15 -30 8 -55 18 -70 C22 -80 26 -84 28 -88" stroke="#D0C8C0" strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* Head */}
        <circle cx="30" cy="-92" r="10" fill="#D8D0C8" />
        {/* Beak */}
        <path d="M40 -92 L58 -90 L40 -88 Z" fill="#C0A840" />
        {/* Black crown stripe */}
        <path d="M22 -98 C26 -100 34 -100 38 -96" stroke="#302820" strokeWidth="3" fill="none" />
        {/* Legs */}
        <line x1="-5" y1="10" x2="-10" y2="45" stroke="#B0A888" strokeWidth="3" />
        <line x1="5" y1="10" x2="8" y2="45" stroke="#B0A888" strokeWidth="3" />
        <path d="M-10 45 L-18 50 M-10 45 L-6 52 M-10 45 L-2 49" stroke="#B0A888" strokeWidth="2" fill="none" />
        <path d="M8 45 L0 50 M8 45 L12 52 M8 45 L16 49" stroke="#B0A888" strokeWidth="2" fill="none" />
      </g>

      {/* Birds in sky */}
      {[
        [400, 180], [420, 162], [380, 168],
        [900, 140], [925, 124], [950, 138],
        [1100, 200], [1125, 185],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} C${x + 12} ${y - 12} ${x + 22} ${y - 12} ${x + 34} ${y}`}
          stroke="#8A8278" strokeWidth="2" fill="none" />
      ))}

      {/* Decorative rocks at water edge */}
      {[230, 380, 520, 900, 1080, 1280].map((x) => (
        <ellipse key={x} cx={x} cy="755" rx={x % 120 + 20} ry="10" fill="#C0B8A8" opacity="0.6" />
      ))}

      {/* Flowering shrubs foreground */}
      <g transform="translate(80, 820)">
        <ellipse cx="0" cy="0" rx="60" ry="38" fill="#7A9E68" opacity="0.85" />
        <ellipse cx="-20" cy="-8" rx="40" ry="26" fill="#8AAA78" opacity="0.8" />
        {[-30,-10,10,25,-5,18].map((ox, i) => (
          <circle key={i} cx={ox} cy={-22 + (i % 2) * 8} r="7" fill="#F0C8D0" opacity="0.9" />
        ))}
      </g>
      <g transform="translate(1380, 815)">
        <ellipse cx="0" cy="0" rx="55" ry="35" fill="#7A9E68" opacity="0.8" />
        <ellipse cx="15" cy="-6" rx="38" ry="24" fill="#8AAA78" opacity="0.75" />
        {[-20,0,20,-8,12].map((ox, i) => (
          <circle key={i} cx={ox} cy={-20 + (i % 2) * 7} r="6" fill="#F4CCA0" opacity="0.9" />
        ))}
      </g>
    </svg>
  )
}
