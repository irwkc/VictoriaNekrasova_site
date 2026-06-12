import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Storyboard from './components/Storyboard'
import Editorial from './components/Editorial'
import Tunnel from './components/Tunnel'
import Gallery from './components/Gallery'
import Footer from './components/Footer'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    let raf = 0
    const tick = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = ready ? '' : 'hidden'
  }, [ready])

  return (
    <div className="grain bg-ink text-bone antialiased">
      <Cursor />
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Storyboard />
        <Editorial />
        <Tunnel />
        <Gallery />
      </main>
      <Footer />
    </div>
  )
}
