'use client'
import { ExternalLink } from 'lucide-react'
import type { Ad } from '@/lib/types'

interface Props { ad: Ad }

export default function AdCard({ ad }: Props) {
  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="ad-card block"
      onClick={() => {/* track click if needed */}}
    >
      {/* Sponsored label */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Sponsored</span>
        <ExternalLink className="w-3.5 h-3.5 text-white/20" />
      </div>

      {/* Media */}
      {ad.imageUrl && (
        <div className="relative w-full" style={{ aspectRatio: '16/7', overflow: 'hidden' }}>
          {ad.mediaType === 'video' ? (
            <video
              src={ad.imageUrl}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Title + CTA */}
      <div className="px-4 py-3.5 flex items-center justify-between gap-3">
        <p className="text-white font-semibold text-sm leading-tight flex-1">{ad.title}</p>
        <span
          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: 'linear-gradient(135deg,#FF2D55,#BF5AF2)', color: '#fff' }}
        >
          See More →
        </span>
      </div>
    </a>
  )
}
