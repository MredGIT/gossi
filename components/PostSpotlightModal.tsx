'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Download, MessageCircle, Send, Share2, X } from 'lucide-react'
import { toPng } from 'html-to-image'
import { createComment, getComments, incrementShare } from '@/lib/appwrite'
import { trackCommented } from '@/lib/activity'
import { MOCK_COMMENTS } from '@/lib/mockData'
import type { Campus, Comment, Post } from '@/lib/types'

const USE_MOCK = !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

interface Theme {
  bg: string
  text: string
  tagBg: string
  tagText: string
}

interface CategoryMeta {
  emoji: string
  label: string
}

interface Props {
  post: Post
  campus: Campus
  theme: Theme
  categoryMeta: CategoryMeta
  anonName: string
  onClose: () => void
  onMetaUpdate: (changes: Partial<Post>) => void
}

export default function PostSpotlightModal({
  post,
  campus,
  theme,
  categoryMeta,
  anonName,
  onClose,
  onMetaUpdate,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const shareUrl = useMemo(
    () => `${(process.env.NEXT_PUBLIC_APP_URL ?? 'https://gossi.vercel.app').replace(/\/$/, '')}/feed`,
    [],
  )

  useEffect(() => {
    const loadComments = async () => {
      setLoadingComments(true)
      try {
        if (USE_MOCK) {
          setComments(MOCK_COMMENTS[post.$id] ?? [])
        } else {
          setComments(await getComments(post.$id))
        }
      } finally {
        setLoadingComments(false)
      }
    }

    loadComments()
  }, [post.$id])

  const handleSendComment = async () => {
    const trimmed = commentText.trim()
    if (!trimmed || sendingComment) return

    setSendingComment(true)
    try {
      if (USE_MOCK) {
        const mockComment: Comment = {
          $id: `cm-${Date.now()}`,
          postId: post.$id,
          text: trimmed,
          createdAt: new Date().toISOString(),
        }
        setComments(prev => [...prev, mockComment])
      } else {
        const comment = await createComment(post.$id, trimmed)
        setComments(prev => [...prev, comment])
        trackCommented(post.$id)
      }

      setCommentText('')
      onMetaUpdate({ commentCount: post.commentCount + 1 })
    } finally {
      setSendingComment(false)
    }
  }

  const handleShare = async (channel: 'whatsapp' | 'copy' | 'native') => {
    const runtimeUrl = typeof window !== 'undefined' ? `${window.location.origin}/feed` : shareUrl
    const text = `${post.text}\n\n👀 via GOSSI — ${runtimeUrl}`

    if (channel === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    } else if (channel === 'copy') {
      await navigator.clipboard.writeText(runtimeUrl)
      alert('Link copied!')
    } else if (channel === 'native' && navigator.share) {
      try {
        await navigator.share({ title: 'GOSSI 🔥', text: post.text, url: runtimeUrl })
      } catch {}
    }

    if (!USE_MOCK) {
      await incrementShare(post.$id, post.shareCount)
    }
    onMetaUpdate({ shareCount: post.shareCount + 1 })
  }

  const handleDownloadImage = async () => {
    if (!shareCardRef.current || downloading) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: theme.bg,
      })

      const link = document.createElement('a')
      link.download = `gossi-${post.$id}.png`
      link.href = dataUrl
      link.click()
    } catch {
      alert('Could not download image. Please screenshot for now.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-6" onClick={e => e.stopPropagation()}>
        <div className="w-full max-w-lg py-2">
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/30 text-white/70 hover:text-white flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={shareCardRef} className="rounded-3xl p-5 border shadow-2xl" style={{ background: theme.bg, borderColor: `${theme.tagText}33` }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: theme.tagBg, color: theme.tagText }}>
                {categoryMeta.emoji} #{categoryMeta.label}
              </span>
              <span className="text-xs font-black" style={{ color: theme.tagText, opacity: 0.65 }}>
                GOSSI
              </span>
            </div>

            <p className="text-[20px] leading-relaxed font-semibold mb-5" style={{ color: theme.text }}>
              {post.text}
            </p>

            <div className="flex items-center justify-between text-xs" style={{ color: theme.text, opacity: 0.65 }}>
              <span>@{anonName}</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: `${theme.tagText}22` }}>
              <p className="text-[11px] font-semibold tracking-wide" style={{ color: theme.tagText }}>
                gossip lives here → {shareUrl}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 bg-white/10 text-white font-semibold border border-white/15 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download image
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 bg-white/10 text-white font-semibold border border-white/15"
            >
              <Share2 className="w-4 h-4" />
              Copy link
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="col-span-2 flex items-center justify-center gap-2 rounded-2xl px-3 py-3 bg-[#25D366]/20 border border-[#25D366]/35 text-[#25D366] font-bold"
            >
              Share to WhatsApp
            </button>
          </div>

          <div className="mt-4 rounded-3xl bg-black/35 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-white/60" />
                Comments ({comments.length})
              </h3>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {loadingComments ? (
                <p className="text-white/40 text-sm">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-white/40 text-sm">Be the first to comment 👀</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.$id} className="rounded-2xl bg-white/6 border border-white/8 px-3 py-2.5">
                    <p className="text-white text-sm leading-relaxed">{comment.text}</p>
                    <p className="text-white/35 text-[11px] mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                placeholder="Reply anonymously..."
                maxLength={280}
                className="flex-1 bg-white/7 border border-white/12 rounded-2xl px-3 py-2.5 text-white text-sm placeholder-white/35 outline-none focus:border-gossi-red"
              />
              <button
                onClick={handleSendComment}
                disabled={!commentText.trim() || sendingComment}
                className="w-10 h-10 rounded-full btn-gossi flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
