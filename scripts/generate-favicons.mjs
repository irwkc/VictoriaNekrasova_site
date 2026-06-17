import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const svg = readFileSync(join(root, 'favicon.svg'))

const sizes = [
  [16, 'favicon-16.png'],
  [32, 'favicon-32.png'],
  [180, 'apple-touch-icon.png'],
  [512, 'icon-512.png'],
]

for (const [size, name] of sizes) {
  await sharp(svg, { density: Math.max(256, size * 4) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(root, name))
  console.log(`✓ ${name}`)
}

// favicon.ico from 32px PNG
await sharp(svg, { density: 256 })
  .resize(32, 32)
  .toFile(join(root, 'favicon.ico'))
console.log('✓ favicon.ico')
