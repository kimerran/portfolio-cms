'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface ImageUploaderProps {
  label?: string
  currentUrl?: string | null
  type: 'cover' | 'screenshot'
  projectId?: string
  onUpload: (url: string) => void
  onRemove?: () => void
}

export function ImageUploader({
  label = 'Image',
  currentUrl,
  type,
  projectId,
  onUpload,
  onRemove,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (projectId) formData.append('projectId', projectId)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Upload failed')
        return
      }

      if (data.url) {
        onUpload(data.url)
      }
    } catch {
      setError('Network error during upload')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}

      {currentUrl ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-brand-border">
          <div className="relative aspect-video w-full bg-slate-100">
            <Image src={currentUrl} alt={label} fill className="object-cover" sizes="384px" />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-6 py-8 text-center hover:border-brand-accent transition-colors"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label={`Upload ${label}`}
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
          ) : (
            <Upload className="h-8 w-8 text-slate-400" />
          )}
          <span className="text-sm text-slate-500">
            {loading ? 'Uploading…' : 'Click to upload (JPEG, PNG, WebP · max 5 MB)'}
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-label={`Upload ${label}`}
      />

      {!currentUrl && currentUrl !== undefined && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          loading={loading}
          className="self-start"
        >
          <Upload className="h-4 w-4" />
          Choose file
        </Button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
