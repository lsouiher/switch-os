'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAllTracks } from '@/lessons/loader';

interface LessonProgress {
  lessonId: string;
  status: string;
}

export default function TracksPage() {
  const { data: session } = useSession();
  const tracks = getAllTracks();
  const [progress, setProgress] = useState<LessonProgress[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/progress')
        .then((r) => (r.ok ? r.json() : []))
        .then(setProgress)
        .catch(() => {});
    }
  }, [session]);

  const getLessonStatus = (lessonId: string) => {
    const p = progress.find((pp) => pp.lessonId === lessonId);
    return p?.status || 'NOT_STARTED';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">← Back</Link>
          <h1 className="text-xl font-bold text-gray-900">Learning Tracks</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tracks.map((track) => (
          <div key={track.id} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{track.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{track.title}</h2>
                <p className="text-sm text-gray-500">{track.description}</p>
              </div>
            </div>

            <div className="grid gap-3">
              {track.lessons.map((lesson, i) => {
                const status = getLessonStatus(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={`/lesson?id=${lesson.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        status === 'COMPLETED'
                          ? 'bg-green-100 text-green-600'
                          : status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {status === 'COMPLETED' ? '✓' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{lesson.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400">{lesson.estimatedMinutes} min</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                        {lesson.steps.length} steps
                      </span>
                      {status === 'COMPLETED' ? (
                        <span className="text-green-500 text-sm">✓</span>
                      ) : status === 'IN_PROGRESS' ? (
                        <span className="text-blue-500 text-sm">▶</span>
                      ) : (
                        <span className="text-gray-400">→</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
