export default function LoadingCard() {
  return (
    <div className="bg-[#111] rounded-[20px] p-5 border border-white/5">
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="skeleton w-7 h-7 rounded-full" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      {/* Text lines */}
      <div className="space-y-2 mb-5">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-4/6 rounded" />
      </div>
      {/* Bottom row */}
      <div className="flex items-center gap-2">
        <div className="skeleton h-8 w-16 rounded-full" />
        <div className="skeleton h-8 w-16 rounded-full" />
        <div className="skeleton h-8 w-16 rounded-full" />
        <div className="skeleton h-8 w-16 rounded-full" />
        <div className="ml-auto skeleton h-8 w-20 rounded-full" />
      </div>
    </div>
  )
}
