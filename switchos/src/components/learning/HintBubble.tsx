'use client';

import React from 'react';

interface HintBubbleProps {
  hint: string;
  visible: boolean;
}

export default function HintBubble({ hint, visible }: HintBubbleProps) {
  if (!visible) return null;

  return (
    <div
      className="mt-3 p-3 rounded-lg border border-amber-200 transition-all duration-500 animate-fadeIn"
      style={{ background: 'rgba(251, 191, 36, 0.1)' }}
    >
      <div className="flex items-start gap-2">
        <span className="text-amber-500 shrink-0">💡</span>
        <p className="text-sm text-amber-800 leading-relaxed">{hint}</p>
      </div>
    </div>
  );
}
