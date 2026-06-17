import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'

export default function NotFoundPage() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-[10px] tracking-[0.4em] text-bone/40 mb-6">{t.notFound.code}</p>
      <h1 className="font-display text-5xl md:text-7xl mb-4">
        {t.notFound.title}<span className="text-blood">.</span>
      </h1>
      <p className="font-mono text-xs text-bone/50 max-w-sm mb-10 leading-relaxed">
        {t.notFound.text}
      </p>
      <Link
        to="/"
        className="font-mono text-[10px] tracking-[0.35em] border border-bone/30 px-6 py-3 hover:bg-bone hover:text-ink transition-colors duration-200"
      >
        {t.notFound.back}
      </Link>
    </div>
  )
}
