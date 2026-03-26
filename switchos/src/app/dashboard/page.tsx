'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAllTracks } from '@/lessons/loader';

interface UserProfile {
  name: string;
  email: string;
  xp: number;
  streak: number;
  badges: { badgeId: string }[];
  progress: { lessonId: string; trackId: string; status: string; completedSteps: string[] }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const tracks = getAllTracks();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/profile')
        .then((r) => (r.ok ? r.json() : null))
        .then(setProfile)
        .catch(() => {});
    }
  }, [session]);

  const isGuest = status !== 'authenticated';
  const userName = profile?.name || session?.user?.name || 'Guest';
  const completedLessons = profile?.progress?.filter((p) => p.status === 'COMPLETED').length || 0;
  const totalXp = profile?.xp || 0;
  const streak = profile?.streak || 0;
  const badgeCount = profile?.badges?.length || 0;

  const getTrackProgress = (trackId: string) => {
    if (!profile?.progress) return 0;
    const trackProgress = profile.progress.filter((p) => p.trackId === trackId);
    const completed = trackProgress.filter((p) => p.status === 'COMPLETED').length;
    const total = tracks.find((t) => t.id === trackId)?.totalLessons || 10;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">SwitchOS</Link>
          <div className="flex items-center gap-4">
            {isGuest ? (
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Sign In
              </Link>
            ) : (
              <>
                <span className="text-sm text-gray-500">{userName}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Sign Out
                </button>
              </>
            )}
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isGuest ? 'Welcome to SwitchOS' : `Welcome back, ${userName}`}
          </h1>
          <p className="text-gray-500 mt-1">
            {isGuest
              ? 'Start learning a new operating system today. Sign in to save your progress.'
              : 'Continue where you left off.'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{completedLessons}</div>
            <div className="text-sm text-gray-500">Lessons Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{totalXp}</div>
            <div className="text-sm text-gray-500">XP Earned</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{streak}</div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{badgeCount}</div>
            <div className="text-sm text-gray-500">Badges</div>
          </div>
        </div>

        {/* Tracks */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => {
            const progress = getTrackProgress(track.id);
            return (
              <Link
                key={track.id}
                href={`/tracks?id=${track.id}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">{track.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{track.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{track.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{track.totalLessons} lessons</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {progress > 0 && <span className="text-xs text-blue-600">{progress}%</span>}
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Coming soon cards */}
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 opacity-60">
            <div className="text-4xl mb-3">🪟</div>
            <h3 className="font-semibold text-gray-900 mb-1">Windows Foundations</h3>
            <p className="text-sm text-gray-500 mb-4">Master the Windows desktop environment.</p>
            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">Coming Soon</span>
          </div>
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 opacity-60">
            <div className="text-4xl mb-3">🐧</div>
            <h3 className="font-semibold text-gray-900 mb-1">Linux Foundations</h3>
            <p className="text-sm text-gray-500 mb-4">Learn the Linux desktop and terminal.</p>
            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">Coming Soon</span>
          </div>
        </div>
      </main>
    </div>
  );
}
