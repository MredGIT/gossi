'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_CAMPUSES, setCampusLocally } from '@/lib/campus'
import type { Campus } from '@/lib/types'

export default function CampusSelectorPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Campus | null>(null)

  // If campus already stored → go straight to feed
  useEffect(() => {
    const stored = localStorage.getItem('gossi_campus') as Campus
    if (stored) router.replace('/feed')
  }, [router])

  const choose = (campus: Campus) => {
    setSelected(campus)
    setCampusLocally(campus)
    router.push('/feed')
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="text-6xl font-black gossi-text tracking-tight leading-none">GOSSI</h1>
        <p className="mt-2 text-white/50 text-sm">🔥 Campus tea. Anonymous. Unfiltered.</p>
      </div>

      <h2 className="text-white text-xl font-bold mb-6 text-center">Select Your Campus</h2>

      <div className="w-full max-w-sm space-y-3">
        {ALL_CAMPUSES.map((c) => (
          <button
            key={c.id}
            onClick={() => choose(c.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
              ${selected === c.id
                ? 'border-white/30 bg-white/10 scale-[0.98]'
                : 'border-white/6 bg-white/4 hover:bg-white/8 active:scale-[0.97]'
              }`}
            style={{ borderColor: selected === c.id ? c.color : undefined }}
          >
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${c.color}22` }}
            >
              {c.emoji}
            </span>
            <div className="text-left">
              <p className="font-bold text-white text-sm leading-tight">{c.name}</p>
              <p className="text-white/40 text-xs mt-0.5">{c.short}</p>
            </div>
            {c.id === 'anu' && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${c.color}30`, color: c.color }}>
                Live 🔥
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-10 text-white/25 text-xs text-center max-w-xs">
        No account needed. All posts are 100% anonymous.
        By using GOSSI you agree to keep it real and keep it respectful.
      </p>
    </div>
  )
}
