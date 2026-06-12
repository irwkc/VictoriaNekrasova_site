import { useMemo } from 'react'
import * as THREE from 'three'
import { POLAROID } from '../lib/polaroid'
import { getPolaroidPaperTexture } from '../lib/polaroidPaperTexture'

const THICKNESS = 0.016

type Props = {
  photoTex: THREE.Texture
  seed?: number
  photoW: number
  photoH: number
  innerCenterY: number
}

export default function PolaroidCard3D({ photoTex, seed = 1, photoW, photoH, innerCenterY }: Props) {
  const paperMap = useMemo(() => getPolaroidPaperTexture(seed), [seed])

  const photoMat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      map: photoTex,
      toneMapped: false,
    })
    m.polygonOffset = true
    m.polygonOffsetFactor = -2
    m.polygonOffsetUnits = -2
    return m
  }, [photoTex])

  return (
    <group>
      {/* Back / thickness — single solid plane, no z-fight with front */}
      <mesh position={[0, 0, -THICKNESS]} renderOrder={0}>
        <planeGeometry args={[POLAROID.frameW, POLAROID.frameH]} />
        <meshBasicMaterial color="#cfc6b6" toneMapped={false} />
      </mesh>

      {/* Aged paper face */}
      <mesh renderOrder={1}>
        <planeGeometry args={[POLAROID.frameW, POLAROID.frameH]} />
        <meshBasicMaterial map={paperMap} toneMapped={false} />
      </mesh>

      {/* Photo flush on paper — one clear depth step, no transparency */}
      <mesh position={[0, innerCenterY, 0.001]} renderOrder={2} material={photoMat}>
        <planeGeometry args={[photoW, photoH]} />
      </mesh>
    </group>
  )
}
