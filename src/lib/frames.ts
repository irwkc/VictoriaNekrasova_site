export const frameCache: Record<string, HTMLImageElement[]> = {}

export const PROJECTOR_COUNT = 140
export const FACE_COUNT = 116

export const projectorFrame = (i: number) =>
  `/frames/projector/${String(i + 1).padStart(4, '0')}.jpg`

export const faceFrame = (i: number) =>
  `/frames/face/${String(i + 1).padStart(4, '0')}.jpg`

export function preloadFrames(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void,
): Promise<HTMLImageElement[]> {
  let loaded = 0
  const total = urls.length
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image()
          img.onload = img.onerror = () => {
            loaded += 1
            onProgress?.(loaded, total)
            resolve(img)
          }
          img.src = url
        }),
    ),
  )
}

/** Draw an image into a canvas with object-fit: cover. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const ia = img.naturalWidth / img.naturalHeight
  const ca = w / h
  let dw = w
  let dh = h
  if (ia > ca) {
    dw = h * ia
  } else {
    dh = w / ia
  }
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}
