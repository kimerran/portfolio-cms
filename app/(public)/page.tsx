import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProjectsClientPage } from '@/components/ProjectsClientPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Browse my software engineering projects.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    include: { techStack: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <>
      {/* Hero */}
      <section className="border-b border-brand-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-brand md:text-5xl">
            Hi, I&apos;m a software engineer.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            I build thoughtful software ranging from backends, blockchain applications and AI. Here are some of my recent projects.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center rounded-lg bg-brand-accent px-6 py-3 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </section>

      {/* Projects */}
      <div className="py-12">
        <ProjectsClientPage projects={projects} />
      </div>
    </>
  )
}
