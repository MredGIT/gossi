// ─────────────────────────────────────────────────────────────────────────────
//  GOSSI — Activity tracking (localStorage only, no accounts, no identity)
//  Tracks which posts the user posted, reacted to, and commented on.
//  Max 30 IDs per list, newest first.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TRACK = 30

const KEYS = {
  posted:    'gossi_act_posted',
  reacted:   'gossi_act_reacted',
  commented: 'gossi_act_commented',
} as const

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveIds(key: string, ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(ids.slice(0, MAX_TRACK)))
  } catch {}
}

function trackId(key: string, id: string) {
  const ids = readIds(key).filter(i => i !== id) // dedupe first
  saveIds(key, [id, ...ids])
}

export const trackPosted    = (id: string) => trackId(KEYS.posted,    id)
export const trackReacted   = (id: string) => trackId(KEYS.reacted,   id)
export const trackCommented = (id: string) => trackId(KEYS.commented, id)

export const getPostedIds    = () => readIds(KEYS.posted)
export const getReactedIds   = () => readIds(KEYS.reacted)
export const getCommentedIds = () => readIds(KEYS.commented)
