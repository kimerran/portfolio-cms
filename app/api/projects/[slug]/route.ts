import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const project = await prisma.project.findFirst({
    where: { slug: params.slug, published: true },
    include: {
      techStack: true,
      screenshots: { orderBy: { order: 'asc' } },
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}
