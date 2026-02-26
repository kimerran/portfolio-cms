import type { Metadata } from 'next'
import { Github, Linkedin, Mail } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { CalendlyWidget } from '@/components/CalendlyWidget'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch to discuss your project or book a meeting.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? ''
  const email = process.env.NEXT_PUBLIC_EMAIL ?? ''
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? ''
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? ''

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-brand">Get in touch</h1>
      <p className="mb-12 text-lg leading-relaxed text-slate-600">
        Have a project in mind or want to chat? I&apos;d love to hear from you.
      </p>

      <div className="grid gap-16 lg:grid-cols-2">
        {/* Contact form */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-brand">Send a message</h2>
          <ContactForm />
        </section>

        {/* Booking + social */}
        <section className="flex flex-col gap-10">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-brand">Book a meeting</h2>
            <p className="mb-6 text-slate-600">Prefer to talk? Schedule time directly below.</p>
            <CalendlyWidget url={calendlyUrl} />
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-brand">Connect</h2>
            <div className="flex flex-col gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-3 text-slate-600 hover:text-brand-accent transition-colors"
                >
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  {email}
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-slate-600 hover:text-brand-accent transition-colors"
                >
                  <Github className="h-5 w-5 flex-shrink-0" />
                  GitHub
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-slate-600 hover:text-brand-accent transition-colors"
                >
                  <Linkedin className="h-5 w-5 flex-shrink-0" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
