'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Flame, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/feed',     icon: Home,     label: 'Feed'     },
  { href: '/trending', icon: Flame,    label: 'Trending' },
  { href: '/admin',    icon: Settings, label: 'Admin'    },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="max-w-xl mx-auto flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className="flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={active ? { background: 'linear-gradient(135deg,#FF2D55,#BF5AF2)' } : {}}
              >
                <Icon
                  className="w-5 h-5 transition-colors duration-200"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.35)' }}
                />
              </div>
              <span
                className="text-[10px] font-semibold transition-colors duration-200"
                style={{ color: active ? '#fff' : 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
