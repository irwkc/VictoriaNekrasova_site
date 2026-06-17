import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const src = join(root, 'photos/dapple1.jpg')
const out = join(root, 'og-image.jpg')

await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(out)

console.log('✓ og-image.jpg 1200×630')
