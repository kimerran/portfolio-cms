import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/storage'

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const key = params.path.join('/')
  if (!key) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const response = await s3().send(
      new GetObjectCommand({ Bucket: process.env.BUCKET!, Key: key }),
    )
    const stream = response.Body?.transformToWebStream()
    if (!stream) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return new NextResponse(stream, {
      headers: {
        'Content-Type': response.ContentType ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(response.ContentLength ? { 'Content-Length': String(response.ContentLength) } : {}),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
