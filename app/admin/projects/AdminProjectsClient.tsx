'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'
import { Pencil, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProjectRow {
  id: string
  title: string
  slug: string
  published: boolean
  createdAt: string
}

export interface AdminProjectsClientProps {
  initialProjects: ProjectRow[]
  page: number
  totalPages: number
}

export function AdminProjectsClient({ initialProjects, page, totalPages }: AdminProjectsClientProps) {
  const router = useRouter()
  const [projects, setProjects] = useState(initialProjects)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function togglePublish(id: string, currentlyPublished: boolean) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentlyPublished }),
      })
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, published: !currentlyPublished } : p)),
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteProject(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id))
        setConfirmDelete(null)
        router.refresh()
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-card border border-brand-border bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-brand-border bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Created</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No projects yet.
                </td>
              </tr>
            )}
            {projects.map((p) => (
              <tr key={p.id} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.published ? 'success' : 'warning'}>
                    {p.published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {formatDate(p.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/projects/${p.id}/edit`}>
                      <Button variant="ghost" size="sm" aria-label="Edit project">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void togglePublish(p.id, p.published)}
                      loading={actionLoading === p.id}
                      aria-label={p.published ? 'Unpublish' : 'Publish'}
                    >
                      {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(p.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      aria-label="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Link href={`/admin/projects?page=${page - 1}`}>
            <Button variant="secondary" size="sm" disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </Link>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Link href={`/admin/projects?page=${page + 1}`}>
            <Button variant="secondary" size="sm" disabled={page >= totalPages}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      <Modal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete project?"
      >
        <p className="mb-6 text-sm text-slate-600">
          This will permanently delete the project and all its associated screenshots and tech
          tags. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={actionLoading === confirmDelete}
            onClick={() => confirmDelete && void deleteProject(confirmDelete)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
