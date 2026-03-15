'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getComments, createComment } from '@/lib/appwrite'
import { MOCK_COMMENTS } from '@/lib/mockData'
import type { Post, Comment, Campus } from '@/lib/types'

const USE_MOCK = !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

interface Props {
  post:        Post
  campus:      Campus
  onClose:     () => void
  onCommented: () => void
}

export default function CommentModal({ post, campus, onClose, onCommented }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text,     setText]     = useState('')
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (USE_MOCK) {
          setComments(MOCK_COMMENTS[post.$id] ?? [])
        } else {
          setComments(await getComments(post.$id))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [post.$id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      if (USE_MOCK) {
        const mock: Comment = {
          $id:       `cm-${Date.now()}`,
          postId:    post.$id,
          text:      trimmed,
          createdAt: new Date().toISOString(),
        }
        setComments(prev => [...prev, mock])
      } else {
        const comment = await createComment(post.$id, trimmed)
        setComments(prev => [...prev, comment])
      }
      setText('')
      onCommented()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#0f0f0f] rounded-t-3xl border-t border-white/8 animate-slide-up flex flex-col"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex-shrink-0 pt-4 pb-2 px-5">
          <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-white/40" />
              <span className="text-white font-bold text-sm">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Original post snippet */}
        <div className="flex-shrink-0 mx-5 mb-3 p-3 rounded-xl bg-white/4 border border-white/6">
          <p className="text-white/60 text-xs line-clamp-2">{post.text}</p>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-3 min-h-0">
          {loading ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-white/30 text-sm">No comments yet. Drop yours!</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.$id} className="flex items-start gap-3 animate-fade-up">
                <div className="w-8 h-8 rounded-full bg-gossi-purple/20 flex items-center justify-center text-sm flex-shrink-0">
                  👻
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <p className="text-white text-sm leading-relaxed">{c.text}</p>
                  <p className="text-white/25 text-xs mt-1">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="flex-shrink-0 border-t border-white/6 px-4 py-3 pb-safe flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gossi-red/20 flex items-center justify-center text-sm flex-shrink-0">
            👻
          </div>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Reply anonymously…"
            maxLength={280}
            className="flex-1 bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-gossi-red transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-9 h-9 rounded-full btn-gossi flex items-center justify-center flex-shrink-0 disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
