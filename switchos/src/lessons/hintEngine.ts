import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { LessonStep } from './types';

export function useHintTimer(currentStep: LessonStep | null) {
  const showHint = useSimulationStore((s) => s.showHint);
  const hideHint = useSimulationStore((s) => s.hideHint);
  const actionRecorder = useSimulationStore((s) => s.actionRecorder);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionCountRef = useRef(0);
  const hintShownForStepRef = useRef<string | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Don't restart timer if hint already shown for this step
    if (currentStep && hintShownForStepRef.current === currentStep.id) return;

    if (currentStep) {
      timerRef.current = setTimeout(() => {
        showHint();
        hintShownForStepRef.current = currentStep.id;
      }, currentStep.hintDelayMs || 15000);
    }
  }, [currentStep, showHint]);

  // Start timer when step changes
  useEffect(() => {
    hintShownForStepRef.current = null;
    hideHint();
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep?.id, hideHint, startTimer]);

  // Only reset timer on "meaningful" actions (shortcuts, clicks on simulation elements)
  // Ignore mouse moves and rapid successive actions
  useEffect(() => {
    const actionCount = actionRecorder.actions.length;
    if (actionCount > lastActionCountRef.current) {
      const latestAction = actionRecorder.actions[actionCount - 1];
      lastActionCountRef.current = actionCount;

      // Only reset for meaningful actions, not every mouse event
      if (latestAction && ['shortcut', 'double-click', 'type'].includes(latestAction.type)) {
        if (!hintShownForStepRef.current) {
          startTimer();
        }
      }
    }
  }, [actionRecorder.actions.length, startTimer]);

  return { resetTimer: startTimer };
}
