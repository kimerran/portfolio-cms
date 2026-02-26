import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { TechBadge } from '@/components/TechBadge'
import { ScreenshotGallery } from '@/components/ScreenshotGallery'
import { SafeHtml } from '@/components/SafeHtml'
import { toYouTubeEmbedUrl, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await prisma.project.findFirst({
    where: { slug: params.slug, published: true },
  })

  if (!project) return {}

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.coverImageUrl ? [{ url: project.coverImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.summary,
      images: project.coverImageUrl ? [project.coverImageUrl] : [],
    },
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await prisma.project.findFirst({
    where: { slug: params.slug, published: true },
    include: {
      techStack: true,
      screenshots: { orderBy: { order: 'asc' } },
    },
  })

  if (!project) notFound()

  const embedUrl = project.youtubeUrl ? toYouTubeEmbedUrl(project.youtubeUrl) : null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.summary,
    url: `${appUrl}/projects/${project.slug}`,
    ...(project.coverImageUrl && { image: project.coverImageUrl }),
    ...(project.liveDemoUrl && { installUrl: project.liveDemoUrl }),
    datePublished: project.createdAt.toISOString(),
    applicationCategory: 'WebApplication',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back link */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      {/* Cover image */}
      {project.coverImageUrl && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-card">
          <Image
            src={project.coverImageUrl}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-brand">{project.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">{project.summary}</p>

        {project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((tag) => (
              <TechBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Live demo
            </a>
          )}
          <span className="text-sm text-slate-500">{formatDate(project.createdAt)}</span>
        </div>
      </header>

      {/* YouTube embed */}
      {embedUrl && (
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-card">
          <iframe
            src={embedUrl}
            title={`${project.title} demo video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      )}

      {/* Description */}
      {project.description && (
        <section className="mb-10">
          <SafeHtml html={project.description} className="text-base leading-relaxed" />
        </section>
      )}

      {/* Screenshots */}
      {project.screenshots.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold text-brand">Screenshots</h2>
          <ScreenshotGallery screenshots={project.screenshots} projectTitle={project.title} />
        </section>
      )}

      {/* Footer nav */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>
    </div>
  )
}
