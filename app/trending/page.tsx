'use client'
import { useState, useEffect, useCallback } from 'react'
import PostCard from '@/components/PostCard'
import LoadingCard from '@/components/LoadingCard'
import Navigation from '@/components/Navigation'
import { detectCampus, getCampusInfo } from '@/lib/campus'
import { getTrendingPosts } from '@/lib/appwrite'
import { MOCK_POSTS } from '@/lib/mockData'
import type { Post, Campus } from '@/lib/types'
import { Flame, Trophy, TrendingUp } from 'lucide-react'
import { calculateScore } from '@/lib/appwrite'

const USE_MOCK = !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

const TIME_TABS = [
  { label: '🔥 Right Now', value: 'now' },
  { label: '📅 Today',     value: 'today' },
  { label: '🏆 All Time',  value: 'alltime' },
]

function getScoreColor(score: number): string {
  if (score >= 500) return '#FF2D55'
  if (score >= 200) return '#FF9F0A'
  return '#BF5AF2'
}

function ScoreMeter({ score }: { score: number }) {
  const max   = 1500
  const pct   = Math.min((score / max) * 100, 100)
  const color = getScoreColor(score)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {score.toLocaleString()}
      </span>
    </div>
  )
}

export default function TrendingPage() {
  const [posts,   setPosts]   = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [campus,  setCampus]  = useState<Campus>('anu')
  const [tab,     setTab]     = useState('now')

  const campusInfo = getCampusInfo(campus)

  const load = useCallback(async (c: Campus) => {
    setLoading(true)
    try {
      const raw = USE_MOCK
        ? MOCK_POSTS.filter(p => p.campus === c)
        : await getTrendingPosts(c, 30)

      // Sort by score descending
      const sorted = [...raw].sort((a, b) => b.score - a.score)
      setPosts(sorted)
    } catch {
      const fallback = MOCK_POSTS.filter(p => p.campus === c)
      setPosts([...fallback].sort((a, b) => b.score - a.score))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const c = detectCampus()
    setCampus(c)
    load(c)
  }, [load])

  const rankEmoji = (i: number) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  return (
    <div className="min-h-screen bg-[#080808] pb-28">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-gossi-orange" />
            <span className="text-lg font-black text-white">Trending Tea</span>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold border"
            style={{ color: campusInfo.color, borderColor: `${campusInfo.color}44`, background: `${campusInfo.color}18` }}
          >
            {campusInfo.emoji} {campusInfo.short}
          </span>
        </div>

        {/* Time tabs */}
        <div className="max-w-xl mx-auto px-4 pb-3 flex gap-2">
          {TIME_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all
                ${tab === t.value ? 'bg-white text-black' : 'bg-white/8 text-white/50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Score legend ─────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-4 pt-3 pb-1">
        <p className="text-white/30 text-xs">
          Score = (reactions × 2) + comments + shares
        </p>
      </div>

      {/* ── Feed ─────────────────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-4 pt-2 space-y-4">
        {loading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-white/40">Nothing trending yet. Post something spicy! 🌶️</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <div key={post.$id} className="relative">
              {/* Rank badge */}
              <div
                className="absolute -top-3 -left-1 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg"
                style={{
                  background: idx < 3 ? 'linear-gradient(135deg,#FF2D55,#BF5AF2)' : '#1a1a1a',
                  color: '#fff',
                  border: '2px solid #080808',
                }}
              >
                {rankEmoji(idx)}
              </div>

              {/* Score bar above card */}
              <div className="mb-2 px-1 pt-3">
                <ScoreMeter score={post.score} />
              </div>

              <PostCard
                post={post}
                index={idx}
                campus={campus}
                onUpdate={(u) => setPosts(prev => prev.map(p => p.$id === u.$id ? u : p))}
                onDelete={(id) => setPosts(prev => prev.filter(p => p.$id !== id))}
              />
            </div>
          ))
        )}
      </main>

      <Navigation />
    </div>
  )
}
