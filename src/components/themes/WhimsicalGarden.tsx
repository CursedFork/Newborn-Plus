/** Whimsical Garden — original SVG artwork. Storybook fairy-tale style. */
export default function WhimsicalGarden() {
  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#76C8ED" />
          <stop offset="55%" stopColor="#B8E4F9" />
          <stop offset="100%" stopColor="#D4F0C0" />
        </linearGradient>
        <radialGradient id="wg-sun" cx="85%" cy="15%" r="12%">
          <stop offset="0%" stopColor="#FFED80" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFD740" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="1440" height="900" fill="url(#wg-sky)" />
      {/* Sun glow */}
      <ellipse cx="1260" cy="130" rx="180" ry="120" fill="url(#wg-sun)" />
      <circle cx="1260" cy="100" r="48" fill="#FFED80" opacity="0.85" />

      {/* Back hill – dark green */}
      <path
        d="M-10 900 L-10 540 C180 470 380 510 580 490 C780 470 980 455 1180 480 C1340 500 1450 475 1450 490 L1450 900 Z"
        fill="#3E8B42"
      />
      {/* Mid hill */}
      <path
        d="M-10 900 L-10 690 C220 640 440 675 680 658 C880 644 1080 668 1280 652 C1390 644 1450 660 1450 668 L1450 900 Z"
        fill="#55A859"
      />
      {/* Front grass */}
      <path
        d="M-10 900 L-10 838 C240 804 480 822 720 812 C940 803 1160 820 1450 808 L1450 900 Z"
        fill="#70C46C"
      />

      {/* Cloud 1 */}
      <g opacity="0.92">
        <circle cx="160" cy="110" r="48" fill="white" />
        <circle cx="205" cy="93" r="42" fill="white" />
        <circle cx="250" cy="104" r="46" fill="white" />
        <circle cx="135" cy="122" r="36" fill="white" />
        <circle cx="288" cy="116" r="34" fill="white" />
      </g>
      {/* Cloud 2 */}
      <g opacity="0.88">
        <circle cx="960" cy="78" r="44" fill="white" />
        <circle cx="1002" cy="62" r="38" fill="white" />
        <circle cx="1044" cy="72" r="42" fill="white" />
        <circle cx="938" cy="90" r="32" fill="white" />
        <circle cx="1078" cy="84" r="30" fill="white" />
      </g>
      {/* Cloud 3 – small */}
      <g opacity="0.80">
        <circle cx="580" cy="145" r="30" fill="white" />
        <circle cx="610" cy="132" r="26" fill="white" />
        <circle cx="638" cy="142" r="28" fill="white" />
      </g>

      {/* Tree 1 – large left */}
      <g transform="translate(105,0)">
        <rect x="-11" y="508" width="22" height="88" rx="4" fill="#7D5027" />
        <circle cx="0" cy="465" r="72" fill="#2E7D2E" />
        <circle cx="-22" cy="495" r="50" fill="#256025" />
        <circle cx="22" cy="490" r="54" fill="#3D9E3D" />
        {/* Fruit */}
        <circle cx="18" cy="448" r="8" fill="#E84242" />
        <circle cx="-12" cy="455" r="7" fill="#F06050" />
      </g>

      {/* Tree 2 – medium left-center */}
      <g transform="translate(330,0)">
        <rect x="-9" y="528" width="18" height="72" rx="3" fill="#8B5E30" />
        <circle cx="0" cy="488" r="58" fill="#2E8B2E" />
        <circle cx="-18" cy="515" r="40" fill="#246824" />
        <circle cx="18" cy="510" r="44" fill="#3EA83E" />
      </g>

      {/* Tree 3 – center-right */}
      <g transform="translate(720,0)">
        <rect x="-10" y="520" width="20" height="78" rx="3" fill="#7D5027" />
        <circle cx="0" cy="478" r="62" fill="#2A822A" />
        <circle cx="-20" cy="505" r="44" fill="#206020" />
        <circle cx="20" cy="500" r="48" fill="#40AA40" />
        <circle cx="5" cy="460" r="7" fill="#F0E040" />
      </g>

      {/* Tree 4 – large right */}
      <g transform="translate(1155,0)">
        <rect x="-12" y="505" width="24" height="90" rx="4" fill="#7D5027" />
        <circle cx="0" cy="462" r="70" fill="#2E7D2E" />
        <circle cx="-22" cy="492" r="48" fill="#256025" />
        <circle cx="22" cy="488" r="52" fill="#3D9E3D" />
      </g>

      {/* Tree 5 – small right */}
      <g transform="translate(1340,0)">
        <rect x="-8" y="542" width="16" height="62" rx="3" fill="#8B5E30" />
        <circle cx="0" cy="504" r="48" fill="#358835" />
        <circle cx="-14" cy="526" r="33" fill="#28682A" />
        <circle cx="14" cy="522" r="37" fill="#4AB44A" />
      </g>

      {/* Fairy mushroom cottage */}
      <g transform="translate(880, 820)">
        <rect x="-30" y="-58" width="60" height="58" rx="5" fill="#B08ADE" />
        {/* Mushroom-dome roof */}
        <ellipse cx="0" cy="-58" rx="46" ry="36" fill="#E84848" />
        <circle cx="-18" cy="-52" r="6" fill="white" opacity="0.7" />
        <circle cx="8" cy="-68" r="5" fill="white" opacity="0.7" />
        <circle cx="22" cy="-56" r="4" fill="white" opacity="0.7" />
        {/* Round door */}
        <path d="M-10 0 L-10 -30 A10 10 0 0 1 10 -30 L10 0 Z" fill="#F5CE30" />
        {/* Windows */}
        <circle cx="-16" cy="-32" r="8" fill="#8FD8EE" opacity="0.88" />
        <circle cx="16" cy="-32" r="8" fill="#8FD8EE" opacity="0.88" />
        {/* Chimney */}
        <rect x="10" y="-90" width="12" height="24" rx="2" fill="#A04020" />
        <rect x="7" y="-93" width="18" height="7" rx="2" fill="#B85025" />
        {/* Smoke */}
        <circle cx="16" cy="-98" r="5" fill="white" opacity="0.5" />
        <circle cx="20" cy="-108" r="4" fill="white" opacity="0.35" />
        <circle cx="15" cy="-118" r="3" fill="white" opacity="0.2" />
      </g>

      {/* Mushroom 1 */}
      <g transform="translate(1050, 832)">
        <rect x="-5" y="-25" width="10" height="25" rx="3" fill="#F5E8D0" />
        <ellipse cx="0" cy="-25" rx="22" ry="14" fill="#E84848" />
        <circle cx="-8" cy="-30" r="4" fill="white" opacity="0.7" />
        <circle cx="5" cy="-26" r="3" fill="white" opacity="0.7" />
      </g>
      {/* Mushroom 2 */}
      <g transform="translate(680, 845)">
        <rect x="-4" y="-20" width="8" height="20" rx="2" fill="#F5E8D0" />
        <ellipse cx="0" cy="-20" rx="17" ry="11" fill="#FF8040" />
        <circle cx="-6" cy="-24" r="3" fill="white" opacity="0.7" />
        <circle cx="4" cy="-21" r="2.5" fill="white" opacity="0.7" />
      </g>

      {/* Flowers */}
      {/* Daisy 1 */}
      <g transform="translate(200, 855)">
        {[0,45,90,135,180,225,270,315].map((a) => (
          <ellipse key={a} cx="0" cy="-13" rx="5" ry="9" fill="white" transform={`rotate(${a})`} />
        ))}
        <circle r="8" fill="#FFD700" />
        <line x1="0" y1="8" x2="0" y2="36" stroke="#3D7D2A" strokeWidth="3" />
      </g>
      {/* Daisy 2 – pink */}
      <g transform="translate(420, 848)">
        {[0,45,90,135,180,225,270,315].map((a) => (
          <ellipse key={a} cx="0" cy="-13" rx="5" ry="9" fill="#FFB6C1" transform={`rotate(${a})`} />
        ))}
        <circle r="8" fill="#FF69B4" />
        <line x1="0" y1="8" x2="0" y2="34" stroke="#3D7D2A" strokeWidth="3" />
      </g>
      {/* Tulip 1 */}
      <g transform="translate(560, 840)">
        <line x1="0" y1="0" x2="0" y2="-42" stroke="#4A8A30" strokeWidth="3" />
        <path d="M0 -42 C-12 -60 -14 -78 0 -82 C14 -78 12 -60 0 -42 Z" fill="#FF4488" />
        <path d="M-8 -54 C-20 -50 -22 -40 -10 -42 Z" fill="#4A8A30" />
      </g>
      {/* Daisy 3 – yellow */}
      <g transform="translate(1200, 850)">
        {[0,60,120,180,240,300].map((a) => (
          <ellipse key={a} cx="0" cy="-14" rx="5" ry="10" fill="#FFEE44" transform={`rotate(${a})`} />
        ))}
        <circle r="7" fill="#FF8800" />
        <line x1="0" y1="7" x2="0" y2="36" stroke="#3D7D2A" strokeWidth="3" />
      </g>
      {/* Tulip 2 */}
      <g transform="translate(1350, 838)">
        <line x1="0" y1="0" x2="0" y2="-40" stroke="#4A8A30" strokeWidth="3" />
        <path d="M0 -40 C-11 -58 -13 -76 0 -80 C13 -76 11 -58 0 -40 Z" fill="#CC44FF" />
      </g>

      {/* Butterfly 1 – pink/magenta */}
      <g transform="translate(500, 255)">
        <ellipse cx="-20" cy="-8" rx="24" ry="16" fill="#FF69B4" opacity="0.9" transform="rotate(-28 -20 -8)" />
        <ellipse cx="20" cy="-8" rx="24" ry="16" fill="#FF1493" opacity="0.9" transform="rotate(28 20 -8)" />
        <ellipse cx="-14" cy="7" rx="16" ry="10" fill="#FFB6D8" opacity="0.85" transform="rotate(18 -14 7)" />
        <ellipse cx="14" cy="7" rx="16" ry="10" fill="#FFB6D8" opacity="0.85" transform="rotate(-18 14 7)" />
        <ellipse cx="0" cy="0" rx="3" ry="11" fill="#4B0082" />
        <circle cx="-2" cy="-14" r="2" fill="#4B0082" />
        <circle cx="2" cy="-14" r="2" fill="#4B0082" />
      </g>
      {/* Butterfly 2 – orange/gold */}
      <g transform="translate(800, 182)">
        <ellipse cx="-19" cy="-7" rx="22" ry="15" fill="#FF8C00" opacity="0.9" transform="rotate(-30 -19 -7)" />
        <ellipse cx="19" cy="-7" rx="22" ry="15" fill="#FFA500" opacity="0.9" transform="rotate(30 19 -7)" />
        <ellipse cx="-13" cy="7" rx="14" ry="9" fill="#FFD700" opacity="0.85" transform="rotate(20 -13 7)" />
        <ellipse cx="13" cy="7" rx="14" ry="9" fill="#FFD700" opacity="0.85" transform="rotate(-20 13 7)" />
        <ellipse cx="0" cy="0" rx="3" ry="10" fill="#6B3500" />
      </g>
      {/* Butterfly 3 – purple/lavender */}
      <g transform="translate(1120, 305)">
        <ellipse cx="-17" cy="-6" rx="20" ry="14" fill="#9B59B6" opacity="0.9" transform="rotate(-25 -17 -6)" />
        <ellipse cx="17" cy="-6" rx="20" ry="14" fill="#8E44AD" opacity="0.9" transform="rotate(25 17 -6)" />
        <ellipse cx="-12" cy="6" rx="13" ry="8" fill="#D7BDE2" opacity="0.85" transform="rotate(16 -12 6)" />
        <ellipse cx="12" cy="6" rx="13" ry="8" fill="#D7BDE2" opacity="0.85" transform="rotate(-16 12 6)" />
        <ellipse cx="0" cy="0" rx="3" ry="10" fill="#4A235A" />
      </g>
      {/* Butterfly 4 – teal */}
      <g transform="translate(360, 360)">
        <ellipse cx="-17" cy="-6" rx="21" ry="14" fill="#20B2AA" opacity="0.9" transform="rotate(-22 -17 -6)" />
        <ellipse cx="17" cy="-6" rx="21" ry="14" fill="#2ECC71" opacity="0.9" transform="rotate(22 17 -6)" />
        <ellipse cx="-12" cy="7" rx="14" ry="9" fill="#ABEBC6" opacity="0.85" transform="rotate(14 -12 7)" />
        <ellipse cx="12" cy="7" rx="14" ry="9" fill="#ABEBC6" opacity="0.85" transform="rotate(-14 12 7)" />
        <ellipse cx="0" cy="0" rx="3" ry="10" fill="#0B6060" />
      </g>
      {/* Butterfly 5 – small blue */}
      <g transform="translate(660, 420)">
        <ellipse cx="-13" cy="-5" rx="16" ry="10" fill="#5DADE2" opacity="0.9" transform="rotate(-20 -13 -5)" />
        <ellipse cx="13" cy="-5" rx="16" ry="10" fill="#3498DB" opacity="0.9" transform="rotate(20 13 -5)" />
        <ellipse cx="-9" cy="5" rx="10" ry="6" fill="#AED6F1" opacity="0.85" transform="rotate(12 -9 5)" />
        <ellipse cx="9" cy="5" rx="10" ry="6" fill="#AED6F1" opacity="0.85" transform="rotate(-12 9 5)" />
        <ellipse cx="0" cy="0" rx="2" ry="8" fill="#1A5276" />
      </g>

      {/* Grass tufts */}
      {[80,190,290,450,530,640,760,850,980,1070,1180,1290,1400].map((x) => (
        <g key={x} transform={`translate(${x}, 838)`}>
          <path d="M0 0 Q-5 -18 -2 -28" stroke="#4A9A40" strokeWidth="2.5" fill="none" />
          <path d="M0 0 Q0 -20 2 -32" stroke="#5CB850" strokeWidth="2.5" fill="none" />
          <path d="M0 0 Q5 -18 3 -28" stroke="#4A9A40" strokeWidth="2.5" fill="none" />
        </g>
      ))}
    </svg>
  )
}
