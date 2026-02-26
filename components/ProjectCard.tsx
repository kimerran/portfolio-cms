import Image from 'next/image'
import Link from 'next/link'
import { TechBadge } from '@/components/TechBadge'
import type { Project, TechTag } from '@prisma/client'

export interface ProjectCardProps {
  project: Project & { techStack: TechTag[] }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const topTags = project.techStack.slice(0, 3)

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-brand-border bg-brand-surface transition-all hover:-translate-y-0.5 hover:border-brand-accent/30 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {project.coverImageUrl ? (
          <Image
            src={project.coverImageUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <span className="text-4xl font-bold text-slate-400">{project.title[0]}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold text-brand leading-snug group-hover:text-brand-accent transition-colors">
          {project.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{project.summary}</p>

        {topTags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {topTags.map((tag) => (
              <TechBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
