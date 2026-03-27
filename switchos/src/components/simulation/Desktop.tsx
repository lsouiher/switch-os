'use client';

import { useSimulationStore } from '@/store/useSimulationStore';
import { MacDesktop } from './macos';
import { WindowsDesktop } from './windows';
import { LinuxDesktop } from './linux';

export default function Desktop() {
  const osType = useSimulationStore((s) => s.osType);

  if (osType === 'linux') return <LinuxDesktop />;
  if (osType === 'windows') return <WindowsDesktop />;
  return <MacDesktop />;
}
