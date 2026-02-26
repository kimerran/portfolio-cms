import type { Metadata } from 'next'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { SubmissionsTable } from '@/components/admin/SubmissionsTable'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contact Submissions' }

export default async function AdminContactsPage() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand">Contact Submissions</h1>
        <Link href="/api/admin/contacts/export" target="_blank">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </Link>
      </div>

      <SubmissionsTable
        initialSubmissions={submissions.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          subject: s.subject,
          message: s.message,
          status: s.status,
          createdAt: s.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
