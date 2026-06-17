import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from 'motion/react'
import { useLocale } from '../context/LocaleProvider'
import { useInView } from '../lib/useInView'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform float uForce;
  uniform float uTime;
  uniform vec2 uPlane;
  uniform vec2 uImage;
  varying vec2 vUv;

  vec2 cover(vec2 uv) {
    float pa = uPlane.x / uPlane.y;
    float ia = uImage.x / uImage.y;
    vec2 s = vec2(1.0);
    if (pa > ia) {
      s = vec2(1.0, ia / pa);
    } else {
      s = vec2(pa / ia, 1.0);
    }
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 uv = vUv;

    uv.x += sin(uv.y * 7.0 + uTime * 0.5) * 0.0045;
    uv.y += cos(uv.x * 6.0 + uTime * 0.4) * 0.0045;

    vec2 aspect = vec2(uPlane.x / uPlane.y, 1.0);
    vec2 d = (uv - uMouse) * aspect;
    float dist = length(d);
    float ripple = exp(-dist * dist * 14.0) * uForce;
    uv -= normalize(d + 1e-6) * ripple * 0.05;

    vec2 cuv = cover(uv);

    float split = 0.0022 + ripple * 0.014;
    float r = texture2D(uTex, cuv + vec2(split, 0.0)).r;
    float g = texture2D(uTex, cuv).g;
    float b = texture2D(uTex, cuv - vec2(split, 0.0)).b;
    vec3 col = vec3(r, g, b);

    float vig = smoothstep(1.15, 0.35, length(vUv - 0.5));
    col *= mix(0.55, 1.0, vig);

    col += sin(vUv.y * 900.0 + uTime * 2.0) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`

function HeroPlane({ active }: { active: boolean }) {
  const tex = useLoader(THREE.TextureLoader, '/photos/dapple1.jpg')
  const { viewport, size } = useThree()
  const mat = useRef<THREE.ShaderMaterial>(null)
  const target = useRef(new THREE.Vector2(0.5, 0.5))
  const before = useRef(new THREE.Vector2(0.5, 0.5))
  const force = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uForce: { value: 0 },
      uTime: { value: 0 },
      uPlane: { value: new THREE.Vector2(1, 1) },
      uImage: { value: new THREE.Vector2(tex.image.width, tex.image.height) },
    }),
    [tex],
  )

  useFrame((state, delta) => {
    if (!active) return
    const m = mat.current
    if (!m) return
    m.uniforms.uTime.value += delta

    const p = state.pointer
    target.current.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5)
    const cur = m.uniforms.uMouse.value as THREE.Vector2
    before.current.copy(cur)
    cur.lerp(target.current, 0.07)
    const speed = cur.distanceTo(before.current) * 60
    force.current = Math.min(1.4, force.current + speed * 0.45)
    force.current *= 0.94
    m.uniforms.uForce.value = force.current
    m.uniforms.uPlane.value.set(size.width, size.height)
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  )
}

type Props = {
  showContent: boolean
  interactive: boolean
}

const textEase = [0.22, 1, 0.36, 1] as const

export default function Hero({ showContent, interactive }: Props) {
  const { t } = useLocale()
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, '80px', showContent)
  const [webglReady, setWebglReady] = useState(false)
  const show = showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
  const animateWebgl = interactive && inView
  const useWebgl = webglReady && interactive

  return (
    <section ref={sectionRef} id="top" className="relative h-[100svh] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/photos/dapple1.jpg"
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${useWebgl ? 'opacity-0' : 'opacity-100'}`}
          draggable={false}
        />
        {showContent && (
          <Canvas
            className={`!absolute inset-0 transition-opacity duration-1000 ${useWebgl ? 'opacity-100' : 'opacity-0'}`}
            dpr={[1, 1.35]}
            frameloop={animateWebgl ? 'always' : 'never'}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 1] }}
            onCreated={() => setWebglReady(true)}
          >
            <Suspense fallback={null}>
              <HeroPlane active={animateWebgl} />
            </Suspense>
          </Canvas>
        )}
      </div>

      <img
        src="/photos/face_cut.png"
        alt={t.hero.alt}
        className="absolute inset-0 z-[1] w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-10 md:pb-14 pointer-events-none">
        <motion.h1
          initial={false}
          animate={show}
          transition={{ duration: 0.75, delay: showContent ? 0.08 : 0, ease: textEase }}
          className="font-display leading-[0.82] text-center text-bone select-none [text-shadow:0_4px_60px_rgba(10,10,10,0.55)]"
        >
          <span className="block text-[16.5vw]">VICTORIA</span>
          <span className="block text-[16.5vw] outline-text">NEKRASOVA</span>
        </motion.h1>
        <motion.div
          initial={false}
          animate={show}
          transition={{ duration: 0.75, delay: showContent ? 0.18 : 0, ease: textEase }}
          className="relative h-0"
        >
          <span className="absolute left-1/2 -translate-x-1/2 -top-[9vw] font-serif italic text-blood text-[5.5vw] md:text-[4vw] whitespace-nowrap">
            {t.hero.tagline}
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={false}
        animate={show}
        transition={{ duration: 0.65, delay: showContent ? 0.28 : 0, ease: textEase }}
        className="absolute z-10 top-20 inset-x-5 md:inset-x-auto md:top-24 md:right-10 font-mono text-[8px] md:text-[10px] tracking-[0.18em] md:tracking-[0.3em] text-bone/70 text-center md:text-right leading-relaxed"
      >
        {t.hero.label}
        <br className="hidden md:inline" />
        <span className="md:hidden"> · </span>
        {t.hero.labelMeta}
      </motion.div>
      <motion.div
        initial={false}
        animate={showContent ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: showContent ? 0.45 : 0, ease: textEase }}
        className="absolute z-10 bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.4em] text-bone/50"
      >
        {t.hero.scroll}
      </motion.div>
    </section>
  )
}
