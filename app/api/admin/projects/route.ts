import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'all'
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const where = {
    ...(status === 'published' ? { published: true } : status === 'draft' ? { published: false } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { slug: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { techStack: true, screenshots: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    }),
    prisma.project.count({ where }),
  ])

  return NextResponse.json({ projects, total })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    title,
    slug: rawSlug,
    summary,
    description,
    coverImageUrl,
    liveDemoUrl,
    youtubeUrl,
    published,
    sortOrder,
    techStack,
  } = body as Record<string, unknown>

  if (typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Validation failed', fields: { title: 'Title is required' } }, { status: 400 })
  }

  const slug = typeof rawSlug === 'string' && rawSlug.trim() ? slugify(rawSlug.trim()) : slugify(title)

  try {
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        slug,
        summary: typeof summary === 'string' ? summary.trim().slice(0, 300) : '',
        description: typeof description === 'string' ? description : '',
        coverImageUrl: typeof coverImageUrl === 'string' && coverImageUrl ? coverImageUrl : null,
        liveDemoUrl: typeof liveDemoUrl === 'string' && liveDemoUrl ? liveDemoUrl : null,
        youtubeUrl: typeof youtubeUrl === 'string' && youtubeUrl ? youtubeUrl : null,
        published: typeof published === 'boolean' ? published : false,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        techStack: {
          create: Array.isArray(techStack)
            ? techStack.map((tag: Record<string, unknown>) => ({
                name: String(tag.name ?? '').trim(),
                category: typeof tag.category === 'string' ? tag.category : null,
                color: typeof tag.color === 'string' ? tag.color : null,
              }))
            : [],
        },
      },
      include: { techStack: true, screenshots: true },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Validation failed', fields: { slug: 'A project with this slug already exists' } },
        { status: 400 },
      )
    }
    console.error('Failed to create project:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
