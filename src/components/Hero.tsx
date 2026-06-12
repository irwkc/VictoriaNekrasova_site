import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { motion } from 'motion/react'
import { useInViewport } from '../lib/useInViewport'

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
  uniform float uScroll;
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

    // slight zoom-out as you scroll away
    uv = (uv - 0.5) * (1.0 - uScroll * 0.12) + 0.5;

    // liquid drift
    uv.x += sin(uv.y * 7.0 + uTime * 0.5) * 0.0045;
    uv.y += cos(uv.x * 6.0 + uTime * 0.4) * 0.0045;

    // mouse ripple
    vec2 aspect = vec2(uPlane.x / uPlane.y, 1.0);
    vec2 d = (uv - uMouse) * aspect;
    float dist = length(d);
    float ripple = exp(-dist * dist * 14.0) * uForce;
    uv -= normalize(d + 1e-6) * ripple * 0.05;

    vec2 cuv = cover(uv);

    // chromatic split driven by ripple
    float split = 0.0022 + ripple * 0.014;
    float r = texture2D(uTex, cuv + vec2(split, 0.0)).r;
    float g = texture2D(uTex, cuv).g;
    float b = texture2D(uTex, cuv - vec2(split, 0.0)).b;
    vec3 col = vec3(r, g, b);

    // vignette
    float vig = smoothstep(1.15, 0.35, length(vUv - 0.5));
    col *= mix(0.55, 1.0, vig);

    // scanline shimmer
    col += sin(vUv.y * 900.0 + uTime * 2.0) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`

function HeroPlane() {
  const tex = useLoader(THREE.TextureLoader, '/photos/dapple1.jpg')
  const { viewport, size } = useThree()
  const mat = useRef<THREE.ShaderMaterial>(null)
  const target = useRef(new THREE.Vector2(0.5, 0.5))
  const force = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uForce: { value: 0 },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPlane: { value: new THREE.Vector2(1, 1) },
      uImage: { value: new THREE.Vector2(tex.image.width, tex.image.height) },
    }),
    [tex],
  )

  useFrame((state, delta) => {
    const m = mat.current
    if (!m) return
    m.uniforms.uTime.value += delta

    const p = state.pointer // -1..1
    target.current.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5)
    const cur = m.uniforms.uMouse.value as THREE.Vector2
    const before = cur.clone()
    cur.lerp(target.current, 0.07)
    const speed = cur.distanceTo(before) * 60
    force.current = Math.min(1.4, force.current + speed * 0.45)
    force.current *= 0.94
    m.uniforms.uForce.value = force.current

    m.uniforms.uScroll.value = Math.min(1, window.scrollY / window.innerHeight)
    m.uniforms.uPlane.value.set(size.width, size.height)
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  )
}

const fade = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const inView = useInViewport(section)
  return (
    <section ref={section} id="top" className="relative h-[100svh] overflow-hidden">
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 1.5]}
        frameloop={inView ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 1] }}
      >
        <HeroPlane />
      </Canvas>

      {/* face cutout — static layer, untouched by the cursor effect */}
      <img
        src="/photos/face_cut.png"
        alt="Victoria Nekrasova"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* type overlay */}
      <div className="absolute inset-0 flex flex-col justify-end pb-10 md:pb-14 pointer-events-none">
        <motion.h1
          {...fade}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display leading-[0.82] text-center text-bone select-none [text-shadow:0_4px_60px_rgba(10,10,10,0.55)]"
        >
          <span className="block text-[16.5vw]">VICTORIA</span>
          <span className="block text-[16.5vw] outline-text">NEKRASOVA</span>
        </motion.h1>
        <motion.div
          {...fade}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-0"
        >
          <span className="absolute left-1/2 -translate-x-1/2 -top-[9vw] font-serif italic text-blood text-[5.5vw] md:text-[4vw] whitespace-nowrap">
            in motion, out of focus
          </span>
        </motion.div>
      </div>

      {/* corner labels */}
      <motion.div
        {...fade}
        transition={{ duration: 0.8, delay: 0.55 }}
        className="absolute top-24 left-5 md:left-10 font-mono text-[10px] tracking-[0.3em] text-bone/70 leading-relaxed"
      >
        IMF MODEL AGENCY
        <br />
        EDITORIAL / RUNWAY / CAMPAIGN
      </motion.div>
      <motion.div
        {...fade}
        transition={{ duration: 0.8, delay: 0.65 }}
        className="absolute top-24 right-5 md:right-10 font-mono text-[10px] tracking-[0.3em] text-bone/70 text-right leading-relaxed"
      >
        MOB JOURNAL — VOL.13
        <br />
        SHUTTER 1/15 · NO FLASH
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.4em] text-bone/50"
      >
        SCROLL TO ENTER THE SEQUENCE ↓
      </motion.div>
    </section>
  )
}
