'use client'
import { useState, useEffect } from 'react'
import PostCard from '@/components/PostCard'
import AdCard from '@/components/AdCard'
import LoadingCard from '@/components/LoadingCard'
import Navigation from '@/components/Navigation'
import { getPostedIds, getReactedIds, getCommentedIds } from '@/lib/activity'
import { getPostsByIds, getActiveAds } from '@/lib/appwrite'
import type { Post, Ad } from '@/lib/types'
import { Bell } from 'lucide-react'

const USE_MOCK = !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const AD_INTERVAL = 3

const TABS = [
  { value: 'posted',    label: 'My Posts',  emoji: '📝' },
  { value: 'reacted',   label: 'Reacted',   emoji: '🔥' },
  { value: 'commented', label: 'Commented', emoji: '💬' },
] as const

type TabValue = typeof TABS[number]['value']

function EmptyTab({ tab }: { tab: TabValue }) {
  const config: Record<TabValue, { emoji: string; msg: string; cta: string }> = {
    posted:    { emoji: '📝', msg: "You haven't posted anything yet",    cta: 'Drop your first spill' },
    reacted:   { emoji: '🔥', msg: "You haven't reacted to any posts",  cta: 'Go react to something' },
    commented: { emoji: '💬', msg: "You haven't commented on anything", cta: 'Join the conversation'  },
  }
  const { emoji, msg, cta } = config[tab]
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-3">{emoji}</div>
      <p className="text-white/50 font-semibold">{msg}</p>
      <a href="/feed" className="mt-5 text-gossi-red text-sm font-bold">{cta} →</a>
    </div>
  )
}

export default function ActivityPage() {
  const [tab,            setTab]            = useState<TabValue>('posted')
  const [postedPosts,    setPostedPosts]    = useState<Post[]>([])
  const [reactedPosts,   setReactedPosts]   = useState<Post[]>([])
  const [commentedPosts, setCommentedPosts] = useState<Post[]>([])
  const [ads,            setAds]            = useState<Ad[]>([])
  const [loading,        setLoading]        = useState(true)

  // ID lists (for counts + existence check)
  const [postedIds,    setPostedIds]    = useState<string[]>([])
  const [reactedIds,   setReactedIds]   = useState<string[]>([])
  const [commentedIds, setCommentedIds] = useState<string[]>([])

  useEffect(() => {
    const pIds = getPostedIds()
    const rIds = getReactedIds()
    const cIds = getCommentedIds()
    setPostedIds(pIds)
    setReactedIds(rIds)
    setCommentedIds(cIds)

    const allIds = [...new Set([...pIds, ...rIds, ...cIds])]

    if (USE_MOCK || allIds.length === 0) {
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const [allPosts, adsData] = await Promise.all([
          getPostsByIds(allIds),
          getActiveAds(),
        ])

        const postMap = new Map(allPosts.map(p => [p.$id, p]))

        setPostedPosts(pIds.map(id => postMap.get(id)).filter(Boolean) as Post[])
        setReactedPosts(rIds.map(id => postMap.get(id)).filter(Boolean) as Post[])
        setCommentedPosts(cIds.map(id => postMap.get(id)).filter(Boolean) as Post[])
        setAds(adsData)
      } catch (err) {
        console.error('Activity load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const currentPosts: Post[] =
    tab === 'posted'    ? postedPosts    :
    tab === 'reacted'   ? reactedPosts   :
    commentedPosts

  // Interleave ads every AD_INTERVAL posts
  const feedItems: Array<{ type: 'post' | 'ad'; data: Post | Ad; key: string }> = []
  currentPosts.forEach((post, i) => {
    feedItems.push({ type: 'post', data: post, key: post.$id })
    if ((i + 1) % AD_INTERVAL === 0 && ads.length > 0) {
      const ad = ads[Math.floor(i / AD_INTERVAL) % ads.length]
      feedItems.push({ type: 'ad', data: ad, key: `ad-${i}` })
    }
  })

  const handleUpdate = (updated: Post) => {
    const patch = (prev: Post[]) => prev.map(p => p.$id === updated.$id ? updated : p)
    setPostedPosts(patch)
    setReactedPosts(patch)
    setCommentedPosts(patch)
  }

  const totalActivity = postedIds.length + reactedIds.length + commentedIds.length

  const tabCount = (t: TabValue) =>
    t === 'posted' ? postedIds.length : t === 'reacted' ? reactedIds.length : commentedIds.length

  return (
    <div className="min-h-screen bg-[#080808] pb-28">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-xl mx-auto px-4 pt-3 pb-1 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gossi-purple" />
          <span className="text-[22px] font-black text-white tracking-tight">Activity</span>
        </div>
        <p className="max-w-xl mx-auto px-4 pb-2 text-[10px] text-white/25 font-medium tracking-wide">
          🫥 tracked on this device only · nothing is linked to you
        </p>

        {/* Tab chips */}
        <div className="max-w-xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map(t => {
            const count = tabCount(t.value)
            const active = tab === t.value
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${active ? 'bg-white text-black' : 'bg-white/8 text-white/60 border border-white/10'}`}
              >
                {t.emoji} {t.label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    ${active ? 'bg-black/15 text-black' : 'bg-white/10 text-white/50'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-4 pt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <LoadingCard key={i} />)}
          </div>

        ) : totalActivity === 0 ? (
          /* No activity at all */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">👻</div>
            <p className="text-white/60 font-bold text-lg">Nothing here yet</p>
            <p className="text-white/30 text-sm mt-1 max-w-xs">
              React to posts, drop a comment, or post your own spill — it'll show up here
            </p>
            <a href="/feed" className="mt-6 btn-gossi px-5 py-2.5 text-sm font-bold inline-block">
              Go cause chaos →
            </a>
          </div>

        ) : currentPosts.length === 0 ? (
          <EmptyTab tab={tab} />

        ) : (
          <div className="space-y-4">
            {feedItems.map((item, idx) =>
              item.type === 'ad' ? (
                <AdCard key={item.key} ad={item.data as Ad} />
              ) : (
                <PostCard
                  key={item.key}
                  post={item.data as Post}
                  index={idx}
                  campus={(item.data as Post).campus}
                  onUpdate={handleUpdate}
                  onDelete={() => {}}
                />
              )
            )}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
