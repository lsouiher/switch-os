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

const LOCAL_STORAGE_KEY = 'switchos-progress';

function getLocalProgress(): ProgressData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProgress(data: ProgressData) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalProgress();
    const idx = existing.findIndex((p) => p.lessonId === data.lessonId);
    if (idx >= 0) {
      existing[idx] = data;
    } else {
      existing.push(data);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage full or unavailable
  }
}

export function useProgressSync(lessonId: string, trackId: string) {
  const { data: session } = useSession();
  const startTimeRef = useRef(Date.now());
  const hintsUsedRef = useRef(0);
  const lastSavedRef = useRef<string>('');

  const lesson = useSimulationStore((s) => s.lesson);

  const saveProgress = useCallback(async (forceStatus?: string) => {
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

    // Always save to localStorage as fallback
    saveLocalProgress(data);

    // Also save to server if authenticated
    if (session?.user) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.error('Failed to save progress to server:', e);
      }
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
      if (lesson.completedSteps.size > 0) {
        const completedStepsArr = Array.from(lesson.completedSteps);
        const timeSpentSecs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const data: ProgressData = {
          lessonId,
          trackId,
          status: (lesson.lessonComplete ? 'COMPLETED' : 'IN_PROGRESS') as ProgressData['status'],
          currentStepId: lesson.currentStepIndex.toString(),
          completedSteps: completedStepsArr,
          timeSpentSecs,
          hintsUsed: hintsUsedRef.current,
          showMeUsed: 0,
        };

        // Always save locally
        saveLocalProgress(data);

        // Also try server if authenticated
        if (session?.user) {
          navigator.sendBeacon?.(
            '/api/progress',
            new Blob(
              [JSON.stringify(data)],
              { type: 'application/json' }
            )
          );
        }
      }
    };
  }, []);

  return { saveProgress };
}

export async function fetchUserProgress(isAuthenticated: boolean): Promise<ProgressData[]> {
  // Try server first if authenticated
  if (isAuthenticated) {
    try {
      const res = await fetch('/api/progress');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData.length > 0) return serverData;
      }
    } catch {
      // Fall through to localStorage
    }
  }

  // Fallback to localStorage
  return getLocalProgress();
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
