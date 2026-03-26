'use client';

import React, { useEffect, useCallback } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { getLesson } from '@/lessons/loader';
import { isStepComplete, getProgress } from '@/lessons/evaluator';
import { useHintTimer } from '@/lessons/hintEngine';
import StepIndicator from './StepIndicator';
import HintBubble from './HintBubble';
import CompletionModal from './CompletionModal';
import type { Lesson } from '@/lessons/types';

interface CoachPanelProps {
  lessonId: string;
  onNextLesson: () => void;
  onBackToDashboard: () => void;
}

export default function CoachPanel({ lessonId, onNextLesson, onBackToDashboard }: CoachPanelProps) {
  const lesson = getLesson(lessonId);
  const store = useSimulationStore();
  const { currentStepIndex, completedSteps, hintVisible, lessonComplete } = store.lesson;
  const advanceStep = store.advanceStep;
  const completeStep = store.completeStep;
  const setLessonComplete = store.setLessonComplete;

  const currentStep = lesson?.steps[currentStepIndex] || null;
  useHintTimer(currentStep);

  // Check step completion
  const checkProgress = useCallback(() => {
    if (!lesson || lessonComplete) return;

    const step = lesson.steps[currentStepIndex];
    if (!step) return;

    if (isStepComplete(step, store)) {
      completeStep(step.id);

      if (currentStepIndex < lesson.steps.length - 1) {
        advanceStep();
      } else {
        setLessonComplete(true);
      }
    }
  }, [lesson, currentStepIndex, store, completeStep, advanceStep, setLessonComplete, lessonComplete]);

  // Poll for completion (check every 500ms)
  useEffect(() => {
    const interval = setInterval(checkProgress, 500);
    return () => clearInterval(interval);
  }, [checkProgress]);

  if (!lesson) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <p className="text-gray-400 text-sm">Lesson not found.</p>
      </div>
    );
  }

  const progress = getProgress(lesson, store);

  return (
    <>
      <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden" role="complementary" aria-label="Lesson coach panel">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-800">{lesson.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Step {Math.min(currentStepIndex + 1, lesson.steps.length)} of {lesson.steps.length}
          </p>
        </div>

        {/* Step indicator */}
        <div className="px-4 py-3 border-b border-gray-100">
          <StepIndicator
            totalSteps={lesson.steps.length}
            currentStep={currentStepIndex}
            completedSteps={completedSteps}
            stepIds={lesson.steps.map((s) => s.id)}
          />
        </div>

        {/* Current instruction */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {currentStep ? (
            <div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 shrink-0 text-lg">📝</span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentStep.instruction}
                </p>
              </div>

              <HintBubble hint={currentStep.hint} visible={hintVisible} />
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">✅</span>
              <p className="mt-2 text-sm text-gray-600">All steps completed!</p>
            </div>
          )}

          {/* Completed steps history */}
          {currentStepIndex > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase">Completed</p>
              {lesson.steps.slice(0, currentStepIndex).map((step) => (
                <div key={step.id} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-green-500 shrink-0">✓</span>
                  <span className="line-through">{step.instruction}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-400">
            +{lesson.steps.length * 5} XP this lesson
          </div>
        </div>
      </div>

      {/* Completion modal */}
      {lessonComplete && (
        <CompletionModal
          lessonTitle={lesson.title}
          stepsCompleted={lesson.steps.length}
          totalSteps={lesson.steps.length}
          xpEarned={lesson.steps.length * 5}
          onNextLesson={onNextLesson}
          onBackToDashboard={onBackToDashboard}
        />
      )}
    </>
  );
}
