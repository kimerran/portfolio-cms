'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lightbox } from '@/components/Lightbox'

export interface ScreenshotItem {
  id: string
  url: string
  altText?: string | null
  order: number
}

export interface ScreenshotGalleryProps {
  screenshots: ScreenshotItem[]
  projectTitle: string
}

export function ScreenshotGallery({ screenshots, projectTitle }: ScreenshotGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (screenshots.length === 0) return null

  const sorted = [...screenshots].sort((a, b) => a.order - b.order)

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-3" role="list" aria-label="Project screenshots">
        {sorted.map((screenshot, i) => (
          <button
            key={screenshot.id}
            onClick={() => setLightboxIndex(i)}
            className="relative h-24 w-40 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-brand-border transition-all hover:border-brand-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
            role="listitem"
            aria-label={`Screenshot ${i + 1}: ${screenshot.altText ?? projectTitle}`}
          >
            <Image
              src={screenshot.url}
              alt={screenshot.altText ?? `${projectTitle} screenshot ${i + 1}`}
              fill
              className="object-cover"
              sizes="160px"
            />
          </button>
        ))}
      </div>

      <Lightbox
        images={sorted.map((s) => ({ url: s.url, alt: s.altText ?? `${projectTitle} screenshot` }))}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  )
}
