import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const projects = await prisma.project.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { sortOrder: 'asc' },
  })

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${appUrl}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${appUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...projectEntries,
  ]
}
