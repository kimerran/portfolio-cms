import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const where = {
    published: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { summary: { contains: q, mode: 'insensitive' as const } },
            { techStack: { some: { name: { contains: q, mode: 'insensitive' as const } } } },
          ],
        }
      : {}),
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { techStack: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    }),
    prisma.project.count({ where }),
  ])

  return NextResponse.json({ projects, total })
}
