import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollPin } from '../lib/useScrollPin'
import { containSize, polaroidInner } from '../lib/polaroid'
import PolaroidCard3D from './PolaroidCard3D'
import { useContent } from '../context/ContentProvider'
import { useLocale } from '../context/LocaleProvider'

const GAP = 7

function Corridor({ progress, photos }: { progress: React.RefObject<number>; photos: string[] }) {
  const textures = useLoader(THREE.TextureLoader, photos)
  const group = useRef<THREE.Group>(null)
  const cam = useRef(new THREE.Vector3())

  const planes = useMemo(
    () =>
      textures.map((tex, i) => {
        tex.colorSpace = THREE.SRGBColorSpace
        const inner = polaroidInner()
        const { w: photoW, h: photoH } = containSize(
          tex.image.width,
          tex.image.height,
          inner.w,
          inner.h,
        )
        return {
          tex,
          photoW,
          photoH,
          innerCenterY: inner.centerY,
          x: (i % 2 === 0 ? -1 : 1) * (1.9 + (i % 3) * 0.35),
          y: ((i * 37) % 100) / 100 - 0.5,
          z: -i * GAP,
          ry: (i % 2 === 0 ? 1 : -1) * 0.22,
        }
      }),
    [textures],
  )

  useFrame((state) => {
    const p = progress.current ?? 0
    const travel = (photos.length - 1) * GAP + 6
    const z = 5 - p * travel
    cam.current.set(state.pointer.x * 0.4, state.pointer.y * 0.25, z)
    state.camera.position.lerp(cam.current, 0.12)
    state.camera.lookAt(state.camera.position.x * 0.5, state.camera.position.y * 0.5, z - 8)
  })

  return (
    <group ref={group}>
      {planes.map((pl, i) => (
        <group key={i} position={[pl.x, pl.y, pl.z]} rotation={[0, pl.ry, 0]}>
          <PolaroidCard3D
            photoTex={pl.tex}
            seed={i * 17 + 3}
            photoW={pl.photoW}
            photoH={pl.photoH}
            innerCenterY={pl.innerCenterY}
          />
        </group>
      ))}
      <Dust count={photos.length} />
    </group>
  )
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const n = 350
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const red = new THREE.Color('#ff2b1f')
    const white = new THREE.Color('#e8e5df')
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = -Math.random() * count * GAP - 2
      const c = Math.random() < 0.12 ? red : white
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }, [count])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.015
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

export default function Tunnel() {
  const section = useRef<HTMLElement>(null)
  const { content } = useContent()
  const { t } = useLocale()
  const photos = content.corridor
  const { progress, phase, progressUi, layout } = useScrollPin(section, 3.8)
  const pct = progressUi * 100

  const pinStyle: React.CSSProperties =
    phase === 'pinned'
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: layout.vh,
          zIndex: 20,
        }
      : phase === 'after'
        ? { position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: layout.vh }
        : { position: 'relative', width: '100%', height: layout.vh }

  return (
    <section
      ref={section}
      id="archive"
      className="relative bg-ink"
      style={{ height: layout.sectionH }}
    >
      <div className="overflow-hidden" style={pinStyle}>
        <Canvas
          key={photos.join('|')}
          className="!absolute inset-0"
          dpr={[1, 1.5]}
          frameloop="always"
          camera={{ fov: 62, position: [0, 0, 5], near: 0.1, far: 60 }}
          gl={{ powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#0a0a0a']} />
          <fog attach="fog" args={['#0a0a0a', 6, 26]} />
          <Suspense fallback={null}>
            <Corridor progress={progress} photos={photos} />
          </Suspense>
        </Canvas>

        <div className="absolute top-24 left-5 md:left-10 font-mono text-[10px] tracking-[0.35em] text-bone/60 pointer-events-none">
          {t.tunnel.label}
        </div>
        <div className="absolute top-24 right-5 md:right-10 font-mono text-[10px] tracking-[0.3em] text-bone/60 tabular-nums pointer-events-none">
          {t.tunnel.depth} {String(Math.round(pct))}%
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
          style={{ opacity: pct < 6 ? 1 : 0 }}
        >
          <h2 className="font-display text-[10vw] leading-[0.85] text-center text-bone [text-shadow:0_4px_60px_rgba(10,10,10,0.6)]">
            {t.tunnel.walk}
            <br />
            <span className="outline-text">{t.tunnel.archive}</span>
          </h2>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
          style={{ opacity: pct > 94 ? 1 : 0 }}
        >
          <h2 className="font-serif italic text-[6vw] text-blood text-center">
            {t.tunnel.outro}
          </h2>
        </div>

        <div className="absolute bottom-6 inset-x-5 md:inset-x-10 h-px bg-bone/15">
          <div className="h-full bg-blood" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  )
}
