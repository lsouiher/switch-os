'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Home() {
  const { status } = useSession();
  const pathname = usePathname();
  const isGuest = status !== 'authenticated';

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tracks', label: 'Tracks' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark nav bar — matches PageShell */}
      <nav className="bg-surface-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-on-dark">
              SwitchOS
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-surface-dark-elevated text-on-dark'
                      : 'text-on-dark-muted hover:text-on-dark hover:bg-surface-dark-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isGuest ? (
              <>
                <Link
                  href="/login"
                  className="text-sm text-on-dark-muted hover:text-on-dark transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero — dark blue gradient */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto py-16 flex flex-col items-center">
        <div className="text-6xl mb-6">&#x1F5A5;&#xFE0F;</div>
        <h1 className="text-[length:var(--font-size-display)] sm:text-5xl font-bold tracking-tight text-on-dark mb-4 leading-tight">
          Learn Any Operating System,
          <br />
          <span className="text-primary">Without the Machine</span>
        </h1>
        <p className="text-lg sm:text-xl text-on-dark-muted max-w-2xl mb-8 leading-relaxed">
          Interactive, hands-on training environments for learning macOS, Windows, and Linux.
          Practice real tasks in a safe, simulated desktop — right in your browser.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-md text-lg font-medium transition-colors"
          >
            Start Learning Free
          </Link>
          <Link
            href="/tracks"
            className="px-8 py-3 border border-on-dark-muted/30 text-on-dark hover:border-on-dark-muted rounded-md text-lg transition-colors"
          >
            View Tracks
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          <div className="bg-surface-dark-elevated border border-on-dark-muted/10 rounded-lg p-6 text-left">
            <div className="text-3xl mb-3">&#x1F34E;</div>
            <h3 className="font-semibold text-on-dark mb-2">macOS Foundations</h3>
            <p className="text-sm text-on-dark-muted">
              Master Finder, Dock, Spotlight, keyboard shortcuts, and more.
              10 guided lessons for beginners.
            </p>
          </div>
          <div className="bg-surface-dark-elevated border border-on-dark-muted/10 rounded-lg p-6 text-left">
            <div className="text-3xl mb-3">&#x1F3AF;</div>
            <h3 className="font-semibold text-on-dark mb-2">Hands-On Learning</h3>
            <p className="text-sm text-on-dark-muted">
              Every lesson involves doing, not watching. Practice real OS tasks
              with guided step-by-step instructions.
            </p>
          </div>
          <div className="bg-surface-dark-elevated border border-on-dark-muted/10 rounded-lg p-6 text-left">
            <div className="text-3xl mb-3">&#x1F310;</div>
            <h3 className="font-semibold text-on-dark mb-2">Zero Hardware Required</h3>
            <p className="text-sm text-on-dark-muted">
              Everything runs in your browser. Try macOS without buying a Mac.
              No downloads, no VMs, no setup.
            </p>
          </div>
        </div>
        </div>
      </main>

      {/* Dark footer */}
      <footer className="bg-surface-dark px-4 sm:px-6 py-8 text-center text-sm text-on-dark-muted">
        SwitchOS — The Duolingo for operating systems
      </footer>
    </div>
  );
}
