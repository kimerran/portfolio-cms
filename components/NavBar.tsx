import Link from 'next/link'

export function NavBar() {
  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE ?? 'Portfolio'

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link
          href="/"
          className="text-lg font-bold text-brand hover:text-brand-accent transition-colors"
        >
          {siteTitle}
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-brand-accent transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-slate-600 hover:text-brand-accent transition-colors"
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  )
}
