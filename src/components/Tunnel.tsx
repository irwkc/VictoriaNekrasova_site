import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollPin } from '../lib/useScrollPin'

const PHOTOS = [
  '/photos/dapple2.jpg',
  '/photos/sheer2.jpg',
  '/photos/chains1.jpg',
  '/photos/red1.jpg',
  '/photos/suit2.jpg',
  '/photos/tux1.jpg',
  '/photos/coat1.jpg',
  '/photos/crop1.jpg',
  '/photos/suit5.jpg',
  '/photos/chains3.jpg',
  '/photos/red3.jpg',
  '/photos/sheer4.jpg',
]

const GAP = 7

function Corridor({ progress }: { progress: React.RefObject<number> }) {
  const textures = useLoader(THREE.TextureLoader, PHOTOS)
  const group = useRef<THREE.Group>(null)
  const cam = useRef(new THREE.Vector3())

  const planes = useMemo(
    () =>
      textures.map((tex, i) => {
        tex.colorSpace = THREE.SRGBColorSpace
        const aspect = tex.image.width / tex.image.height
        const h = 3.4
        return {
          tex,
          w: h * aspect,
          h,
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
    const travel = (PHOTOS.length - 1) * GAP + 6
    const z = 5 - p * travel
    cam.current.set(state.pointer.x * 0.4, state.pointer.y * 0.25, z)
    state.camera.position.lerp(cam.current, 0.12)
    state.camera.lookAt(state.camera.position.x * 0.5, state.camera.position.y * 0.5, z - 8)
  })

  return (
    <group ref={group}>
      {planes.map((pl, i) => (
        <mesh key={i} position={[pl.x, pl.y, pl.z]} rotation={[0, pl.ry, 0]}>
          <planeGeometry args={[pl.w, pl.h]} />
          <meshBasicMaterial map={pl.tex} toneMapped={false} />
        </mesh>
      ))}
      <Dust />
    </group>
  )
}

function Dust() {
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
      positions[i * 3 + 2] = -Math.random() * PHOTOS.length * GAP - 2
      const c = Math.random() < 0.12 ? red : white
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }, [])

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
          className="!absolute inset-0"
          dpr={[1, 1.5]}
          frameloop="always"
          camera={{ fov: 62, position: [0, 0, 5], near: 0.1, far: 60 }}
          gl={{ powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#0a0a0a']} />
          <fog attach="fog" args={['#0a0a0a', 6, 26]} />
          <Suspense fallback={null}>
            <Corridor progress={progress} />
          </Suspense>
        </Canvas>

        <div className="absolute top-24 left-5 md:left-10 font-mono text-[10px] tracking-[0.35em] text-bone/60 pointer-events-none">
          ( ARCHIVE FLY-THROUGH )
        </div>
        <div className="absolute top-24 right-5 md:right-10 font-mono text-[10px] tracking-[0.3em] text-bone/60 tabular-nums pointer-events-none">
          DEPTH {String(Math.round(pct))}%
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
          style={{ opacity: pct < 6 ? 1 : 0 }}
        >
          <h2 className="font-display text-[10vw] leading-[0.85] text-center text-bone [text-shadow:0_4px_60px_rgba(10,10,10,0.6)]">
            WALK
            <br />
            <span className="outline-text">THE ARCHIVE</span>
          </h2>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
          style={{ opacity: pct > 94 ? 1 : 0 }}
        >
          <h2 className="font-serif italic text-[6vw] text-blood text-center">
            …and she keeps walking
          </h2>
        </div>

        <div className="absolute bottom-6 inset-x-5 md:inset-x-10 h-px bg-bone/15">
          <div className="h-full bg-blood" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  )
}
