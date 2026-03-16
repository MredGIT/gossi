import { MetadataRoute } from 'next'

// Always use production URL for sitemap — never localhost
const APP_URL = 'https://gossi.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:              `${APP_URL}/feed`,
      lastModified:     new Date(),
      changeFrequency:  'always',
      priority:         1.0,
    },
    {
      url:              `${APP_URL}/trending`,
      lastModified:     new Date(),
      changeFrequency:  'hourly',
      priority:         0.9,
    },
    {
      url:              `${APP_URL}/activity`,
      lastModified:     new Date(),
      changeFrequency:  'always',
      priority:         0.8,
    },
  ]
}
