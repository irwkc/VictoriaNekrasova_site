import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import Lenis from 'lenis'
import { initMediaUnlock } from '../lib/unlockMedia'
import { useIdleMount } from '../lib/useInView'
import { scrollToHash, setSmoothScroller } from '../lib/smoothScroll'
import Preloader from '../components/Preloader'
import Cursor from '../components/Cursor'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Storyboard from '../components/Storyboard'
import Editorial from '../components/Editorial'
import Tunnel from '../components/Tunnel'
import Gallery from '../components/Gallery'
import Albums from '../components/Albums'
import Footer from '../components/Footer'

const ease = [0.22, 1, 0.36, 1] as const

export default function HomePage() {
  const [revealing, setRevealing] = useState(false)
  const [entered, setEntered] = useState(false)
  const heavyReady = useIdleMount(entered, 900)
  const location = useLocation()

  useEffect(() => {
    document.getElementById('boot-splash')?.remove()
  }, [])

  useEffect(() => initMediaUnlock(), [])

  useEffect(() => {
    if (!entered) return

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafari) return

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    document.documentElement.classList.add('lenis', 'lenis-smooth')
    setSmoothScroller(lenis)

    let raf = 0
    const tick = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      setSmoothScroller(null)
      document.documentElement.classList.remove('lenis', 'lenis-smooth')
    }
  }, [entered])

  useEffect(() => {
    if (!entered) return
    const hash = location.hash
    if (!hash) return

    const id = hash.slice(1)
    if (id === 'portfolio' && !heavyReady) return

    scrollToHash(hash, { delay: 120 })
  }, [entered, heavyReady, location.hash])

  useEffect(() => {
    document.documentElement.style.overflow = entered ? '' : 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [entered])

  const showHero = revealing || entered

  return (
    <>
      <Cursor />
      <div
        className="grain bg-ink text-bone antialiased"
        aria-hidden={!entered}
        style={{ pointerEvents: entered ? undefined : 'none' }}
      >
        <motion.div
          initial={false}
          animate={showHero ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.55, delay: showHero ? 0.05 : 0, ease }}
        >
          <Nav />
        </motion.div>
        <main>
          <Hero showContent={showHero} interactive={entered} />
          {entered && <Marquee />}
          {entered && (
            <>
              <Storyboard />
              <Editorial />
              <Tunnel />
            </>
          )}
          {heavyReady && (
            <>
              <Gallery />
              <Albums />
            </>
          )}
        </main>
        {entered && <Footer />}
      </div>
      {!entered && (
        <Preloader
          onReveal={() => setRevealing(true)}
          onDone={() => setEntered(true)}
        />
      )}
    </>
  )
}
