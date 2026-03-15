'use client'
import { useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Share2, Flag, MoreHorizontal } from 'lucide-react'
import CommentModal from './CommentModal'
import type { Post, Campus, Reactions } from '@/lib/types'
import { addReaction, incrementShare, reportPost, softDeletePost } from '@/lib/appwrite'
import { MOCK_COMMENTS } from '@/lib/mockData'
import clsx from 'clsx'

// ── Card color palette (cycles by index) ─────────────────────────────────────
const CARD_THEMES = [
  { bg: '#FFE5ED', text: '#2a0a14', tagBg: 'rgba(255,45,85,0.15)',    tagText: '#c01038' },
  { bg: '#EDE5FF', text: '#1a0a2a', tagBg: 'rgba(191,90,242,0.15)',   tagText: '#8b3db8' },
  { bg: '#E5EEFF', text: '#0a0a2a', tagBg: 'rgba(10,132,255,0.15)',   tagText: '#0055cc' },
  { bg: '#E5FFF1', text: '#0a1a12', tagBg: 'rgba(48,209,88,0.15)',    tagText: '#1a8040' },
  { bg: '#FFF9E5', text: '#1a1a0a', tagBg: 'rgba(255,159,10,0.15)',   tagText: '#a06500' },
]

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  tea:        { emoji: '☕', label: 'tea' },
  confession: { emoji: '🤫', label: 'confession' },
  advice:     { emoji: '💡', label: 'advice' },
  drama:      { emoji: '🎭', label: 'drama' },
  random:     { emoji: '🎲', label: 'random' },
}

const ANON_NAMES = [
  'sleepy_ghost', 'bold_shadow', 'quiet_echo',  'wild_mist',
  'cool_specter', 'spicy_vibes', 'sneaky_spark', 'extra_soul',
  'calm_tide',    'loud_echo',   'sly_fox',      'mad_wave',
  'shy_star',     'raw_voice',   'dark_comet',   'soft_storm',
]

function getAnonName(id: string): string {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return ANON_NAMES[hash % ANON_NAMES.length]
}

const USE_MOCK = !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

interface Props {
  post:     Post
  index:    number
  campus:   Campus
  onUpdate: (post: Post) => void
  onDelete: (id: string)  => void
}

export default function PostCard({ post, index, campus, onUpdate, onDelete }: Props) {
  const theme     = CARD_THEMES[index % CARD_THEMES.length]
  const catMeta   = CATEGORY_META[post.category] ?? { emoji: '💬', label: post.category }
  const anonName  = getAnonName(post.$id)
  const timeAgo   = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

  const [reactions, setReactions] = useState<Reactions>(post.reactions)
  const [showComments, setShowComments] = useState(false)
  const [showShare,    setShowShare]    = useState(false)
  const [showMenu,     setShowMenu]     = useState(false)
  const [reacting,     setReacting]     = useState(false)
  const [reported,     setReported]     = useState(false)

  // Persist which reactions user has done
  const REACTED_KEY = `gossi_r_${post.$id}`
  const getUserReacted = (): keyof Reactions | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REACTED_KEY) as keyof Reactions | null
  }
  const [userReacted, setUserReacted] = useState<keyof Reactions | null>(getUserReacted)

  const handleReact = useCallback(async (type: keyof Reactions) => {
    if (userReacted || reacting) return
    setReacting(true)
    const optimistic = { ...reactions, [type]: reactions[type] + 1 }
    setReactions(optimistic)
    setUserReacted(type)
    localStorage.setItem(REACTED_KEY, type)

    if (!USE_MOCK) {
      const updated = await addReaction(post.$id, reactions, type)
      if (updated) {
        setReactions(updated)
        onUpdate({ ...post, reactions: updated })
      }
    }
    setReacting(false)
  }, [userReacted, reacting, reactions, post, onUpdate, REACTED_KEY])

  const handleShare = async (channel: 'whatsapp' | 'copy' | 'native') => {
    const url  = `${window.location.origin}/feed`
    const text = `${post.text}\n\n👀 via GOSSI — ${url}`

    if (channel === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    } else if (channel === 'copy') {
      await navigator.clipboard.writeText(url)
      alert('Link copied!')
    } else if (channel === 'native' && navigator.share) {
      try { await navigator.share({ title: 'GOSSI 🔥', text: post.text, url }) } catch {}
    }

    setShowShare(false)
    if (!USE_MOCK) await incrementShare(post.$id, post.shareCount)
    onUpdate({ ...post, shareCount: post.shareCount + 1 })
  }

  const handleReport = async () => {
    setShowMenu(false)
    if (reported) return alert('Already reported.')
    if (!confirm('Report this post?')) return
    if (!USE_MOCK) await reportPost(post.$id, 'User report', campus)
    setReported(true)
    alert('Reported. Thanks for keeping GOSSI safe 🙏')
  }

  const REACTIONS: Array<{ type: keyof Reactions; emoji: string }> = [
    { type: 'fire',  emoji: '🔥' },
    { type: 'heart', emoji: '❤️' },
    { type: 'laugh', emoji: '😂' },
    { type: 'sad',   emoji: '😢' },
  ]

  const totalReactions = reactions.fire + reactions.heart + reactions.laugh + reactions.sad

  return (
    <>
      <article
        className="post-card animate-fade-up"
        style={{ background: theme.bg, animationDelay: `${(index % 5) * 60}ms`, animationFillMode: 'both' }}
      >
        {/* ── Top row ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: `${theme.tagBg}`, color: theme.tagText }}
            >
              👻
            </div>
            <span className="text-xs font-semibold" style={{ color: theme.text, opacity: 0.6 }}>
              @{anonName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: theme.tagBg, color: theme.tagText }}
            >
              {catMeta.emoji} #{catMeta.label}
            </span>
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-1 rounded-full opacity-40"
              style={{ color: theme.text }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Menu dropdown ────────────────────────────────────────── */}
        {showMenu && (
          <div className="absolute right-4 top-12 z-20 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <button
              onClick={handleReport}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
            >
              <Flag className="w-4 h-4" /> Report Post
            </button>
          </div>
        )}

        {/* ── Post text ────────────────────────────────────────────── */}
        <p
          className="text-[16px] font-medium leading-relaxed mb-4"
          style={{ color: theme.text }}
        >
          {post.text}
        </p>

        {/* ── Reactions ────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {REACTIONS.map(({ type, emoji }) => (
            <button
              key={type}
              onClick={() => handleReact(type)}
              className={clsx(
                'reaction-btn',
                userReacted === type && 'active',
                userReacted && userReacted !== type && 'opacity-50',
              )}
              style={{ color: theme.text, background: `${theme.tagBg}` }}
            >
              <span className={clsx(userReacted === type && 'animate-bounce-pop')}>{emoji}</span>
              <span>{reactions[type] > 0 ? reactions[type] : ''}</span>
            </button>
          ))}
        </div>

        {/* ── Bottom row ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-1.5 text-xs font-semibold opacity-60"
              style={{ color: theme.text }}
            >
              <MessageCircle className="w-4 h-4" />
              {post.commentCount > 0 ? post.commentCount : 'Reply'}
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: theme.tagBg, color: theme.tagText }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
          <span className="text-xs opacity-40" style={{ color: theme.text }}>{timeAgo}</span>
        </div>
      </article>

      {/* ── Comment modal ────────────────────────────────────────────── */}
      {showComments && (
        <CommentModal
          post={post}
          campus={campus}
          onClose={() => setShowComments(false)}
          onCommented={() => onUpdate({ ...post, commentCount: post.commentCount + 1 })}
        />
      )}

      {/* ── Share sheet ──────────────────────────────────────────────── */}
      {showShare && (
        <div className="modal-backdrop" onClick={() => setShowShare(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-[#111] rounded-t-3xl p-6 animate-slide-up border-t border-white/10 max-w-xl mx-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <p className="text-white font-bold text-base mb-4 text-center">Share this spill 👀</p>

            <div className="space-y-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-3 bg-[#25D366]/15 border border-[#25D366]/25 rounded-2xl px-4 py-4 text-[#25D366] font-bold"
              >
                <span className="text-2xl">📱</span>
                <span>Share to WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('native')}
                className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold"
              >
                <span className="text-2xl">📸</span>
                <span>Share to Instagram Story</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white/70 font-semibold"
              >
                <span className="text-2xl">🔗</span>
                <span>Copy Link</span>
              </button>
            </div>

            <button onClick={() => setShowShare(false)} className="w-full mt-3 py-3 text-white/40 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
