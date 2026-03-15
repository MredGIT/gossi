'use client'
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createPost } from '@/lib/appwrite'
import { MOCK_POSTS } from '@/lib/mockData'
import type { Post, Campus, Category } from '@/lib/types'

const USE_MOCK = !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

const CATEGORIES: Array<{ value: Category; emoji: string; label: string; color: string }> = [
  { value: 'tea',        emoji: '☕', label: 'Tea',        color: '#FF9F0A' },
  { value: 'confession', emoji: '🤫', label: 'Confession', color: '#BF5AF2' },
  { value: 'advice',     emoji: '💡', label: 'Advice',     color: '#0A84FF' },
  { value: 'drama',      emoji: '🎭', label: 'Drama',      color: '#FF2D55' },
  { value: 'random',     emoji: '🎲', label: 'Random',     color: '#30D158' },
]

const PROMPTS = [
  "Spill the tea ☕ What's going on at campus?",
  "Got a confession? 🤫 This is your safe space.",
  "Need advice? Drop it here 💡",
  "Witnessed drama? Don't let it die 🎭",
  "Random thoughts are valid too 🎲",
]

interface Props {
  campus:  Campus
  onClose: () => void
  onPost:  (post: Post) => void
}

export default function CreatePostModal({ campus, onClose, onPost }: Props) {
  const [text,     setText]     = useState('')
  const [category, setCategory] = useState<Category>('tea')
  const [saving,   setSaving]   = useState(false)
  const [charWarn, setCharWarn] = useState(false)

  const MAX     = 280
  const remaining = MAX - text.length
  const placeholder = PROMPTS[Math.floor(Math.random() * PROMPTS.length)]

  const handleChange = (v: string) => {
    if (v.length > MAX) return
    setText(v)
    setCharWarn(v.length > MAX - 30)
  }

  const handlePost = async () => {
    const trimmed = text.trim()
    if (trimmed.length < 5 || saving) return
    setSaving(true)

    try {
      if (USE_MOCK) {
        const mock: Post = {
          $id:          `mock-new-${Date.now()}`,
          text:         trimmed,
          campus,
          category,
          reactions:    { fire: 0, heart: 0, laugh: 0, sad: 0 },
          commentCount: 0,
          shareCount:   0,
          score:        0,
          createdAt:    new Date().toISOString(),
        }
        onPost(mock)
      } else {
        const post = await createPost(trimmed, campus, category)
        onPost(post)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to post. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const catInfo = CATEGORIES.find(c => c.value === category)!

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#0f0f0f] rounded-t-3xl border-t border-white/8 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="pt-4 pb-0 px-5">
          <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black text-lg">Drop your spill 🔥</h2>
            <button onClick={onClose} className="p-1.5 text-white/30 rounded-lg hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Anonymous badge */}
          <div className="flex items-center gap-2 py-2 px-3 bg-white/5 rounded-xl">
            <span className="text-xl">👻</span>
            <div>
              <p className="text-white/80 text-xs font-semibold">Posting as Anonymous</p>
              <p className="text-white/30 text-[10px]">Your identity is never revealed</p>
            </div>
          </div>

          {/* Text area */}
          <div>
            <textarea
              value={text}
              onChange={e => handleChange(e.target.value)}
              placeholder={placeholder}
              rows={5}
              className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-3.5 text-white text-[15px] leading-relaxed placeholder-white/20 outline-none focus:border-gossi-red resize-none transition-colors"
              autoFocus
            />
            <div className="flex justify-end mt-1.5">
              <span className={`text-xs font-mono ${charWarn ? 'text-gossi-orange' : 'text-white/20'}`}>
                {remaining}
              </span>
            </div>
          </div>

          {/* Category picker */}
          <div>
            <p className="text-white/40 text-xs mb-2 font-semibold uppercase tracking-wide">Category</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={category === cat.value
                    ? { background: `${cat.color}22`, borderColor: cat.color, color: cat.color }
                    : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                  }
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handlePost}
            disabled={text.trim().length < 5 || saving}
            className="w-full btn-gossi py-4 font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</>
            ) : (
              <>Spill It {catInfo.emoji}</>
            )}
          </button>

          <p className="text-center text-white/20 text-xs pb-1">
            Be real. Be kind. No bullying. 🙏
          </p>
        </div>
      </div>
    </div>
  )
}
