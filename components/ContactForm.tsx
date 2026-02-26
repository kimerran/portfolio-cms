'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

interface FormState {
  name: string
  email: string
  subject: string
  message: string
  _hp: string
}

interface FieldErrors {
  name?: string
  email?: string
  message?: string
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
    _hp: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [globalError, setGlobalError] = useState('')

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setGlobalError('')
    setErrors({})

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = (await res.json()) as {
        error?: string
        fields?: FieldErrors
        message?: string
      }

      if (!res.ok) {
        if (data.fields) {
          setErrors(data.fields)
        } else {
          setGlobalError(data.error ?? 'Something went wrong. Please try again.')
        }
        return
      }

      setSuccess(true)
    } catch {
      setGlobalError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h3 className="text-xl font-semibold text-slate-900">Message sent!</h3>
        <p className="text-slate-600">Thanks for reaching out. I&apos;ll get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Honeypot — hidden from users */}
      <input
        type="text"
        name="_hp"
        value={form._hp}
        onChange={set('_hp')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          id="name"
          label="Name *"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          required
        />
        <Input
          id="email"
          label="Email *"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          required
        />
      </div>

      <Input
        id="subject"
        label="Subject"
        type="text"
        value={form.subject}
        onChange={set('subject')}
      />

      <Textarea
        id="message"
        label="Message *"
        rows={6}
        value={form.message}
        onChange={set('message')}
        error={errors.message}
        placeholder="Tell me about your project or question…"
        required
      />

      {globalError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</p>
      )}

      <Button type="submit" loading={loading} className="self-start">
        Send message
      </Button>
    </form>
  )
}
