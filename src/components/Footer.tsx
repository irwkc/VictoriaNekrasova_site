import Marquee from './Marquee'
import { useLocale } from '../context/LocaleProvider'

const IG = 'https://www.instagram.com/victorianekrasovaaa/'

export default function Footer() {
  const { t } = useLocale()

  return (
    <footer id="contact" className="relative bg-ink border-t border-bone/10">
      <Marquee />
      <div className="px-5 md:px-10 py-24 md:py-32 text-center">
        <div className="font-mono text-[10px] tracking-[0.35em] text-bone/50 mb-8">
          {t.footer.nextFrame}
        </div>
        <a
          href={IG}
          target="_blank"
          rel="noreferrer"
          className="group inline-block"
          data-hover
        >
          <span className="block font-display text-[17vw] md:text-[13vw] leading-[0.85] text-bone transition-colors duration-300 group-hover:text-blood">
            {t.footer.bookHer}
          </span>
          <span className="block mt-4 font-serif italic text-2xl md:text-3xl text-blood group-hover:text-bone transition-colors duration-300">
            @victorianekrasovaaa
          </span>
        </a>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px] tracking-[0.3em] text-bone/40">
          <span>{t.footer.published}</span>
          <span>{t.footer.rights}</span>
        </div>

        <p className="mt-10 font-mono text-[9px] tracking-[0.25em] text-bone/30">
          {t.footer.madeBy}{' '}
          <a
            href="https://github.com/irwkc"
            target="_blank"
            rel="noreferrer"
            className="text-bone/50 hover:text-blood transition-colors duration-200"
            data-hover
          >
            irwkc
          </a>
        </p>
      </div>
    </footer>
  )
}
