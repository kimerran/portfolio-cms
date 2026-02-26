'use client'

import { useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

export interface CalendlyWidgetProps {
  url: string
}

export function CalendlyWidget({ url }: CalendlyWidgetProps) {
  useEffect(() => {
    if (!url) return

    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [url])

  if (!url) {
    const email = process.env.NEXT_PUBLIC_EMAIL
    return (
      <div className="rounded-card border border-brand-border bg-slate-50 p-6 text-center">
        <p className="mb-4 text-slate-600">Prefer to have a conversation?</p>
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Send me an email
          </a>
        )}
      </div>
    )
  }

  return (
    <div
      className="calendly-inline-widget w-full overflow-hidden rounded-card border border-brand-border"
      data-url={url}
      style={{ minWidth: '320px', height: '700px' }}
    />
  )
}
