'use client';

import { useSimulationStore } from '@/store/useSimulationStore';
import { MacDesktop } from './macos';
import { WindowsDesktop } from './windows';

export default function Desktop() {
  const osType = useSimulationStore((s) => s.osType);

  if (osType === 'windows') return <WindowsDesktop />;
  return <MacDesktop />;
}
