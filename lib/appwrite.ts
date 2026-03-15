// ─────────────────────────────────────────────────────────────────────────────
//  GOSSI — Appwrite client + all database operations
//  Configure .env.local with your Appwrite credentials before using live data.
//  Without credentials the app falls back to mock data automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { Client, Databases, ID, Query, Storage } from 'appwrite'
import type { Post, Comment, Report, Ad, BannedWord, Campus, Reactions } from './types'

// ── Client setup ─────────────────────────────────────────────────────────────

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '')

export const databases = new Databases(client)
export const storage   = new Storage(client)

// Collection constants (match .env.local)
export const DB            = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID     ?? 'gossi_db'
export const C_POSTS       = process.env.NEXT_PUBLIC_COLLECTION_POSTS         ?? 'post'
export const C_COMMENTS    = process.env.NEXT_PUBLIC_COLLECTION_COMMENTS      ?? 'comments'
export const C_REPORTS     = process.env.NEXT_PUBLIC_COLLECTION_REPORTS       ?? 'reports'
export const C_ADS         = process.env.NEXT_PUBLIC_COLLECTION_ADS           ?? 'ads'
export const C_BANNED      = process.env.NEXT_PUBLIC_COLLECTION_BANNED_WORDS  ?? 'banned_words'
export const B_AD_MEDIA    = process.env.NEXT_PUBLIC_ADS_BUCKET_ID            ?? ''

// ── Helpers ───────────────────────────────────────────────────────────────────

export function calculateScore(reactions: Reactions, comments: number, shares: number): number {
  const total = reactions.fire + reactions.heart + reactions.laugh + reactions.sad
  return total * 2 + comments + shares
}

function parseReactions(raw: string | Reactions): Reactions {
  if (typeof raw === 'object' && raw !== null) return raw
  try {
    return JSON.parse(raw as string)
  } catch {
    return { fire: 0, heart: 0, laugh: 0, sad: 0 }
  }
}

function mapPost(doc: Record<string, unknown>): Post {
  return { ...doc, reactions: parseReactions(doc.reactions as string) } as Post
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function getPostsByIds(ids: string[]): Promise<Post[]> {
  if (!ids.length) return []
  // Appwrite limits array values per query — process in batches of 25
  const results: Post[] = []
  for (let i = 0; i < ids.length; i += 25) {
    const batch = ids.slice(i, i + 25)
    const res = await databases.listDocuments(DB, C_POSTS, [
      Query.equal('$id', batch),
      Query.equal('isDeleted', false),
      Query.limit(25),
    ])
    results.push(...res.documents.map(mapPost))
  }
  // Preserve the original ID order (newest first as stored in activity)
  const map = new Map(results.map(p => [p.$id, p]))
  return ids.map(id => map.get(id)).filter(Boolean) as Post[]
}

export async function getPosts(campus: Campus, limit = 20, offset = 0): Promise<Post[]> {
  const res = await databases.listDocuments(DB, C_POSTS, [
    Query.equal('campus', campus),
    Query.equal('isDeleted', false),
    Query.orderDesc('createdAt'),
    Query.limit(limit),
    Query.offset(offset),
  ])
  return res.documents.map(mapPost)
}

export async function getTrendingPosts(campus: Campus, limit = 20): Promise<Post[]> {
  const res = await databases.listDocuments(DB, C_POSTS, [
    Query.equal('campus', campus),
    Query.equal('isDeleted', false),
    Query.orderDesc('score'),
    Query.limit(limit),
  ])
  return res.documents.map(mapPost)
}

export async function createPost(
  text: string,
  campus: Campus,
  category: string,
): Promise<Post> {
  const reactions: Reactions = { fire: 0, heart: 0, laugh: 0, sad: 0 }
  const doc = await databases.createDocument(DB, C_POSTS, ID.unique(), {
    text,
    campus,
    category,
    reactions:    JSON.stringify(reactions),
    commentCount: 0,
    shareCount:   0,
    score:        0,
    isDeleted:    false,
    isReported:   false,
    reportCount:  0,
    createdAt:    new Date().toISOString(),
  })
  return mapPost(doc as unknown as Record<string, unknown>)
}

export async function addReaction(
  postId: string,
  current: Reactions,
  type: keyof Reactions,
): Promise<Reactions> {
  const updated = { ...current, [type]: current[type] + 1 }
  const post    = await databases.getDocument(DB, C_POSTS, postId)
  const score   = calculateScore(updated, post.commentCount as number, post.shareCount as number)

  await databases.updateDocument(DB, C_POSTS, postId, {
    reactions: JSON.stringify(updated),
    score,
  })
  return updated
}

export async function incrementShare(postId: string, current: number): Promise<void> {
  const post      = await databases.getDocument(DB, C_POSTS, postId)
  const reactions = parseReactions(post.reactions as string)
  const shares    = current + 1
  await databases.updateDocument(DB, C_POSTS, postId, {
    shareCount: shares,
    score: calculateScore(reactions, post.commentCount as number, shares),
  })
}

export async function softDeletePost(postId: string): Promise<void> {
  await databases.updateDocument(DB, C_POSTS, postId, { isDeleted: true })
}

// Admin: all posts (including deleted)
export async function adminGetPosts(limit = 100): Promise<Post[]> {
  const res = await databases.listDocuments(DB, C_POSTS, [
    Query.orderDesc('createdAt'),
    Query.limit(limit),
  ])
  return res.documents.map(mapPost)
}

// ── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(postId: string): Promise<Comment[]> {
  const res = await databases.listDocuments(DB, C_COMMENTS, [
    Query.equal('postId', postId),
    Query.orderAsc('createdAt'),
  ])
  return res.documents as unknown as Comment[]
}

export async function createComment(postId: string, text: string): Promise<Comment> {
  const doc = await databases.createDocument(DB, C_COMMENTS, ID.unique(), {
    postId,
    text,
    createdAt: new Date().toISOString(),
  })

  // bump commentCount + recalculate score
  const post     = await databases.getDocument(DB, C_POSTS, postId)
  const newCount = (post.commentCount as number) + 1
  const rxn      = parseReactions(post.reactions as string)
  await databases.updateDocument(DB, C_POSTS, postId, {
    commentCount: newCount,
    score: calculateScore(rxn, newCount, post.shareCount as number),
  })

  return doc as unknown as Comment
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function reportPost(postId: string, reason: string, campus: Campus): Promise<void> {
  await databases.createDocument(DB, C_REPORTS, ID.unique(), {
    postId,
    reason,
    campus,
    createdAt: new Date().toISOString(),
  })
  const post = await databases.getDocument(DB, C_POSTS, postId)
  await databases.updateDocument(DB, C_POSTS, postId, {
    isReported:  true,
    reportCount: ((post.reportCount as number) ?? 0) + 1,
  })
}

export async function getAllReports(limit = 100): Promise<Report[]> {
  const res = await databases.listDocuments(DB, C_REPORTS, [
    Query.orderDesc('createdAt'),
    Query.limit(limit),
  ])
  return res.documents as unknown as Report[]
}

// ── Ads ───────────────────────────────────────────────────────────────────────

export async function getActiveAds(): Promise<Ad[]> {
  const res = await databases.listDocuments(DB, C_ADS, [
    Query.equal('isActive', true),
    Query.orderDesc('createdAt'),
  ])
  return res.documents as unknown as Ad[]
}

export async function getAllAds(): Promise<Ad[]> {
  const res = await databases.listDocuments(DB, C_ADS, [
    Query.orderDesc('createdAt'),
  ])
  return res.documents as unknown as Ad[]
}

export async function createAd(
  title:     string,
  imageUrl:  string,
  linkUrl:   string,
  mediaType: 'image' | 'video',
): Promise<Ad> {
  const doc = await databases.createDocument(DB, C_ADS, ID.unique(), {
    title,
    imageUrl,
    linkUrl,
    mediaType,
    isActive:  true,
    createdAt: new Date().toISOString(),
  })
  return doc as unknown as Ad
}

export async function uploadAdMedia(file: File): Promise<string> {
  if (!B_AD_MEDIA) {
    throw new Error('Missing NEXT_PUBLIC_ADS_BUCKET_ID in environment.')
  }

  const uploaded = await storage.createFile(B_AD_MEDIA, ID.unique(), file)
  return storage.getFileView(B_AD_MEDIA, uploaded.$id).toString()
}

export async function toggleAd(adId: string, isActive: boolean): Promise<void> {
  await databases.updateDocument(DB, C_ADS, adId, { isActive })
}

export async function deleteAd(adId: string): Promise<void> {
  await databases.deleteDocument(DB, C_ADS, adId)
}

// ── Banned words ─────────────────────────────────────────────────────────────

export async function getBannedWords(): Promise<BannedWord[]> {
  const res = await databases.listDocuments(DB, C_BANNED, [])
  return res.documents as unknown as BannedWord[]
}

export async function addBannedWord(word: string): Promise<void> {
  await databases.createDocument(DB, C_BANNED, ID.unique(), {
    word:      word.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
  })
}

export async function removeBannedWord(id: string): Promise<void> {
  await databases.deleteDocument(DB, C_BANNED, id)
}

export function hasBannedWord(text: string, banned: BannedWord[]): boolean {
  const lower = text.toLowerCase()
  return banned.some(b => lower.includes(b.word))
}

// ── Stats (admin) ─────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const [posts, reports, ads] = await Promise.all([
    databases.listDocuments(DB, C_POSTS,   [Query.equal('isDeleted', false), Query.limit(1)]),
    databases.listDocuments(DB, C_REPORTS, [Query.limit(1)]),
    databases.listDocuments(DB, C_ADS,     [Query.equal('isActive', true), Query.limit(1)]),
  ])
  return {
    totalPosts:   posts.total,
    totalReports: reports.total,
    activeAds:    ads.total,
  }
}
