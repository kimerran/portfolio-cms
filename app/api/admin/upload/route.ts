import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { uploadImage } from '@/lib/storage'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  const type = formData.get('type')
  const projectId = formData.get('projectId')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (typeof type !== 'string' || !['cover', 'screenshot'].includes(type)) {
    return NextResponse.json({ error: 'type must be "cover" or "screenshot"' }, { status: 400 })
  }

  const contentType = file.type
  const ext = ALLOWED_TYPES[contentType]
  if (!ext) {
    return NextResponse.json(
      { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File size exceeds 5 MB limit.' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const pid = typeof projectId === 'string' && projectId ? projectId : 'temp'
  const path = `${type}/${pid}/${randomUUID()}.${ext}`

  try {
    const url = await uploadImage(buffer, path, contentType)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Image upload failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
