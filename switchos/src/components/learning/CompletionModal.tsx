'use client';

import React from 'react';

interface CompletionModalProps {
  lessonTitle: string;
  stepsCompleted: number;
  totalSteps: number;
  xpEarned: number;
  onNextLesson: () => void;
  onBackToDashboard: () => void;
}

export default function CompletionModal({
  lessonTitle,
  stepsCompleted,
  totalSteps,
  xpEarned,
  onNextLesson,
  onBackToDashboard,
}: CompletionModalProps) {
  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl animate-scaleIn">
        {/* Celebration */}
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
        <p className="text-gray-600 mb-6">{lessonTitle}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 rounded-xl p-4">
          <div>
            <div className="text-2xl font-bold text-green-600">{stepsCompleted}/{totalSteps}</div>
            <div className="text-xs text-gray-500">Steps</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">+{xpEarned}</div>
            <div className="text-xs text-gray-500">XP Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            Dashboard
          </button>
          <button
            onClick={onNextLesson}
            className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
          >
            Next Lesson →
          </button>
        </div>
      </div>
    </div>
  );
}
