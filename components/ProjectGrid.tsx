import { ProjectCard } from '@/components/ProjectCard'
import type { Project, TechTag } from '@prisma/client'

export interface ProjectGridProps {
  projects: (Project & { techStack: TechTag[] })[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">No projects found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
