'use client';

import { useSimulationStore } from '@/store/useSimulationStore';
import { useEffect, useState } from 'react';

export default function TopBar() {
  const toggleSpotlight = useSimulationStore((s) => s.toggleSpotlight);
  const recordAction = useSimulationStore((s) => s.recordAction);
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleActivities = () => {
    recordAction({
      type: 'click',
      target: { elementType: 'menu-bar' },
      data: { text: 'activities' },
    });
    toggleSpotlight();
  };

  return (
    <div
      className="absolute top-0 left-0 right-0 h-7 flex items-center px-3 z-[9999]"
      style={{
        background: '#1a1a1a',
        fontFamily: '"Ubuntu", "Cantarell", sans-serif',
        fontSize: '13px',
        color: '#fff',
      }}
    >
      {/* Activities button */}
      <button
        className="px-3 py-0.5 hover:bg-white/10 rounded text-sm font-medium"
        onClick={handleActivities}
      >
        Activities
      </button>

      {/* Center: Clock */}
      <div className="flex-1" />
      <span className="text-xs font-medium">{time}</span>
      <div className="flex-1" />

      {/* Right: System tray */}
      <div className="flex items-center gap-2.5 text-xs">
        <span aria-label="Wi-Fi">📶</span>
        <span aria-label="Sound">🔊</span>
        <span aria-label="Power">⏻</span>
      </div>
    </div>
  );
}
