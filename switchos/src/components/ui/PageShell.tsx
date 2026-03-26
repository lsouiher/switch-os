'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface PageShellProps {
  children: React.ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isGuest = status !== 'authenticated';
  const userName = session?.user?.name || 'Guest';

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tracks', label: 'Tracks' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      {/* Dark top bar */}
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
              <>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-on-dark-muted hover:text-on-dark transition-colors"
                >
                  Sign Out
                </button>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Light content area */}
      <main className="flex-1">{children}</main>

      {/* Dark footer */}
      <footer className="bg-surface-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-on-dark-muted">
          SwitchOS — The Duolingo for operating systems
        </div>
      </footer>
    </div>
  );
}
