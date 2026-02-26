'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { ProjectGrid } from '@/components/ProjectGrid'
import type { Project, TechTag } from '@prisma/client'

export interface ProjectsClientPageProps {
  projects: (Project & { techStack: TechTag[] })[]
}

export function ProjectsClientPage({ projects }: ProjectsClientPageProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedQuery(value), 300)
  }, [])

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return projects
    const q = debouncedQuery.toLowerCase().trim()
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.name.toLowerCase().includes(q)),
    )
  }, [projects, debouncedQuery])

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
      <div className="mb-10">
        <SearchBar value={query} onChange={handleQueryChange} className="max-w-xl" />
      </div>
      <ProjectGrid projects={filtered} />
    </section>
  )
}
