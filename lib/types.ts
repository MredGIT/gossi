// ─────────────────────────────────────────────────────────────────────────────
//  GOSSI — Shared TypeScript types
// ─────────────────────────────────────────────────────────────────────────────

export type Campus = 'anu' | 'uon' | 'strath' | 'ku' | 'other'

export type Category = 'tea' | 'confession' | 'advice' | 'drama' | 'random'

export interface Reactions {
  fire:  number
  heart: number
  laugh: number
  sad:   number
}

export interface Post {
  $id:          string
  text:         string
  campus:       Campus
  category:     Category
  reactions:    Reactions
  commentCount: number
  shareCount:   number
  score:        number
  createdAt:    string
  isDeleted?:   boolean
  isReported?:  boolean
  reportCount?: number
}

export interface Comment {
  $id:       string
  postId:    string
  text:      string
  createdAt: string
}

export interface Report {
  $id:       string
  postId:    string
  postText?: string
  reason:    string
  campus:    Campus
  createdAt: string
}

export interface Ad {
  $id:       string
  title:     string
  imageUrl:  string
  linkUrl:   string
  mediaType: 'image' | 'video'
  isActive:  boolean
  createdAt: string
}

export interface BannedWord {
  $id:  string
  word: string
}

export interface CampusInfo {
  id:    Campus
  name:  string
  short: string
  emoji: string
  color: string
}
