import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE ?? 'Portfolio'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: 'Software engineering portfolio showcasing projects and work.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: siteTitle,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-brand-bg font-sans text-brand antialiased">{children}</body>
    </html>
  )
}
