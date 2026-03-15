'use client'
import { useState, useEffect } from 'react'
import {
  adminGetPosts, getAllReports, getAllAds,
  softDeletePost, createAd, toggleAd, deleteAd,
  getBannedWords, addBannedWord, removeBannedWord,
  getAdminStats,
} from '@/lib/appwrite'
import { MOCK_POSTS } from '@/lib/mockData'
import type { Post, Report, Ad, BannedWord } from '@/lib/types'
import {
  ShieldCheck, Trash2, Eye, EyeOff, Plus, X,
  BarChart2, AlertTriangle, Megaphone, Ban,
  LogOut, ExternalLink, RefreshCw,
} from 'lucide-react'

const USE_MOCK       = !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'gossi2026'

// ── Tiny stat card ────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, color,
}: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-[#111] rounded-2xl p-4 flex items-center gap-3 border border-white/5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-white/40 text-xs">{label}</p>
        <p className="text-white font-bold text-xl leading-tight">{value}</p>
      </div>
    </div>
  )
}

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'posts',    label: '📝 Posts' },
  { id: 'reports',  label: '🚨 Reports' },
  { id: 'banned',   label: '🚫 Banned' },
  { id: 'ads',      label: '📣 Ads' },
]

export default function AdminPage() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [authed,    setAuthed]    = useState(false)
  const [pwInput,   setPwInput]   = useState('')
  const [pwError,   setPwError]   = useState(false)

  // ── Tab / state ───────────────────────────────────────────────────────────
  const [tab,       setTab]       = useState('overview')
  const [posts,     setPosts]     = useState<Post[]>([])
  const [reports,   setReports]   = useState<Report[]>([])
  const [ads,       setAds]       = useState<Ad[]>([])
  const [banned,    setBanned]    = useState<BannedWord[]>([])
  const [stats,     setStats]     = useState({ totalPosts: 0, totalReports: 0, activeAds: 0 })
  const [loading,   setLoading]   = useState(false)

  // ── New Ad form ───────────────────────────────────────────────────────────
  const [adTitle,   setAdTitle]   = useState('')
  const [adImg,     setAdImg]     = useState('')
  const [adLink,    setAdLink]    = useState('')
  const [adType,    setAdType]    = useState<'image' | 'video'>('image')
  const [adSaving,  setAdSaving]  = useState(false)

  // ── Banned word form ──────────────────────────────────────────────────────
  const [newWord,   setNewWord]   = useState('')

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true)
    try {
      if (USE_MOCK) {
        setPosts(MOCK_POSTS)
        setStats({ totalPosts: MOCK_POSTS.length, totalReports: 2, activeAds: 1 })
      } else {
        const [p, r, a, bw, s] = await Promise.all([
          adminGetPosts(), getAllReports(), getAllAds(), getBannedWords(), getAdminStats(),
        ])
        setPosts(p)
        setReports(r)
        setAds(a)
        setBanned(bw)
        setStats(s)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const login = () => {
    if (pwInput === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    if (!USE_MOCK) await softDeletePost(id)
    setPosts(prev => prev.filter(p => p.$id !== id))
  }

  const handleToggleAd = async (id: string, cur: boolean) => {
    if (!USE_MOCK) await toggleAd(id, !cur)
    setAds(prev => prev.map(a => a.$id === id ? { ...a, isActive: !cur } : a))
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Remove this ad?')) return
    if (!USE_MOCK) await deleteAd(id)
    setAds(prev => prev.filter(a => a.$id !== id))
  }

  const handleAddAd = async () => {
    if (!adTitle || !adImg || !adLink) return
    setAdSaving(true)
    try {
      if (USE_MOCK) {
        const mock: Ad = { $id: `ad-${Date.now()}`, title: adTitle, imageUrl: adImg, linkUrl: adLink, mediaType: adType, isActive: true, createdAt: new Date().toISOString() }
        setAds(prev => [mock, ...prev])
      } else {
        const ad = await createAd(adTitle, adImg, adLink, adType)
        setAds(prev => [ad, ...prev])
      }
      setAdTitle(''); setAdImg(''); setAdLink('')
    } finally {
      setAdSaving(false)
    }
  }

  const handleAddBanned = async () => {
    if (!newWord.trim()) return
    if (!USE_MOCK) await addBannedWord(newWord)
    setBanned(prev => [...prev, { $id: `bw-${Date.now()}`, word: newWord.trim().toLowerCase() }])
    setNewWord('')
  }

  const handleRemoveBanned = async (id: string) => {
    if (!USE_MOCK) await removeBannedWord(id)
    setBanned(prev => prev.filter(b => b.$id !== id))
  }

  // ── Login gate ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-[#111] rounded-3xl p-8 border border-white/6 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gossi-red/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-gossi-red" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white text-center mb-1">Admin Access</h1>
          <p className="text-white/40 text-sm text-center mb-7">GOSSI Dashboard</p>

          <input
            type="password"
            value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(false) }}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Enter admin password"
            className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-white placeholder-white/30 outline-none focus:border-gossi-red transition-colors text-sm mb-3 ${pwError ? 'border-red-500' : 'border-white/10'}`}
          />
          {pwError && <p className="text-red-400 text-xs mb-3">❌ Wrong password</p>}
          <button onClick={login} className="w-full btn-gossi py-3.5 text-sm font-bold">
            Enter Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gossi-red" />
            <span className="font-black text-white text-lg">GOSSI Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="p-2 text-white/40 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setAuthed(false)} className="flex items-center gap-1.5 text-white/40 hover:text-red-400 text-xs transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'bg-white text-black' : 'bg-white/8 text-white/50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">

        {/* ── Overview ──────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<BarChart2 className="w-5 h-5" />} label="Total Posts"   value={USE_MOCK ? MOCK_POSTS.length : stats.totalPosts}   color="#FF2D55" />
              <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Reports" value={USE_MOCK ? 2 : stats.totalReports} color="#FF9F0A" />
              <StatCard icon={<Megaphone className="w-5 h-5" />} label="Active Ads"    value={USE_MOCK ? 1 : stats.activeAds}    color="#BF5AF2" />
            </div>

            <div className="bg-[#111] rounded-2xl p-5 border border-white/5">
              <h3 className="text-white font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Posts',    value: USE_MOCK ? MOCK_POSTS.length : stats.totalPosts,   color: '#FF2D55' },
                  { label: 'Open Reports',   value: USE_MOCK ? 2 : stats.totalReports,                color: '#FF9F0A' },
                  { label: 'Active Ads',     value: USE_MOCK ? 1 : stats.activeAds,                   color: '#BF5AF2' },
                  { label: 'Banned Words',   value: banned.length,                                    color: '#30D158' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">{s.label}</span>
                    <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-amber-400 text-sm font-semibold mb-1">⚠️ Mock Mode Active</p>
              <p className="text-amber-400/70 text-xs">Configure <code>.env.local</code> with Appwrite credentials to enable live data.</p>
            </div>
          </>
        )}

        {/* ── Posts ─────────────────────────────────────────────────── */}
        {tab === 'posts' && (
          <div className="space-y-3">
            <p className="text-white/40 text-xs">{posts.length} posts total</p>
            {posts.map(p => (
              <div key={p.$id} className={`bg-[#111] rounded-2xl p-4 border ${p.isDeleted ? 'border-red-500/20 opacity-50' : 'border-white/5'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/50 font-mono">
                        {p.campus.toUpperCase()}
                      </span>
                      <span className="text-xs text-white/30">#{p.category}</span>
                      {p.isReported && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          🚨 Reported
                        </span>
                      )}
                      {p.isDeleted && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-400">
                          Deleted
                        </span>
                      )}
                    </div>
                    <p className="text-white text-sm line-clamp-2">{p.text}</p>
                    <p className="text-white/30 text-xs mt-1.5">
                      Score: {p.score} · 💬 {p.commentCount} · 🔥 {p.reactions.fire + p.reactions.heart + p.reactions.laugh + p.reactions.sad}
                    </p>
                  </div>
                  {!p.isDeleted && (
                    <button
                      onClick={() => handleDeletePost(p.$id)}
                      className="flex-shrink-0 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Reports ───────────────────────────────────────────────── */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {USE_MOCK ? (
              <div className="bg-[#111] rounded-2xl p-5 border border-white/5 text-center">
                <AlertTriangle className="w-8 h-8 text-gossi-orange mx-auto mb-3" />
                <p className="text-white/60 text-sm">Reports will show here once Appwrite is connected.</p>
              </div>
            ) : reports.length === 0 ? (
              <p className="text-white/40 text-center py-10">No reports yet ✅</p>
            ) : (
              reports.map(r => (
                <div key={r.$id} className="bg-[#111] rounded-2xl p-4 border border-amber-500/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-amber-400 text-xs font-bold mb-1">🚨 Report</p>
                      <p className="text-white text-sm">Post ID: <code className="text-white/50">{r.postId}</code></p>
                      <p className="text-white/50 text-xs mt-1">Reason: {r.reason}</p>
                      <p className="text-white/30 text-xs mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(r.postId)}
                      className="text-xs text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10"
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Banned Words ──────────────────────────────────────────── */}
        {tab === 'banned' && (
          <div className="space-y-4">
            <div className="bg-[#111] rounded-2xl p-4 border border-white/5">
              <p className="text-white font-bold text-sm mb-3">Add Banned Phrase</p>
              <div className="flex gap-2">
                <input
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddBanned()}
                  placeholder="Type word or phrase..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-gossi-red"
                />
                <button onClick={handleAddBanned} className="btn-gossi px-4 py-2.5 text-sm">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {banned.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-6">No banned words yet</p>
              ) : (
                banned.map(bw => (
                  <div key={bw.$id} className="bg-[#111] rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-400" />
                      <span className="text-white text-sm font-mono">{bw.word}</span>
                    </div>
                    <button onClick={() => handleRemoveBanned(bw.$id)} className="text-white/30 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Ads ───────────────────────────────────────────────────── */}
        {tab === 'ads' && (
          <div className="space-y-5">
            {/* Create new ad */}
            <div className="bg-[#111] rounded-2xl p-5 border border-white/5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-gossi-purple" />
                Create New Ad
              </h3>
              <div className="space-y-3">
                <input
                  value={adTitle}
                  onChange={e => setAdTitle(e.target.value)}
                  placeholder="Ad Title (e.g. 'Flash Sale at TechHub')"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-gossi-purple"
                />
                <input
                  value={adImg}
                  onChange={e => setAdImg(e.target.value)}
                  placeholder="Image or Video URL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-gossi-purple"
                />
                <input
                  value={adLink}
                  onChange={e => setAdLink(e.target.value)}
                  placeholder="Destination URL (https://...)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-gossi-purple"
                />
                <div className="flex gap-2">
                  {(['image', 'video'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setAdType(type)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${adType === type ? 'bg-gossi-purple/20 border-gossi-purple text-gossi-purple' : 'bg-white/5 border-white/10 text-white/50'}`}
                    >
                      {type === 'image' ? '🖼️ Image' : '🎬 Video'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAddAd}
                  disabled={adSaving || !adTitle || !adImg || !adLink}
                  className="w-full btn-gossi py-3.5 text-sm font-bold disabled:opacity-40"
                >
                  {adSaving ? 'Saving...' : '🚀 Publish Ad'}
                </button>
              </div>
            </div>

            {/* Existing ads */}
            <div className="space-y-3">
              {ads.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-6">No ads yet. Create one above!</p>
              ) : (
                ads.map(ad => (
                  <div key={ad.$id} className={`bg-[#111] rounded-2xl border overflow-hidden ${ad.isActive ? 'border-gossi-purple/30' : 'border-white/5'}`}>
                    {ad.imageUrl && (
                      <div className="h-28 bg-white/5 overflow-hidden">
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-bold text-sm">{ad.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ad.isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                          {ad.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 text-xs flex items-center gap-1 mb-3">
                        <ExternalLink className="w-3 h-3" /> {ad.linkUrl.slice(0, 45)}…
                      </a>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAd(ad.$id, ad.isActive)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-1 justify-center ${ad.isActive ? 'bg-white/8 text-white/50' : 'bg-green-500/20 text-green-400'}`}
                        >
                          {ad.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Pause</> : <><Eye className="w-3.5 h-3.5" /> Activate</>}
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.$id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
