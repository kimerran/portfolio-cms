'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Trash2, Eye } from 'lucide-react'

export interface Submission {
  id: string
  name: string
  email: string
  subject?: string | null
  message: string
  status: string
  createdAt: string
}

export interface SubmissionsTableProps {
  initialSubmissions: Submission[]
}

export function SubmissionsTable({ initialSubmissions }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function markRead(id: string) {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' }),
    })
    if (res.ok) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'read' } : s)),
      )
    }
  }

  async function deleteSubmission(id: string) {
    const res = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
      setConfirmDelete(null)
      if (selected?.id === id) setSelected(null)
    }
  }

  function openSubmission(s: Submission) {
    setSelected(s)
    if (s.status === 'new') {
      void markRead(s.id)
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-card border border-brand-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-brand-border bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Subject</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {submissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No submissions yet.
                </td>
              </tr>
            )}
            {submissions.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer bg-white hover:bg-slate-50 transition-colors"
                onClick={() => openSubmission(s)}
              >
                <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.email}</td>
                <td className="px-4 py-3 text-slate-600">{s.subject ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {formatDate(s.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={s.status === 'new' ? 'warning' : 'default'}>
                    {s.status === 'new' ? 'New' : 'Read'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSubmission(s)}
                      aria-label="View submission"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(s.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      aria-label="Delete submission"
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

      {/* Detail modal */}
      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={`Message from ${selected?.name ?? ''}`}
        className="max-w-lg"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-slate-500">From</span>
                <p className="text-slate-900">{selected.name}</p>
              </div>
              <div>
                <span className="font-medium text-slate-500">Email</span>
                <p className="text-slate-900">{selected.email}</p>
              </div>
              {selected.subject && (
                <div className="col-span-2">
                  <span className="font-medium text-slate-500">Subject</span>
                  <p className="text-slate-900">{selected.subject}</p>
                </div>
              )}
              <div className="col-span-2">
                <span className="font-medium text-slate-500">Received</span>
                <p className="text-slate-900">{formatDate(selected.createdAt)}</p>
              </div>
            </div>
            <hr className="border-brand-border" />
            <div>
              <span className="text-sm font-medium text-slate-500">Message</span>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{selected.message}</p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDelete(selected.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete submission?"
      >
        <p className="mb-6 text-sm text-slate-600">
          This action cannot be undone. The submission will be permanently deleted.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => confirmDelete && void deleteSubmission(confirmDelete)}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
