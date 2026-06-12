/** Fit image dimensions inside a box (CSS object-contain / Three.js letterbox). */
export function containSize(iw: number, ih: number, boxW: number, boxH: number) {
  const ia = iw / ih
  const ba = boxW / boxH
  if (ia > ba) return { w: boxW, h: boxW / ia }
  return { w: boxH * ia, h: boxH }
}

export const POLAROID = {
  /** Outer card aspect (classic instant film). */
  aspect: 88 / 107,
  paper: '#f2efe8',
  /** 3D corridor card (world units). */
  frameW: 2.45,
  frameH: 3.05,
  padX: 0.14,
  padTop: 0.14,
  padBottom: 0.46,
} as const

export function polaroidInner() {
  const { frameW, frameH, padX, padTop, padBottom } = POLAROID
  return {
    w: frameW - padX * 2,
    h: frameH - padTop - padBottom,
    centerY: (padBottom - padTop) / 2,
  }
}
