export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="w-12 h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
