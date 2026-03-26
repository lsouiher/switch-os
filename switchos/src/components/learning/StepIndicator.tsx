'use client';

import React from 'react';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: Set<string>;
  stepIds: string[];
}

export default function StepIndicator({ totalSteps, currentStep, completedSteps, stepIds }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = completedSteps.has(stepIds[i]);
        const isCurrent = i === currentStep;

        return (
          <div
            key={i}
            className="flex items-center"
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-500'
                  : isCurrent
                  ? 'bg-blue-500 ring-2 ring-blue-200'
                  : 'bg-gray-300'
              }`}
            />
            {i < totalSteps - 1 && (
              <div
                className={`w-4 h-0.5 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
