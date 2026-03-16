import { MetadataRoute } from 'next'

// Always use production URL — never localhost
const APP_URL = 'https://gossi.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     ['/feed', '/trending', '/activity'],
        disallow:  ['/admin'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
