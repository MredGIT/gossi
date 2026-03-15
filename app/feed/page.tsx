'use client'
import { useState, useEffect, useCallback } from 'react'
import PostCard from '@/components/PostCard'
import CreatePostModal from '@/components/CreatePostModal'
import AdCard from '@/components/AdCard'
import LoadingCard from '@/components/LoadingCard'
import Navigation from '@/components/Navigation'
import { detectCampus, getCampusInfo, ALL_CAMPUSES, setCampusLocally } from '@/lib/campus'
import { getPosts, getActiveAds } from '@/lib/appwrite'
import { MOCK_POSTS } from '@/lib/mockData'
import type { Post, Ad, Campus } from '@/lib/types'
import { RefreshCw, Flame, ChevronDown, X } from 'lucide-react'

const USE_MOCK = !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const AD_INTERVAL = 3

const CATEGORY_OPTIONS = [
  { value: 'all',        label: 'All',        emoji: '✨' },
  { value: 'tea',        label: 'Tea',        emoji: '☕' },
  { value: 'confession', label: 'Confession', emoji: '🤫' },
]

export default function FeedPage() {
  const [posts,          setPosts]          = useState<Post[]>([])
  const [ads,            setAds]            = useState<Ad[]>([])
  const [loading,        setLoading]        = useState(true)
  const [loadingMore,    setLoadingMore]    = useState(false)
  const [hasMore,        setHasMore]        = useState(true)
  const [campus,         setCampus]         = useState<Campus>('anu')
  const [showCampusPicker, setShowCampusPicker] = useState(false)
  const [showCreate,     setShowCreate]     = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [refreshKey,     setRefreshKey]     = useState(0)

  const campusInfo = getCampusInfo(campus)

  const loadFeed = useCallback(async (c: Campus, offset = 0) => {
    if (offset === 0) setLoading(true)
    else             setLoadingMore(true)

    try {
      if (USE_MOCK) {
        setPosts(MOCK_POSTS.filter(p => p.campus === c))
        setHasMore(false)
      } else {
        const [newPosts, newAds] = await Promise.all([
          getPosts(c, 20, offset),
          offset === 0 ? getActiveAds() : Promise.resolve([] as Ad[]),
        ])
        if (offset === 0) {
          setPosts(newPosts)
          setAds(newAds)
        } else {
          setPosts(prev => [...prev, ...newPosts])
        }
        setHasMore(newPosts.length === 20)
      }
    } catch {
      setPosts(MOCK_POSTS.filter(p => p.campus === c))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    const c = detectCampus()
    setCampus(c)
    loadFeed(c)
  }, [loadFeed, refreshKey])

  const filteredPosts = filterCategory === 'all'
    ? posts
    : posts.filter(p => p.category === filterCategory)

  // Interleave ads every 3 posts
  const feedItems: Array<{ type: 'post' | 'ad'; data: Post | Ad; key: string }> = []
  filteredPosts.forEach((post, i) => {
    feedItems.push({ type: 'post', data: post, key: post.$id })
    if ((i + 1) % AD_INTERVAL === 0 && ads.length > 0) {
      const ad = ads[Math.floor(i / AD_INTERVAL) % ads.length]
      feedItems.push({ type: 'ad', data: ad, key: `ad-${i}` })
    }
  })

  const switchCampus = (c: Campus) => {
    setCampusLocally(c)
    setCampus(c)
    setShowCampusPicker(false)
    loadFeed(c)
  }

  const handleNewPost = (post: Post) => {
    setPosts(prev => [post, ...prev])
    setShowCreate(false)
  }

  const handleUpdate = (updated: Post) =>
    setPosts(prev => prev.map(p => p.$id === updated.$id ? updated : p))

  const handleDelete = (id: string) =>
    setPosts(prev => prev.filter(p => p.$id !== id))

  return (
    <div className="min-h-screen bg-[#080808] pb-28">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[26px] font-black gossi-text tracking-tight">GOSSI</span>
            <Flame className="w-5 h-5 text-gossi-orange" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 rounded-full text-white/40 hover:text-white/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCampusPicker(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95"
              style={{ color: campusInfo.color, borderColor: `${campusInfo.color}44`, background: `${campusInfo.color}18` }}
            >
              {campusInfo.emoji} {campusInfo.short}
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
            </button>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="max-w-xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORY_OPTIONS.map(c => (
            <button
              key={c.value}
              onClick={() => setFilterCategory(c.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filterCategory === c.value
                  ? 'bg-white text-black'
                  : 'bg-white/8 text-white/60 border border-white/10'}`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Feed ─────────────────────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {loading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : feedItems.length > 0 ? (
          feedItems.map((item, idx) =>
            item.type === 'post' ? (
              <PostCard
                key={item.key}
                post={item.data as Post}
                index={idx}
                campus={campus}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ) : (
              <AdCard key={item.key} ad={item.data as Ad} />
            )
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl mb-4">🌑</p>
            <p className="text-white/50 font-medium">No spills yet for {filterCategory === 'all' ? 'this campus' : `#${filterCategory}`}</p>
            <button onClick={() => setShowCreate(true)} className="mt-5 btn-gossi px-6 py-3 text-sm font-bold">
              Drop the first spill ☕
            </button>
          </div>
        )}

        {loadingMore && <LoadingCard />}

        {!loading && hasMore && filteredPosts.length > 0 && (
          <button
            onClick={() => loadFeed(campus, posts.length)}
            className="w-full py-4 text-white/40 text-sm font-medium border border-white/8 rounded-2xl"
          >
            Load more spills ↓
          </button>
        )}

        {!loading && !hasMore && filteredPosts.length > 4 && (
          <p className="text-center py-8 text-white/25 text-sm">You've seen it all 👀</p>
        )}
      </main>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full btn-gossi shadow-gossi-red flex items-center justify-center z-30 text-2xl"
        aria-label="Create post"
      >
        ✏️
      </button>

      {showCreate && (
        <CreatePostModal campus={campus} onClose={() => setShowCreate(false)} onPost={handleNewPost} />
      )}

      {showCampusPicker && (
        <div className="modal-backdrop" onClick={() => setShowCampusPicker(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#0f0f0f] rounded-t-3xl border-t border-white/8 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="pt-4 px-5 pb-6">
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black text-lg">Switch Campus</h2>
                <button onClick={() => setShowCampusPicker(false)} className="p-1.5 text-white/30 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {ALL_CAMPUSES.filter(c => c.id !== 'other').map(c => (
                  <button
                    key={c.id}
                    onClick={() => switchCampus(c.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]"
                    style={campus === c.id
                      ? { borderColor: c.color, background: `${c.color}15` }
                      : { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }
                    }
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${c.color}22` }}>
                      {c.emoji}
                    </span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <p className="text-white/40 text-xs">{c.short}</p>
                    </div>
                    {campus === c.id && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${c.color}25`, color: c.color }}>Active ✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  )
}
