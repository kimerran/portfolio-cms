import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { FolderOpen, Plus, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboardPage() {
  const [totalProjects, publishedProjects, totalContacts, recentSubmissions] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.contactSubmission.count(),
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const draftProjects = totalProjects - publishedProjects
  const newContacts = await prisma.contactSubmission.count({ where: { status: 'new' } })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand">Dashboard</h1>
        <Link href="/admin/projects/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total projects', value: totalProjects, icon: FolderOpen },
          { label: 'Published', value: publishedProjects, icon: FolderOpen },
          { label: 'Drafts', value: draftProjects, icon: FolderOpen },
          { label: 'Submissions', value: totalContacts, icon: MessageSquare },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-card border border-brand-border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-brand">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-4">
        <Link href="/admin/projects/new">
          <Button variant="secondary">
            <Plus className="h-4 w-4" />
            Add new project
          </Button>
        </Link>
        <Link href="/admin/contacts">
          <Button variant="secondary">
            <MessageSquare className="h-4 w-4" />
            View submissions
            {newContacts > 0 && (
              <span className="ml-1 rounded-full bg-brand-accent px-1.5 py-0.5 text-xs text-white">
                {newContacts}
              </span>
            )}
          </Button>
        </Link>
      </div>

      {/* Recent submissions */}
      <div className="rounded-card border border-brand-border bg-white">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <h2 className="font-semibold text-brand">Recent submissions</h2>
          <Link href="/admin/contacts" className="text-sm text-brand-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-brand-border">
          {recentSubmissions.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-slate-500">No submissions yet.</p>
          )}
          {recentSubmissions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">{s.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{formatDate(s.createdAt)}</span>
                <Badge variant={s.status === 'new' ? 'warning' : 'default'}>
                  {s.status === 'new' ? 'New' : 'Read'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
