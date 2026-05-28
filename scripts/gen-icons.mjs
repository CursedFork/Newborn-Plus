/**
 * Generates PWA icons for Newborn+.
 * Run once: node scripts/gen-icons.mjs
 * Requires: sharp (already a Next.js dep)
 */

import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/icons')
await mkdir(OUT, { recursive: true })

// ── SVG template ──────────────────────────────────────────────────────────────
// Soft-lavender/indigo gradient background, white "N+" text.
function makeSvg(size) {
  const r     = Math.round(size * 0.22)   // corner radius ≈ 22 %
  const fs    = Math.round(size * 0.38)   // font size
  const cx    = size / 2
  const cy    = size / 2 + Math.round(size * 0.05)  // slight optical centre
  const gid   = `g${size}`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#${gid})"/>
  <text
    x="${cx}" y="${cy}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-weight="700"
    font-size="${fs}"
    fill="#ffffff"
    letter-spacing="-${Math.round(size * 0.01)}"
  >N+</text>
</svg>`
}

const sizes = [
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png',         size: 192 },
  { file: 'icon-512.png',         size: 512 },
  { file: 'favicon-32.png',       size: 32  },
]

for (const { file, size } of sizes) {
  const svg = Buffer.from(makeSvg(size))
  await sharp(svg).png().toFile(join(OUT, file))
  console.log(`✓ ${file} (${size}×${size})`)
}

console.log('\nDone — icons written to public/icons/')
