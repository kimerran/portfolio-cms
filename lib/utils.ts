import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function toYouTubeEmbedUrl(url: string): string {
  if (!url) return url

  // Already an embed URL
  if (url.includes('youtube.com/embed/')) return url

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`
  }

  // youtube.com/watch?v=VIDEO_ID
  const longMatch = url.match(/[?&]v=([^&]+)/)
  if (longMatch) {
    return `https://www.youtube.com/embed/${longMatch[1]}`
  }

  return url
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
