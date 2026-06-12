import * as THREE from 'three'

/** object-fit: cover + slight overscan to trim IG white margins in the corridor */
export function applyCoverTexture(
  tex: THREE.Texture,
  imgW: number,
  imgH: number,
  planeW: number,
  planeH: number,
  overscan = 1.1,
) {
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping

  const ia = imgW / imgH
  const pa = planeW / planeH

  if (ia > pa) {
    const rw = (pa / ia) * overscan
    tex.repeat.set(rw, overscan)
    tex.offset.set((1 - rw) / 2, (1 - overscan) / 2)
  } else {
    const rh = (ia / pa) * overscan
    tex.repeat.set(overscan, rh)
    tex.offset.set((1 - overscan) / 2, (1 - rh) / 2)
  }
}

export const CORRIDOR_PLANE = { w: 2.35, h: 3.4 }
