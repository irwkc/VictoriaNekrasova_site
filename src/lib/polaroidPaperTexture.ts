import * as THREE from 'three'
import { POLAROID } from './polaroid'

function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

/** Aged polaroid paper — grain, foxing, yellowed corners; subtle inset frame for the photo. */
export function createPolaroidPaperTexture(seed = 1): THREE.CanvasTexture {
  const w = 640
  const h = Math.round(w / POLAROID.aspect)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const rand = seededRandom(seed)

  const padX = (POLAROID.padX / POLAROID.frameW) * w
  const padTop = (POLAROID.padTop / POLAROID.frameH) * h
  const padBottom = (POLAROID.padBottom / POLAROID.frameH) * h
  const winX = padX
  const winY = padTop
  const winW = w - padX * 2
  const winH = h - padTop - padBottom
  const bandTop = h - padBottom

  // Uneven aged base
  const wash = ctx.createRadialGradient(w * 0.48, h * 0.42, 0, w * 0.5, h * 0.52, w * 0.92)
  wash.addColorStop(0, '#f3ecdf')
  wash.addColorStop(0.45, '#ebe3d3')
  wash.addColorStop(1, '#ddd2be')
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, w, h)

  // Yellowed corners (age)
  for (const [cx, cy] of [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ] as const) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.38)
    g.addColorStop(0, `rgba(210,175,95,${0.14 + rand() * 0.08})`)
    g.addColorStop(1, 'rgba(210,175,95,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }

  // Fiber streaks
  ctx.globalAlpha = 0.055
  for (let i = 0; i < 90; i++) {
    const x = rand() * w
    const y = rand() * h
    const len = 10 + rand() * 36
    const angle = rand() * Math.PI
    ctx.strokeStyle = rand() > 0.5 ? '#fff' : '#b8a88a'
    ctx.lineWidth = 0.35 + rand() * 0.7
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Grain
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 11
    d[i] = clamp(d[i] + n, 0, 255)
    d[i + 1] = clamp(d[i + 1] + n * 0.92, 0, 255)
    d[i + 2] = clamp(d[i + 2] + n * 0.8, 0, 255)
  }
  ctx.putImageData(img, 0, 0)

  // Foxing / small stains
  for (let i = 0; i < 18 + Math.floor(rand() * 10); i++) {
    const sx = rand() * w
    const sy = rand() * h
    const sr = 3 + rand() * 14
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
    g.addColorStop(0, `rgba(150,120,80,${0.04 + rand() * 0.05})`)
    g.addColorStop(1, 'rgba(150,120,80,0)')
    ctx.fillStyle = g
    ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2)
  }

  // Caption band — warmer, worn
  ctx.fillStyle = 'rgba(195,175,140,0.18)'
  ctx.fillRect(padX * 0.55, bandTop, w - padX * 1.1, padBottom)
  for (let i = 0; i < 28; i++) {
    ctx.fillStyle = `rgba(130,105,70,${0.015 + rand() * 0.025})`
    ctx.fillRect(padX + rand() * (w - padX * 2), bandTop + rand() * padBottom, 1 + rand() * 2, 0.4 + rand())
  }

  // Photo window — same stock, barely darker; thin inset frame (not a floating shadow)
  ctx.fillStyle = 'rgba(175,160,135,0.07)'
  ctx.fillRect(winX, winY, winW, winH)

  ctx.strokeStyle = 'rgba(90,78,62,0.22)'
  ctx.lineWidth = 1.2
  ctx.strokeRect(winX + 0.6, winY + 0.6, winW - 1.2, winH - 1.2)

  ctx.strokeStyle = 'rgba(255,252,245,0.35)'
  ctx.lineWidth = 0.6
  ctx.strokeRect(winX + 2, winY + 2, winW - 4, winH - 4)

  // Edge wear + vignette
  const edge = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.72)
  edge.addColorStop(0, 'rgba(0,0,0,0)')
  edge.addColorStop(1, 'rgba(35,25,15,0.14)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, w, h)

  const side = ctx.createLinearGradient(0, 0, w, 0)
  side.addColorStop(0, 'rgba(0,0,0,0.1)')
  side.addColorStop(0.05, 'rgba(0,0,0,0)')
  side.addColorStop(0.95, 'rgba(0,0,0,0)')
  side.addColorStop(1, 'rgba(0,0,0,0.12)')
  ctx.fillStyle = side
  ctx.fillRect(0, 0, w, h)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = false
  return tex
}

const paperCache = new Map<number, THREE.CanvasTexture>()

export function getPolaroidPaperTexture(seed: number) {
  if (!paperCache.has(seed)) paperCache.set(seed, createPolaroidPaperTexture(seed))
  return paperCache.get(seed)!
}
