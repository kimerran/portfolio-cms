import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactSubmissionData {
  name: string
  email: string
  subject?: string | null
  message: string
  createdAt: Date
}

export async function sendContactNotification(submission: ContactSubmissionData): Promise<void> {
  const { name, email, subject, message, createdAt } = submission

  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: process.env.CONTACT_EMAIL_TO!,
    subject: `New contact: ${subject ?? '(no subject)'}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Subject:</strong> ${subject ?? '(no subject)'}</p>
      <p><strong>Received:</strong> ${createdAt.toLocaleString()}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br />')}</p>
    `,
  })
}
