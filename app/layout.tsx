import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'GOSSI 🔥 — Campus Tea, Anonymous',
  description: 'Drop anonymous gossip, confessions and advice for your campus. No account needed.',
  keywords:    ['gossip', 'anonymous', 'campus', 'university', 'confession', 'ANU', 'Kenya'],
  openGraph: {
    title:       'GOSSI 🔥',
    description: 'Your campus. Unfiltered.',
    type:        'website',
  },
  icons: { icon: '/favicon.ico' },
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
      <body className="bg-[#080808] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
