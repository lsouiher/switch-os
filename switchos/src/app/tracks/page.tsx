'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllTracks } from '@/lessons/loader';
import { fetchUserProgress } from '@/hooks/useProgressSync';
import PageShell from '@/components/ui/PageShell';

interface LessonProgress {
  lessonId: string;
  status: string;
}

function TracksContent() {
  const { data: session, status: authStatus } = useSession();
  const searchParams = useSearchParams();
  const trackId = searchParams.get('id');
  const allTracks = getAllTracks();
  const tracks = trackId ? allTracks.filter((t) => t.id === trackId) : allTracks;
  const [progress, setProgress] = useState<LessonProgress[]>([]);

  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    fetchUserProgress(isAuthenticated)
      .then(setProgress)
      .catch(() => {});
  }, [isAuthenticated]);

  const getLessonStatus = (lessonId: string) => {
    const p = progress.find((pp) => pp.lessonId === lessonId);
    return p?.status || 'NOT_STARTED';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {tracks.map((track) => (
        <div key={track.id} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{track.icon}</span>
            <div>
              <h2 className="text-[length:var(--font-size-h1)] font-bold text-on-surface">{track.title}</h2>
              <p className="text-sm text-on-surface-muted">{track.description}</p>
            </div>
          </div>

          <div className="grid gap-3">
            {track.lessons.map((lesson, i) => {
              const status = getLessonStatus(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  href={`/lesson?id=${lesson.id}`}
                  className="bg-surface-1 rounded-lg border border-border p-4 hover:shadow-md hover:border-border-hover transition-all flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      status === 'COMPLETED'
                        ? 'bg-success-light text-success'
                        : status === 'IN_PROGRESS'
                        ? 'bg-primary-light text-primary'
                        : 'bg-surface-2 text-on-surface-muted'
                    }`}
                  >
                    {status === 'COMPLETED' ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-on-surface">{lesson.title}</h3>
                    <p className="text-sm text-on-surface-muted truncate">{lesson.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-on-surface-muted">{lesson.estimatedMinutes} min</span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-surface-2 text-on-surface-muted">
                      {lesson.steps.length} steps
                    </span>
                    {status === 'COMPLETED' ? (
                      <span className="text-success text-sm font-bold">✓</span>
                    ) : status === 'IN_PROGRESS' ? (
                      <span className="text-primary text-sm">&#x25B6;</span>
                    ) : (
                      <span className="text-on-surface-muted">&#x2192;</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TracksPage() {
  return (
    <PageShell>
      <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8 text-on-surface-muted">Loading...</div>}>
        <TracksContent />
      </Suspense>
    </PageShell>
  );
}
