'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LessonView from './LessonView';

function LessonContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('id') || 'macos-foundations-01';

  return <LessonView lessonId={lessonId} />;
}

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <LessonContent />
    </Suspense>
  );
}
