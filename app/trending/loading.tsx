import LoadingCard from '@/components/LoadingCard'

export default function TrendingLoading() {
  return (
    <div className="min-h-screen bg-[#080808] pb-28">
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="skeleton h-7 w-28 rounded-xl" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="max-w-xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          <div className="skeleton h-8 w-28 rounded-full flex-shrink-0" />
          <div className="skeleton h-8 w-20 rounded-full flex-shrink-0" />
          <div className="skeleton h-8 w-24 rounded-full flex-shrink-0" />
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </main>
    </div>
  )
}
