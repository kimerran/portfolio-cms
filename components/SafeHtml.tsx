'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { cn } from '@/lib/utils'

export interface SafeHtmlProps {
  html: string
  className?: string
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const clean = useMemo(() => {
    if (typeof window === 'undefined') return html
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class'],
    })
  }, [html])

  return (
    <div
      className={cn('prose prose-slate max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
