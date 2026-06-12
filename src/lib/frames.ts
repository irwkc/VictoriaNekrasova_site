export function preloadImages(
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
