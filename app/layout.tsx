import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gossi.vercel.app'

export const metadata: Metadata = {
  metadataBase:  new URL(APP_URL),
  title: {
    default:  'GOSSI 🔥 — Anonymous Campus Tea & Confessions',
    template: '%s | GOSSI 🔥',
  },
  description: 'The anonymous campus gossip app for Kenyan universities. Drop tea, confessions and drama — no account, no name, no traces. 100% anonymous.',
  keywords:    ['gossip', 'anonymous', 'campus', 'university', 'confession', 'ANU', 'Kenya', 'Nairobi', 'KU', 'Strathmore', 'UoN', 'tea', 'campus drama', 'anonymous confession'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title:       'GOSSI 🔥 — Anonymous Campus Tea & Confessions',
    description: 'Your campus. Unfiltered. 100% anonymous — no account needed.',
    url:         APP_URL,
    siteName:    'GOSSI',
    type:        'website',
    locale:      'en_KE',
    images: [{
      url:    '/og-image.png',
      width:  1200,
      height: 630,
      alt:    'GOSSI — Anonymous Campus Tea',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'GOSSI 🔥 — Anonymous Campus Tea & Confessions',
    description: 'Your campus. Unfiltered. No accounts, no traces.',
    images:      ['/og-image.png'],
  },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  verification: {
    google: 'IRf6hsC0H-khsqcMyb4Te0N8k-UNItv-vVxomDeO0TE',
  },
}

export const viewport: Viewport = {
  width:             'device-width',
  initialScale:      1,
  maximumScale:      1,
  userScalable:      false,
  themeColor:        '#080808',
  viewportFit:       'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#080808] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
