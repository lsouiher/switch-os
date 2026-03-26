import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="text-xl font-bold">SwitchOS</div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <div className="text-6xl mb-6">🖥️</div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Learn Any Operating System,
          <br />
          <span className="text-blue-400">Without the Machine</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-8">
          Interactive, hands-on training environments for learning macOS, Windows, and Linux.
          Practice real tasks in a safe, simulated desktop — right in your browser.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-medium"
          >
            Start Learning Free
          </Link>
          <Link
            href="/tracks"
            className="px-8 py-3 border border-gray-600 hover:border-gray-400 rounded-xl text-lg"
          >
            View Tracks
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-left">
            <div className="text-3xl mb-3">🍎</div>
            <h3 className="font-semibold mb-2">macOS Foundations</h3>
            <p className="text-sm text-gray-400">
              Master Finder, Dock, Spotlight, keyboard shortcuts, and more.
              10 guided lessons for beginners.
            </p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-left">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Hands-On Learning</h3>
            <p className="text-sm text-gray-400">
              Every lesson involves doing, not watching. Practice real OS tasks
              with guided step-by-step instructions.
            </p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-left">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-semibold mb-2">Zero Hardware Required</h3>
            <p className="text-sm text-gray-400">
              Everything runs in your browser. Try macOS without buying a Mac.
              No downloads, no VMs, no setup.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-gray-500">
        SwitchOS — The Duolingo for operating systems
      </footer>
    </div>
  );
}
