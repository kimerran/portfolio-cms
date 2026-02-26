import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactNotification } from '@/lib/resend'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const rateLimitKey = `contact:${ip}`

  const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 5, windowMs: 60 * 60 * 1000 })
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, subject, message, _hp } = body as {
    name?: unknown
    email?: unknown
    subject?: unknown
    message?: unknown
    _hp?: unknown
  }

  // Honeypot check
  if (_hp !== '') {
    return NextResponse.json({ success: true, message: 'Your message has been sent!' }, { status: 201 })
  }

  const errors: Record<string, string> = {}

  if (typeof name !== 'string' || !name.trim()) {
    errors.name = 'Name is required'
  } else if (name.trim().length > 100) {
    errors.name = 'Name must be 100 characters or fewer'
  }

  if (typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (typeof message !== 'string' || !message.trim()) {
    errors.message = 'Message is required'
  } else if (message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters'
  } else if (message.trim().length > 2000) {
    errors.message = 'Message must be 2000 characters or fewer'
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
  }

  const submission = await prisma.contactSubmission.create({
    data: {
      name: (name as string).trim(),
      email: (email as string).trim().toLowerCase(),
      subject: typeof subject === 'string' && subject.trim() ? subject.trim() : null,
      message: (message as string).trim(),
      ipAddress: ip,
    },
  })

  try {
    await sendContactNotification(submission)
  } catch (err) {
    console.error('Failed to send contact email notification:', err)
  }

  return NextResponse.json(
    { success: true, message: 'Your message has been sent!' },
    { status: 201 },
  )
}
