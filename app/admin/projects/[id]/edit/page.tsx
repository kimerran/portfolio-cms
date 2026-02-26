import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProjectForm } from '@/components/admin/ProjectForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({ where: { id: params.id } })
  return { title: project ? `Edit: ${project.title}` : 'Edit Project' }
}

export default async function EditProjectPage({ params }: PageProps) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      techStack: true,
      screenshots: { orderBy: { order: 'asc' } },
    },
  })

  if (!project) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/projects"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <h1 className="text-2xl font-bold text-brand">Edit: {project.title}</h1>
      </div>

      <ProjectForm
        projectId={project.id}
        initialData={{
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          description: project.description,
          coverImageUrl: project.coverImageUrl ?? '',
          liveDemoUrl: project.liveDemoUrl ?? '',
          youtubeUrl: project.youtubeUrl ?? '',
          published: project.published,
          sortOrder: project.sortOrder,
          techStack: project.techStack.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category ?? 'Other',
            color: t.color ?? '#6366F1',
          })),
          screenshots: project.screenshots.map((s) => ({
            id: s.id,
            url: s.url,
            altText: s.altText ?? '',
            order: s.order,
          })),
        }}
      />
    </div>
  )
}
