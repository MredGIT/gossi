import Navigation from '@/components/Navigation'

export default function ActivityLoading() {
  return (
    <div className="min-h-screen bg-[#080808] pb-28">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-xl mx-auto px-4 pt-3 pb-1 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse" />
          <div className="w-24 h-6 rounded-lg bg-white/10 animate-pulse" />
        </div>
        <div className="max-w-xl mx-auto px-4 pb-2">
          <div className="w-56 h-3 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="max-w-xl mx-auto px-4 pb-3 flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-24 h-8 rounded-full bg-white/8 animate-pulse" />
          ))}
        </div>
      </header>

      {/* Card skeletons */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-3xl bg-white/5 animate-pulse p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/10" />
              <div className="w-24 h-3 rounded bg-white/10" />
            </div>
            <div className="space-y-2">
              <div className="w-full h-3 rounded bg-white/10" />
              <div className="w-4/5 h-3 rounded bg-white/10" />
              <div className="w-3/5 h-3 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </main>

      <Navigation />
    </div>
  )
}
