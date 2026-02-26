import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProjectForm } from '@/components/admin/ProjectForm'

export const metadata: Metadata = { title: 'New Project' }

export default function NewProjectPage() {
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
        <h1 className="text-2xl font-bold text-brand">New project</h1>
      </div>

      <ProjectForm />
    </div>
  )
}
