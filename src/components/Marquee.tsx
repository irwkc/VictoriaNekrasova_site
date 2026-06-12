const WORDS = [
  'MOTION', 'BLUR', 'EDITORIAL', 'RUNWAY', 'OUT OF FOCUS', 'PROJECTION',
  'SILHOUETTE', 'NO RETOUCH', 'FRAME BY FRAME', 'SHUTTER 1/15',
]

export default function Marquee({ light = false }: { light?: boolean }) {
  const row = [...WORDS, ...WORDS]
  return (
    <div
      className={`relative z-10 overflow-hidden border-y py-3 select-none ${
        light ? 'border-ink/15 bg-bone text-ink' : 'border-bone/10 bg-ink text-bone'
      }`}
    >
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-8 font-mono text-xs tracking-[0.35em]">
            {w}
            <span className="text-blood">✕</span>
          </span>
        ))}
      </div>
    </div>
  )
}
