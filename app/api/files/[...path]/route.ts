import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

function createS3Client(): S3Client {
  return new S3Client({
    region: process.env.REGION ?? 'auto',
    endpoint: process.env.ENDPOINT ?? 'https://storage.railway.app',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
  })
}

let _s3: S3Client | null = null
function s3(): S3Client {
  _s3 ??= createS3Client()
  return _s3
}

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
    const bytes = await response.Body?.transformToByteArray()
    if (!bytes) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': response.ContentType ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
