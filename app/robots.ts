import { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gossi.vercel.app'

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
