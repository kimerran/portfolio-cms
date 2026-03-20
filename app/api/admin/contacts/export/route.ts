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

const BATCH_SIZE = 500

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const header = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Status', 'IP Address', 'Received At']
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(header.join(',') + '\n'))

      let skip = 0
      while (true) {
        const batch = await prisma.contactSubmission.findMany({
          orderBy: { createdAt: 'desc' },
          take: BATCH_SIZE,
          skip,
        })
        if (batch.length === 0) break

        const rows = batch.map((s) =>
          [
            escapeCsv(s.id),
            escapeCsv(s.name),
            escapeCsv(s.email),
            escapeCsv(s.subject),
            escapeCsv(s.message),
            escapeCsv(s.status),
            escapeCsv(s.ipAddress),
            escapeCsv(s.createdAt.toISOString()),
          ].join(','),
        )
        controller.enqueue(encoder.encode(rows.join('\n') + '\n'))

        skip += batch.length
        if (batch.length < BATCH_SIZE) break
      }

      controller.close()
    },
  })

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
