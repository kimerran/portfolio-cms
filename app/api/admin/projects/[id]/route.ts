import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { slugify } from '@/lib/utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.project.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
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
    screenshots,
  } = body as Record<string, unknown>

  const slug =
    typeof rawSlug === 'string' && rawSlug.trim()
      ? slugify(rawSlug.trim())
      : typeof title === 'string' && title.trim()
        ? slugify(title.trim())
        : existing.slug

  try {
    const project = await prisma.$transaction(async (tx) => {
      // Replace tech stack if provided
      if (Array.isArray(techStack)) {
        await tx.techTag.deleteMany({ where: { projectId: params.id } })
        await tx.techTag.createMany({
          data: techStack.map((tag: Record<string, unknown>) => ({
            projectId: params.id,
            name: String(tag.name ?? '').trim(),
            category: typeof tag.category === 'string' ? tag.category : null,
            color: typeof tag.color === 'string' ? tag.color : null,
          })),
        })
      }

      // Replace screenshots if provided
      if (Array.isArray(screenshots)) {
        await tx.screenshot.deleteMany({ where: { projectId: params.id } })
        await tx.screenshot.createMany({
          data: screenshots.map((s: Record<string, unknown>, i: number) => ({
            projectId: params.id,
            url: String(s.url ?? ''),
            altText: typeof s.altText === 'string' ? s.altText : null,
            order: typeof s.order === 'number' ? s.order : i,
          })),
        })
      }

      return tx.project.update({
        where: { id: params.id },
        data: {
          ...(typeof title === 'string' && title.trim() ? { title: title.trim() } : {}),
          slug,
          ...(typeof summary === 'string' ? { summary: summary.trim().slice(0, 300) } : {}),
          ...(typeof description === 'string' ? { description } : {}),
          ...(coverImageUrl !== undefined
            ? { coverImageUrl: typeof coverImageUrl === 'string' && coverImageUrl ? coverImageUrl : null }
            : {}),
          ...(liveDemoUrl !== undefined
            ? { liveDemoUrl: typeof liveDemoUrl === 'string' && liveDemoUrl ? liveDemoUrl : null }
            : {}),
          ...(youtubeUrl !== undefined
            ? { youtubeUrl: typeof youtubeUrl === 'string' && youtubeUrl ? youtubeUrl : null }
            : {}),
          ...(typeof published === 'boolean' ? { published } : {}),
          ...(typeof sortOrder === 'number' ? { sortOrder } : {}),
        },
        include: { techStack: true, screenshots: { orderBy: { order: 'asc' } } },
      })
    })

    return NextResponse.json(project)
  } catch (err: unknown) {
    const error = err as { code?: string }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Validation failed', fields: { slug: 'A project with this slug already exists' } },
        { status: 400 },
      )
    }
    console.error('Failed to update project:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.project.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.project.delete({ where: { id: params.id } })

  return new NextResponse(null, { status: 204 })
}
