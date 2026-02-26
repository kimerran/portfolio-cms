import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()
  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE ?? 'Portfolio'
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? ''
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? ''

  return (
    <footer className="border-t border-brand-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-between md:px-6">
        <p className="text-sm text-slate-500">© {year} {siteTitle}. All rights reserved.</p>
        <div className="flex items-center gap-4">
          {githubUrl && (
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
          )}
          {linkedinUrl && (
            <Link
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </footer>
  )
}
