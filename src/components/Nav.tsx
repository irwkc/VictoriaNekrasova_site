const IG = 'https://www.instagram.com/victorianekrasovaaa/'

export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-[80] mix-blend-difference">
      <div className="flex items-center justify-between px-5 md:px-10 py-5">
        <a href="#top" className="font-display text-lg tracking-wide text-bone">
          VN<span className="text-blood">.</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-[0.3em] text-bone/80">
          <a href="#sequence" className="hover:text-bone transition-colors duration-200">SEQUENCE</a>
          <a href="#editorial" className="hover:text-bone transition-colors duration-200">EDITORIAL</a>
          <a href="#archive" className="hover:text-bone transition-colors duration-200">ARCHIVE</a>
          <a href="#contact" className="hover:text-bone transition-colors duration-200">CONTACT</a>
        </nav>
        <a
          href={IG}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[10px] tracking-[0.3em] border border-bone/40 px-4 py-2 text-bone hover:bg-bone hover:text-ink transition-colors duration-200"
        >
          BOOK
        </a>
      </div>
    </header>
  )
}
