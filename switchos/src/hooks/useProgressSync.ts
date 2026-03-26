'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSimulationStore } from '@/store/useSimulationStore';

interface ProgressData {
  lessonId: string;
  trackId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  currentStepId: string | null;
  completedSteps: string[];
  timeSpentSecs: number;
  hintsUsed: number;
  showMeUsed: number;
}

export function useProgressSync(lessonId: string, trackId: string) {
  const { data: session } = useSession();
  const startTimeRef = useRef(Date.now());
  const hintsUsedRef = useRef(0);
  const lastSavedRef = useRef<string>('');

  const lesson = useSimulationStore((s) => s.lesson);

  const saveProgress = useCallback(async (forceStatus?: string) => {
    if (!session?.user) return;

    const completedStepsArr = Array.from(lesson.completedSteps);
    const currentStepId = lesson.currentStepIndex.toString();
    const timeSpentSecs = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const status = forceStatus || (lesson.lessonComplete ? 'COMPLETED' : 'IN_PROGRESS');

    // Dedup — don't save identical state
    const stateKey = `${status}:${completedStepsArr.join(',')}:${currentStepId}`;
    if (stateKey === lastSavedRef.current && !forceStatus) return;
    lastSavedRef.current = stateKey;

    const data: ProgressData = {
      lessonId,
      trackId,
      status: status as ProgressData['status'],
      currentStepId,
      completedSteps: completedStepsArr,
      timeSpentSecs,
      hintsUsed: hintsUsedRef.current,
      showMeUsed: 0,
    };

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [session, lesson, lessonId, trackId]);

  // Track hints used
  useEffect(() => {
    if (lesson.hintVisible) {
      hintsUsedRef.current++;
    }
  }, [lesson.hintVisible]);

  // Auto-save on step completion
  useEffect(() => {
    if (lesson.completedSteps.size > 0) {
      saveProgress();
    }
  }, [lesson.completedSteps.size, saveProgress]);

  // Save on lesson complete
  useEffect(() => {
    if (lesson.lessonComplete) {
      saveProgress('COMPLETED');
    }
  }, [lesson.lessonComplete, saveProgress]);

  // Save on unmount (leaving lesson)
  useEffect(() => {
    return () => {
      // Can't await in cleanup, fire and forget
      if (session?.user && lesson.completedSteps.size > 0) {
        const completedStepsArr = Array.from(lesson.completedSteps);
        const timeSpentSecs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        navigator.sendBeacon?.(
          '/api/progress',
          new Blob(
            [JSON.stringify({
              lessonId,
              trackId,
              status: lesson.lessonComplete ? 'COMPLETED' : 'IN_PROGRESS',
              currentStepId: lesson.currentStepIndex.toString(),
              completedSteps: completedStepsArr,
              timeSpentSecs,
              hintsUsed: hintsUsedRef.current,
              showMeUsed: 0,
            })],
            { type: 'application/json' }
          )
        );
      }
    };
  }, []);

  return { saveProgress };
}

export async function fetchUserProgress(): Promise<ProgressData[]> {
  try {
    const res = await fetch('/api/progress');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchUserProfile() {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
