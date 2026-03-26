'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Desktop from '@/components/simulation/Desktop';
import CoachPanel from '@/components/learning/CoachPanel';
import { useSimulationStore } from '@/store/useSimulationStore';
import { getLesson, getLessonByOrder } from '@/lessons/loader';
import { defaultMacShortcuts } from '@/simulation/keyboardHandler';
import { useProgressSync } from '@/hooks/useProgressSync';

interface LessonViewProps {
  lessonId: string;
}

export default function LessonView({ lessonId }: LessonViewProps) {
  const router = useRouter();
  const lesson = getLesson(lessonId);
  const setCurrentLesson = useSimulationStore((s) => s.setCurrentLesson);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const openWindow = useSimulationStore((s) => s.openWindow);

  // Sync progress to server
  useProgressSync(lessonId, lesson?.trackId || 'macos-foundations');

  useEffect(() => {
    resetSimulation();
    setCurrentLesson(lessonId);

    // Apply lesson initial state — open specified windows
    if (lesson?.initialState?.openWindows) {
      for (const win of lesson.initialState.openWindows) {
        openWindow(win.appId, { meta: win.meta });
      }
    }
  }, [lessonId, resetSimulation, setCurrentLesson, openWindow, lesson]);

  const handleNextLesson = () => {
    if (!lesson) return;
    const next = getLessonByOrder(lesson.trackId, lesson.order + 1);
    if (next) {
      router.push(`/lesson?id=${next.id}`);
    } else {
      router.push('/tracks');
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Relevant shortcuts for current lesson
  const relevantShortcuts = useMemo(() => {
    if (!lesson) return [];
    const shortcutActions = new Set<string>();
    for (const step of lesson.steps) {
      if (step.completionCheck.type === 'shortcut_used') {
        const keys = step.completionCheck.params.keys as string[];
        shortcutActions.add(keys.join('+'));
      }
    }
    return defaultMacShortcuts.filter((s) => {
      const key = s.keys.join('+');
      return shortcutActions.has(key);
    }).slice(0, 4);
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Lesson not found</p>
          <button
            onClick={() => router.push('/tracks')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Tracks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Mobile gate */}
      <div className="lg:hidden flex items-center justify-center h-screen bg-gray-900 text-white p-8 text-center">
        <div>
          <div className="text-5xl mb-4">🖥️</div>
          <h2 className="text-xl font-bold mb-2">Desktop Required</h2>
          <p className="text-gray-400 text-sm mb-6">
            The SwitchOS simulation requires a screen at least 1024px wide. Please use a desktop or laptop computer.
          </p>
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between h-10 px-4 bg-gray-900 text-white text-sm shrink-0">
        <button
          onClick={handleBackToDashboard}
          className="text-gray-400 hover:text-white"
        >
          ← Exit
        </button>
        <span className="font-medium">
          Lesson {lesson.order}: {lesson.title}
        </span>
        <span className="text-gray-400 text-xs">
          {lesson.estimatedMinutes} min
        </span>
      </div>

      {/* Main area: simulation + coach panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Desktop />
        </div>
        <CoachPanel
          lessonId={lessonId}
          onNextLesson={handleNextLesson}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>

      {/* Keyboard shortcut bar */}
      {relevantShortcuts.length > 0 && (
        <div className="flex items-center gap-6 h-8 px-4 bg-gray-800 text-gray-400 text-xs shrink-0">
          <span className="text-gray-500">Shortcuts:</span>
          {relevantShortcuts.map((s) => (
            <span key={s.action}>
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 text-[10px]">
                {s.keys.map((k) => {
                  if (k === 'Meta') return '⌘';
                  if (k === 'Shift') return '⇧';
                  if (k === 'Alt') return '⌥';
                  if (k === 'Backspace') return '⌫';
                  if (k === ' ') return 'Space';
                  return k.toUpperCase();
                }).join('')}
              </kbd>
              {' '}{s.description}
            </span>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
