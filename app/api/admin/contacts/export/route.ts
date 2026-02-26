import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

function escapeCsv(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const header = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Status', 'IP Address', 'Received At']
  const rows = submissions.map((s) => [
    escapeCsv(s.id),
    escapeCsv(s.name),
    escapeCsv(s.email),
    escapeCsv(s.subject),
    escapeCsv(s.message),
    escapeCsv(s.status),
    escapeCsv(s.ipAddress),
    escapeCsv(s.createdAt.toISOString()),
  ])

  const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
