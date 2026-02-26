import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminProjectsClient } from './AdminProjectsClient'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Projects' }

interface PageProps {
  searchParams: { page?: string }
}

const PAGE_SIZE = 20

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      include: { techStack: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: PAGE_SIZE,
      skip: offset,
    }),
    prisma.project.count(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand">Projects</h1>
        <Link href="/admin/projects/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </Link>
      </div>

      <AdminProjectsClient
        initialProjects={projects.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          published: p.published,
          createdAt: p.createdAt.toISOString(),
        }))}
        page={page}
        totalPages={totalPages}
      />
    </div>
  )
}
