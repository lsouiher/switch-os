'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAllTracks } from '@/lessons/loader';
import PageShell from '@/components/ui/PageShell';

interface UserProfile {
  name: string;
  email: string;
  xp: number;
  streak: number;
  badges: { badgeId: string }[];
  progress: { lessonId: string; trackId: string; status: string; completedSteps: string[] }[];
}

const TRACK_COLORS: Record<string, string> = {
  'macos-foundations': 'border-t-track-macos',
  'windows-foundations': 'border-t-track-windows',
  'linux-foundations': 'border-t-track-linux',
};

const TRACK_PROGRESS_COLORS: Record<string, string> = {
  'macos-foundations': 'bg-track-macos',
  'windows-foundations': 'bg-track-windows',
  'linux-foundations': 'bg-track-linux',
};

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
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-[length:var(--font-size-h1)] font-bold text-on-surface">
            {isGuest ? 'Welcome to SwitchOS' : `Welcome back, ${userName}`}
          </h1>
          <p className="text-on-surface-muted mt-1">
            {isGuest
              ? 'Start learning a new operating system today. Sign in to save your progress.'
              : 'Continue where you left off.'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-surface-1 rounded-lg border border-border p-6">
            <div className="text-3xl font-bold text-success">{completedLessons}</div>
            <div className="text-sm text-on-surface-muted mt-1">Lessons Completed</div>
          </div>
          <div className="bg-surface-1 rounded-lg border border-border p-6">
            <div className="text-3xl font-bold text-xp">{totalXp}</div>
            <div className="text-sm text-on-surface-muted mt-1">XP Earned</div>
          </div>
          <div className="bg-surface-1 rounded-lg border border-border p-6">
            <div className="text-3xl font-bold text-warning">{streak}</div>
            <div className="text-sm text-on-surface-muted mt-1">Day Streak</div>
          </div>
          <div className="bg-surface-1 rounded-lg border border-border p-6">
            <div className="text-3xl font-bold text-primary">{badgeCount}</div>
            <div className="text-sm text-on-surface-muted mt-1">Badges</div>
          </div>
        </div>

        {/* Tracks */}
        <h2 className="text-[length:var(--font-size-h2)] font-semibold text-on-surface mb-6">Learning Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => {
            const progress = getTrackProgress(track.id);
            const accentBorder = TRACK_COLORS[track.id] || 'border-t-primary';
            const progressColor = TRACK_PROGRESS_COLORS[track.id] || 'bg-primary';
            return (
              <Link
                key={track.id}
                href={`/tracks?id=${track.id}`}
                className={`bg-surface-1 rounded-lg border border-border border-t-3 ${accentBorder} p-6 hover:shadow-md hover:border-border-hover transition-all`}
              >
                <div className="text-4xl mb-3">{track.icon}</div>
                <h3 className="text-[length:var(--font-size-h3)] font-semibold text-on-surface mb-1">{track.title}</h3>
                <p className="text-sm text-on-surface-muted mb-4">{track.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-muted">{track.totalLessons} lessons</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-surface-2 rounded-full">
                      <div
                        className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {progress > 0 && <span className="text-xs font-medium text-primary">{progress}%</span>}
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Coming soon cards */}
          <div className="bg-surface-1 rounded-lg border border-border border-t-3 border-t-track-windows p-6 opacity-50">
            <div className="text-4xl mb-3">&#x1FA9F;</div>
            <h3 className="text-[length:var(--font-size-h3)] font-semibold text-on-surface mb-1">Windows Foundations</h3>
            <p className="text-sm text-on-surface-muted mb-4">Master the Windows desktop environment.</p>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-surface-2 text-on-surface-muted">
              Coming Soon
            </span>
          </div>
          <div className="bg-surface-1 rounded-lg border border-border border-t-3 border-t-track-linux p-6 opacity-50">
            <div className="text-4xl mb-3">&#x1F427;</div>
            <h3 className="text-[length:var(--font-size-h3)] font-semibold text-on-surface mb-1">Linux Foundations</h3>
            <p className="text-sm text-on-surface-muted mb-4">Learn the Linux desktop and terminal.</p>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-surface-2 text-on-surface-muted">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
