// src/app/dashboard/loading.tsx
// Architecture note: Next.js automatically shows this component while the
// dashboard page's async server components are fetching data.
// This eliminates layout shift and gives users immediate visual feedback.

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto bg-[#F8F9FA] min-h-full p-8 rounded-2xl animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-[24px] w-32 bg-gray-200 rounded-lg" />
        <div className="h-4 w-48 bg-gray-200/60 rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-[16px] p-6 space-y-4 h-[160px] shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-gray-100" />
            <div className="space-y-2">
              <div className="h-7 w-12 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Charts & Top Jobs skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border rounded-[16px] p-6 h-72 shadow-sm" />
        <div className="lg:col-span-1 bg-white border border-border rounded-[16px] p-6 h-72 shadow-sm" />
      </div>

      {/* Recent applications & Tasks skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border rounded-[16px] p-6 h-72 shadow-sm" />
        <div className="lg:col-span-1 bg-white border border-border rounded-[16px] p-6 h-72 shadow-sm" />
      </div>
    </div>
  );
}
